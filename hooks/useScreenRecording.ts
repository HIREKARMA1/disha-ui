'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type ScreenRecordingStatus =
  | 'idle'
  | 'unsupported'
  | 'starting'
  | 'recording'
  | 'stopping'
  | 'stopped'
  | 'error';

export type ScreenRecordingLifecycleEvent =
  | 'started'
  | 'stopped'
  | 'chunk'
  | 'screen_stopped'
  | 'error'
  | 'offline'
  | 'online'
  | 'unsupported';

export type ScreenRecordingChunk = {
  blob: Blob;
  sequence: number;
  startedAt: string;
  endedAt: string;
  mimeType: string;
};

type UseScreenRecordingOptions = {
  active: boolean;
  stream: MediaStream | null;
  /** Total exam duration in ms — used to size up to 4 playable segments. */
  examDurationMs?: number | null;
  /** Hard cap on playable segments (default 4). */
  maxSegments?: number;
  onChunk?: (chunk: ScreenRecordingChunk) => void | Promise<void>;
  onLifecycleEvent?: (
    event: ScreenRecordingLifecycleEvent,
    details?: Record<string, unknown>
  ) => void;
};

/** Max independently playable clips covering the full exam. */
export const MAX_SCREEN_RECORDING_SEGMENTS = 4;
const MIN_SEGMENT_MS = 30_000;
const MIME_TYPE_CANDIDATES = [
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
  'video/mp4',
];

function chooseMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  return (
    MIME_TYPE_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) ||
    ''
  );
}

function resolveSegmentMs(examDurationMs?: number | null): number {
  const duration =
    typeof examDurationMs === 'number' && examDurationMs > 0
      ? examDurationMs
      : 60 * 60 * 1000;
  return Math.max(MIN_SEGMENT_MS, Math.floor(duration / MAX_SCREEN_RECORDING_SEGMENTS));
}

/**
 * Records the screen as at most 4 complete, independently playable files.
 *
 * Uses stop+restart (not MediaRecorder timeslices) so each uploaded blob is a
 * full WebM/MP4 with headers — timeslice fragments after the first are not
 * playable in <video>.
 */
