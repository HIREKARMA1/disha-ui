'use client';

import { useCallback, useEffect, useRef } from 'react';

/** Snapshots captured per round (not per whole exam). */
export const SNAPSHOTS_PER_ROUND = 4;
const STORAGE_PREFIX = 'disha-proctor-schedule-v2-';
const TICK_MS = 3000;
/** Fractions of the round window at which to capture. */
const CAPTURE_FRACTIONS = [0.12, 0.35, 0.58, 0.82];

type ScheduleState = {
  roundNumber: number;
  scheduledAt: number[];
  captured: number[]; // slot 1..4 within the round
};

function storageKey(attemptId: string, roundNumber: number) {
  return `${STORAGE_PREFIX}${attemptId}-r${roundNumber}`;
}

async function captureVideoFrame(video: HTMLVideoElement): Promise<Blob | null> {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.videoWidth <= 0) {
    return null;
  }
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b && b.size > 500 ? b : null), 'image/jpeg', 0.72);
  });
}

/**
 * Spread 4 capture times across the round window.
 * Hard-caps at examEndMs so we never schedule past the overall exam end.
 */
function buildRoundSchedule(
  roundDurationMs: number,
  examEndMs: number | null
): number[] {
  const now = Date.now();
  const minWindow = 45 * 1000; // at least 45s so early submits still get spaced attempts
  let windowMs = Math.max(roundDurationMs || 0, minWindow);
  if (examEndMs != null) {
    const untilExamEnd = Math.max(examEndMs - now, 15 * 1000);
    windowMs = Math.min(windowMs, untilExamEnd);
  }
  return CAPTURE_FRACTIONS.map((f) => Math.round(now + windowMs * f));
}

export function useProctorSnapshots(options: {
  attemptId: string | null;
  active: boolean;
  roundNumber: number | null;
  /** Expected length of the current round in ms (from round.duration_minutes). */
  roundDurationMs: number | null;
  examEndMs: number | null;
  getVideoElement: () => HTMLVideoElement | null;
  onUpload: (slot: number, blob: Blob, roundNumber: number) => Promise<void>;
}) {
  const {
    attemptId,
    active,
    roundNumber,
    roundDurationMs,
    examEndMs,
    getVideoElement,
    onUpload,
  } = options;
  const uploadingRef = useRef(false);
  const scheduleRef = useRef<ScheduleState | null>(null);
  const onUploadRef = useRef(onUpload);
  onUploadRef.current = onUpload;
  const getVideoRef = useRef(getVideoElement);
  getVideoRef.current = getVideoElement;

  // (Re)build schedule when entering a round
  useEffect(() => {
    if (!attemptId || !active || !roundNumber || roundNumber < 1) return;

    try {
      const raw = sessionStorage.getItem(storageKey(attemptId, roundNumber));
      if (raw) {
        const parsed = JSON.parse(raw) as ScheduleState;
        if (
          parsed.roundNumber === roundNumber &&
          Array.isArray(parsed.scheduledAt) &&
          parsed.scheduledAt.length === SNAPSHOTS_PER_ROUND
        ) {
          scheduleRef.current = parsed;
          return;
        }
      }
    } catch {
      /* rebuild */
    }

    const duration =
      typeof roundDurationMs === 'number' && roundDurationMs > 0
        ? roundDurationMs
        : 10 * 60 * 1000;
    scheduleRef.current = {
      roundNumber,
      scheduledAt: buildRoundSchedule(duration, examEndMs),
      captured: [],
    };
    sessionStorage.setItem(
      storageKey(attemptId, roundNumber),
      JSON.stringify(scheduleRef.current)
    );
  }, [attemptId, active, roundNumber, roundDurationMs, examEndMs]);

  const captureSlot = useCallback(
    async (slot: number, round: number): Promise<boolean> => {
      const video = getVideoRef.current();
      if (!video) return false;
      const blob = await captureVideoFrame(video);
      if (!blob) return false;
      await onUploadRef.current(slot, blob, round);
      return true;
    },
    []
  );

  const persist = useCallback(
    (attempt: string, state: ScheduleState) => {
      sessionStorage.setItem(storageKey(attempt, state.roundNumber), JSON.stringify(state));
    },
    []
  );

  const tick = useCallback(async () => {
    if (!attemptId || !active || !scheduleRef.current || uploadingRef.current) return;
    if (!roundNumber || scheduleRef.current.roundNumber !== roundNumber) return;

    const now = Date.now();
    const state = scheduleRef.current;
    for (let i = 0; i < SNAPSHOTS_PER_ROUND; i++) {
      const slot = i + 1;
      if (state.captured.includes(slot)) continue;
      if (state.scheduledAt[i] > now) continue;

      uploadingRef.current = true;
      try {
        const ok = await captureSlot(slot, roundNumber);
        if (ok) {
          state.captured.push(slot);
          persist(attemptId, state);
        }
      } catch {
        /* retry next tick */
      } finally {
        uploadingRef.current = false;
      }
      break; // one upload per tick
    }
  }, [attemptId, active, roundNumber, captureSlot, persist]);

  useEffect(() => {
    if (!active || !attemptId || !roundNumber) return;
    const id = window.setInterval(() => void tick(), TICK_MS);
    // Immediate check in case a scheduled time already passed
    void tick();
    return () => window.clearInterval(id);
  }, [active, attemptId, roundNumber, tick]);

  /**
   * Capture any remaining slots for the current round right now
   * (used when the candidate submits the round / exam early).
   */
  const flushRemaining = useCallback(async () => {
    if (!attemptId || !roundNumber || !scheduleRef.current) return;
    if (scheduleRef.current.roundNumber !== roundNumber) return;

    const state = scheduleRef.current;
    for (let i = 0; i < SNAPSHOTS_PER_ROUND; i++) {
      const slot = i + 1;
      if (state.captured.includes(slot)) continue;

      // Wait briefly if a tick upload is in flight
      let waits = 0;
      while (uploadingRef.current && waits < 20) {
        await new Promise((r) => setTimeout(r, 100));
        waits += 1;
      }

      uploadingRef.current = true;
      try {
        // Retry a few times if the video frame isn't ready
        let ok = false;
        for (let attempt = 0; attempt < 3 && !ok; attempt++) {
          ok = await captureSlot(slot, roundNumber);
          if (!ok) await new Promise((r) => setTimeout(r, 200));
        }
        if (ok) {
          state.captured.push(slot);
          persist(attemptId, state);
        }
      } catch {
        /* continue remaining slots */
      } finally {
        uploadingRef.current = false;
      }
    }
  }, [attemptId, roundNumber, captureSlot, persist]);

  return { flushRemaining };
}
