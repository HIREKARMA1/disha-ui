'use client';

import { config } from './config';
import { getAccessToken } from './authSession';

export const PROCTORING_EVENT_TYPES = [
  'SCREEN_SHARE_STARTED',
  'SCREEN_SHARE_STOPPED',
  'SCREEN_SHARE_RESTARTED',
  'ASSESSMENT_STARTED',
  'ASSESSMENT_SUBMITTED',
  'FULLSCREEN_EXIT',
  'TAB_SWITCH',
  'WINDOW_BLUR',
  'NETWORK_DISCONNECTED',
  'NETWORK_RECONNECTED',
] as const;

export type ProctoringEventType = (typeof PROCTORING_EVENT_TYPES)[number];

export const HIGH_PRIORITY_EVENT_TYPES: ReadonlySet<ProctoringEventType> =
  new Set<ProctoringEventType>(['SCREEN_SHARE_STOPPED']);

export type ProctoringEventMetadata = Record<string, unknown>;

type QueuedProctoringEvent = {
  event_type: ProctoringEventType;
  occurred_at: string;
  metadata?: ProctoringEventMetadata;
};

export type ProctoringEventReporterOptions = {
  assessmentId: string;
  attemptId: string;
  flushIntervalMs?: number;
  maxBatchSize?: number;
  minIntervalMs?: number;
  storageKey?: string;
};

export type ProctoringEventReporter = {
  report: (
    eventType: ProctoringEventType,
    metadata?: ProctoringEventMetadata,
    options?: { priority?: boolean }
  ) => void;
  flush: () => Promise<void>;
  destroy: () => void;
};

const DEFAULT_FLUSH_INTERVAL_MS = 5000;
const DEFAULT_MAX_BATCH_SIZE = 10;
const DEFAULT_MIN_INTERVAL_MS = 5000;
const MAX_BATCH = 50;

function endpointUrl(assessmentId: string, attemptId: string): string {
  return `${config.api.fullUrl}/assessments/${assessmentId}/attempts/${attemptId}/proctoring/events`;
}

export function createProctoringEventReporter({
  assessmentId,
  attemptId,
  flushIntervalMs = DEFAULT_FLUSH_INTERVAL_MS,
  maxBatchSize = DEFAULT_MAX_BATCH_SIZE,
  minIntervalMs = DEFAULT_MIN_INTERVAL_MS,
  storageKey,
}: ProctoringEventReporterOptions): ProctoringEventReporter {
  const bufferKey =
    storageKey ??
    `proctoring-events:${assessmentId}:${attemptId}`;

  let queue: QueuedProctoringEvent[] = [];
  let lastEnqueuedAt: Record<string, number> = {};
  let flushTimer: number | null = null;
  let flushing: Promise<void> = Promise.resolve();
  let destroyed = false;

  const loadBuffer = () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.sessionStorage.getItem(bufferKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        queue = queue.concat(
          parsed.filter(
            (e): e is QueuedProctoringEvent =>
              e &&
              typeof e === 'object' &&
              (PROCTORING_EVENT_TYPES as readonly string[]).includes(e.event_type)
          )
        );
      }
    } catch {
      /* corrupted buffer — drop it */
    }
  };

  const persistBuffer = () => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(bufferKey, JSON.stringify(queue.slice(-MAX_BATCH)));
    } catch {
      /* storage full or unavailable — keep in memory */
    }
  };

  const clearBuffer = () => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.removeItem(bufferKey);
    } catch {
      /* ignore */
    }
  };

  const postBatch = async (events: QueuedProctoringEvent[], keepalive: boolean) => {
    const token = getAccessToken();
    if (!token) throw new Error('No auth token available for proctoring event report.');

    const response = await fetch(endpointUrl(assessmentId, attemptId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ events }),
      // keepalive lets the request outlive the page during unload; it
      // forbids custom readable bodies and large payloads, which is fine here.
      keepalive,
    });
    if (!response.ok) {
      throw new Error(`Proctoring event report failed: ${response.status}`);
    }
  };

  const flushOnce = async () => {
    if (queue.length === 0) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    const batch = queue.slice(0, MAX_BATCH);
    try {
      await postBatch(batch, false);
      queue = queue.slice(batch.length);
      if (queue.length === 0) clearBuffer();
      else persistBuffer();
    } catch {
      // Leave the queue intact; the next flush (interval, online, or the
      // next high-priority event) retries.
    }
  };

  const scheduleFlush = (delay: number) => {
    if (destroyed || typeof window === 'undefined') return;
    if (flushTimer !== null) window.clearTimeout(flushTimer);
    flushTimer = window.setTimeout(() => {
      flushTimer = null;
      flushing = flushing.then(flushOnce);
    }, delay);
  };

  const flush = async (): Promise<void> => {
    await flushing;
    await flushOnce();
  };

  const report: ProctoringEventReporter['report'] = (eventType, metadata, options) => {
    if (destroyed) return;

    const now = Date.now();
    const priority = options?.priority ?? HIGH_PRIORITY_EVENT_TYPES.has(eventType);
    const last = lastEnqueuedAt[eventType] ?? 0;

    // Throttle noisy repeated browser events (blur storms, double-fires).
    // High-priority events always get through.
    if (!priority && now - last < minIntervalMs) return;
    lastEnqueuedAt[eventType] = now;

    queue.push({
      event_type: eventType,
      occurred_at: new Date(now).toISOString(),
      ...(metadata ? { metadata } : {}),
    });
    persistBuffer();

    if (priority) {
      // Flush immediately so a screen-share stop reaches the server even if
      // the tab is closed right after.
      scheduleFlush(0);
    } else if (queue.length >= maxBatchSize) {
      scheduleFlush(0);
    } else if (flushTimer === null) {
      scheduleFlush(flushIntervalMs);
    }
  };

  const handleOnline = () => {
    flushing = flushing.then(flushOnce);
  };

  const handlePageHide = () => {
    if (queue.length === 0 || typeof navigator === 'undefined' || !navigator.onLine) return;
    // Best-effort: keepalive survives page unload; failures are unrecoverable
    // here, so ignore the result.
    void postBatch(queue.slice(0, MAX_BATCH), true)
      .then(() => {
        queue = [];
        clearBuffer();
      })
      .catch(() => {
        /* queue stays in sessionStorage for the next session */
      });
  };

  loadBuffer();

  if (typeof window !== 'undefined') {
    window.addEventListener('online', handleOnline);
    window.addEventListener('pagehide', handlePageHide);
    if (queue.length > 0) scheduleFlush(0);
  }

  return {
    report,
    flush,
    destroy: () => {
      destroyed = true;
      if (flushTimer !== null && typeof window !== 'undefined') {
        window.clearTimeout(flushTimer);
        flushTimer = null;
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('pagehide', handlePageHide);
      }
      persistBuffer();
    },
  };
}
