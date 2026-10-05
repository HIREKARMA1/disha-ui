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
  chunkMs?: number;
  onChunk?: (chunk: ScreenRecordingChunk) => void | Promise<void>;
  onLifecycleEvent?: (
    event: ScreenRecordingLifecycleEvent,
    details?: Record<string, unknown>
  ) => void;
};

const DEFAULT_CHUNK_MS = 8000;
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

export function useScreenRecording({
  active,
  stream,
  chunkMs = DEFAULT_CHUNK_MS,
  onChunk,
  onLifecycleEvent,
}: UseScreenRecordingOptions) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const sequenceRef = useRef(0);
  const activeRef = useRef(active);
  const chunkStartedAtRef = useRef<string | null>(null);
  const onChunkRef = useRef(onChunk);
  const onLifecycleEventRef = useRef(onLifecycleEvent);
  const [status, setStatus] = useState<ScreenRecordingStatus>('idle');
  const [mimeType, setMimeType] = useState('');
  const [chunkCount, setChunkCount] = useState(0);
  const [bytesRecorded, setBytesRecorded] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [networkOnline, setNetworkOnline] = useState(true);

  onChunkRef.current = onChunk;
  onLifecycleEventRef.current = onLifecycleEvent;
  activeRef.current = active;

  const emit = useCallback(
    (event: ScreenRecordingLifecycleEvent, details?: Record<string, unknown>) => {
      onLifecycleEventRef.current?.(event, details);
    },
    []
  );

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    if (recorder.state === 'inactive') {
      recorderRef.current = null;
      setStatus('stopped');
      return;
    }
    setStatus('stopping');
    try {
      recorder.requestData();
    } catch {
      /* requestData is best-effort before stop */
    }
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
    // Do NOT reset sequenceRef here: after a screen-share restart the new
    // recorder must continue chunk indexes where the previous one stopped,
    // or chunk uploads collide with the (attempt_id, chunk_index) unique key.
    chunkStartedAtRef.current = new Date().toISOString();

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(
        stream,
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
    recorder.onstart = () => {
      setStatus('recording');
      emit('started', { mimeType: recorder.mimeType || selectedMimeType, chunkMs });
    };
    recorder.onstop = () => {
      recorderRef.current = null;
      setStatus('stopped');
      emit('stopped', { chunks: sequenceRef.current });
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
      const now = new Date().toISOString();
      const chunk: ScreenRecordingChunk = {
        blob: event.data,
        sequence: sequenceRef.current,
        startedAt: chunkStartedAtRef.current || now,
        endedAt: now,
        mimeType: recorder.mimeType || selectedMimeType || event.data.type,
      };
      sequenceRef.current += 1;
      chunkStartedAtRef.current = now;
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

    try {
      recorder.start(Math.max(5000, Math.min(chunkMs, 10000)));
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Could not start screen recording.';
      recorderRef.current = null;
      setStatus('error');
      setLastError(message);
      emit('error', { message });
    }

    return () => {
      stopRecording();
    };
  }, [active, chunkMs, emit, stopRecording, stream]);

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