export function useScreenRecording({
  active,
  stream,
  examDurationMs = null,
  maxSegments = MAX_SCREEN_RECORDING_SEGMENTS,
  onChunk,
  onLifecycleEvent,
}: UseScreenRecordingOptions) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const sequenceRef = useRef(0);
  const activeRef = useRef(active);
  const streamRef = useRef(stream);
  const segmentStartedAtRef = useRef<string | null>(null);
  const segmentTimerRef = useRef<number | null>(null);
  const rotatingRef = useRef(false);
  const finalStopRef = useRef(false);
  const startSegmentRef = useRef<() => void>(() => {});
  const onChunkRef = useRef(onChunk);
  const onLifecycleEventRef = useRef(onLifecycleEvent);
  const segmentMsRef = useRef(resolveSegmentMs(examDurationMs));
  const maxSegmentsRef = useRef(maxSegments);

  const [status, setStatus] = useState<ScreenRecordingStatus>('idle');
  const [mimeType, setMimeType] = useState('');
  const [chunkCount, setChunkCount] = useState(0);
  const [bytesRecorded, setBytesRecorded] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [networkOnline, setNetworkOnline] = useState(true);

  onChunkRef.current = onChunk;
  onLifecycleEventRef.current = onLifecycleEvent;
  activeRef.current = active;
  streamRef.current = stream;
  segmentMsRef.current = resolveSegmentMs(examDurationMs);
  maxSegmentsRef.current = Math.max(1, Math.min(maxSegments, MAX_SCREEN_RECORDING_SEGMENTS));

  const emit = useCallback(
    (event: ScreenRecordingLifecycleEvent, details?: Record<string, unknown>) => {
      onLifecycleEventRef.current?.(event, details);
    },
    []
  );

  const clearSegmentTimer = useCallback(() => {
    if (segmentTimerRef.current != null) {
      window.clearTimeout(segmentTimerRef.current);
      segmentTimerRef.current = null;
    }
  }, []);

  const stopRecorderInternal = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    if (recorder.state === 'inactive') {
      recorderRef.current = null;
      return;
    }
    setStatus('stopping');
    try {
      recorder.stop();
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Could not stop screen recording.';
      setLastError(message);
      setStatus('error');
      emit('error', { message });
      recorderRef.current = null;
    }
  }, [emit]);

  const stopRecording = useCallback(() => {
    finalStopRef.current = true;
    rotatingRef.current = false;
    clearSegmentTimer();
    stopRecorderInternal();
  }, [clearSegmentTimer, stopRecorderInternal]);

  const startSegment = useCallback(() => {
    if (!activeRef.current) return;
    const streamNow = streamRef.current;
    if (!streamNow || !streamNow.active) return;
    if (sequenceRef.current >= maxSegmentsRef.current) return;
    if (recorderRef.current && recorderRef.current.state !== 'inactive') return;

    if (typeof MediaRecorder === 'undefined') {
      setStatus('unsupported');
      setLastError('Screen recording is not supported in this browser.');
      emit('unsupported');
      return;
    }

    const selectedMimeType = chooseMimeType();
    setStatus('starting');
    setLastError(null);
    setMimeType(selectedMimeType);
    segmentStartedAtRef.current = new Date().toISOString();
    finalStopRef.current = false;

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(
        streamNow,
        selectedMimeType ? { mimeType: selectedMimeType } : undefined
      );
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Could not start screen recording.';
      setStatus('error');
      setLastError(message);
      emit('error', { message });
      return;
    }

    recorderRef.current = recorder;
    const segmentIndex = sequenceRef.current;

    recorder.onstart = () => {
      setStatus('recording');
      emit('started', {
        mimeType: recorder.mimeType || selectedMimeType,
        segmentMs: segmentMsRef.current,
        segmentIndex,
      });
    };

    recorder.onerror = (event: Event) => {
      const error = (event as unknown as { error?: DOMException }).error;
      const message = error?.message || 'Screen recording failed.';
      setLastError(message);
      setStatus('error');
      emit('error', { message, name: error?.name });
    };

    recorder.ondataavailable = (event: BlobEvent) => {
      if (!event.data || event.data.size === 0) return;
      if (sequenceRef.current >= maxSegmentsRef.current) return;

      const now = new Date().toISOString();
      const chunk: ScreenRecordingChunk = {
        blob: event.data,
        sequence: sequenceRef.current,
        startedAt: segmentStartedAtRef.current || now,
        endedAt: now,
        mimeType: recorder.mimeType || selectedMimeType || event.data.type,
      };
      sequenceRef.current += 1;
      setChunkCount(sequenceRef.current);
      setBytesRecorded((total) => total + event.data.size);
      emit('chunk', {
        sequence: chunk.sequence,
        size: event.data.size,
        mimeType: chunk.mimeType,
      });
      Promise.resolve(onChunkRef.current?.(chunk)).catch((err: unknown) => {
        const message =
          (err as Error)?.message || 'Could not upload screen recording chunk.';
        setLastError(message);
        emit('error', {
          message,
          sequence: chunk.sequence,
          size: event.data.size,
          upload: true,
        });
      });
    };

    recorder.onstop = () => {
      recorderRef.current = null;
      clearSegmentTimer();

      const shouldRotate =
        rotatingRef.current &&
        !finalStopRef.current &&
        activeRef.current &&
        Boolean(streamRef.current?.active) &&
        sequenceRef.current < maxSegmentsRef.current;

      rotatingRef.current = false;

      if (shouldRotate) {
        // Yield so the previous recorder fully releases before restarting.
        window.setTimeout(() => startSegmentRef.current(), 50);
        return;
      }

      setStatus('stopped');
      emit('stopped', { chunks: sequenceRef.current });
    };

    try {
      // No timeslice: data is emitted only on stop → complete playable file.
      recorder.start();
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Could not start screen recording.';
      recorderRef.current = null;
      setStatus('error');
      setLastError(message);
      emit('error', { message });
      return;
    }

    // Rotate at segment boundary so we produce ≤ maxSegments complete files.
    clearSegmentTimer();
    segmentTimerRef.current = window.setTimeout(() => {
      segmentTimerRef.current = null;
      if (!activeRef.current || finalStopRef.current) return;
      if (sequenceRef.current >= maxSegmentsRef.current - 1) {
        // Last allowed segment: keep recording until exam ends (stopRecording).
        return;
      }
      rotatingRef.current = true;
      stopRecorderInternal();
    }, segmentMsRef.current);
  }, [clearSegmentTimer, emit, stopRecorderInternal]);

  startSegmentRef.current = startSegment;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setNetworkOnline(window.navigator.onLine);

    const handleOffline = () => {
      setNetworkOnline(false);
      setLastError('Network connection appears to be offline.');
      emit('offline');
    };
    const handleOnline = () => {
      setNetworkOnline(true);
      emit('online');
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [emit]);

  useEffect(() => {
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;

    const handleEnded = () => {
      emit('screen_stopped');
      stopRecording();
    };

    videoTrack.addEventListener('ended', handleEnded);
    return () => videoTrack.removeEventListener('ended', handleEnded);
  }, [emit, stopRecording, stream]);

  useEffect(() => {
    if (!active) {
      stopRecording();
      return;
    }

    if (!stream || !stream.active) return;
    if (recorderRef.current && recorderRef.current.state !== 'inactive') return;
    if (sequenceRef.current >= maxSegmentsRef.current) return;

    startSegment();

    return () => {
      // Only tear down when deactivating or stream identity changes.
      // Segment rotation manages its own stop/restart.
    };
  }, [active, stream, startSegment, stopRecording]);

  // When active flips false, stopRecording already ran above.
  useEffect(() => {
    return () => {
      clearSegmentTimer();
      finalStopRef.current = true;
      rotatingRef.current = false;
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        try {
          recorder.stop();
        } catch {
          /* unmount */
        }
      }
    };
  }, [clearSegmentTimer]);

  return {
    status,
    mimeType,
    chunkCount,
    bytesRecorded,
    lastError,
    networkOnline,
    isRecording: status === 'recording',
    stopRecording,
  };
}
