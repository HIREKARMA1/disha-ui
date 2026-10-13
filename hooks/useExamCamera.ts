'use client';

import { useCallback, useRef, useState, type RefCallback } from 'react';
import toast from 'react-hot-toast';

export type ExamCameraStatus =
  | 'idle'
  | 'requesting'
  | 'active'
  | 'denied'
  | 'unavailable'
  | 'lost';

export type StartCameraOptions = {
  /** When true, request microphone together with camera (permission priming for Soft Skills). */
  audio?: boolean;
};

export function useExamCamera() {
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  /** Always-mounted capture surface used by proctoring snapshots (independent of UI phase). */
  const captureVideoRefInternal = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const micReadyRef = useRef(false);
  const [status, setStatus] = useState<ExamCameraStatus>('idle');
  const [micReady, setMicReady] = useState(false);

  const markMicReady = useCallback((ready: boolean) => {
    micReadyRef.current = ready;
    setMicReady(ready);
  }, []);

  const bindStreamToVideo = useCallback(async (video: HTMLVideoElement | null) => {
    if (!video) return;
    const stream = streamRef.current;
    if (!stream) {
      video.srcObject = null;
      return;
    }
    if (video.srcObject !== stream) video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    try {
      await video.play();
    } catch (err) {
      console.warn('Exam camera video.play() failed', err);
    }
  }, []);

  const rebindAllVideos = useCallback(async () => {
    await Promise.all([
      bindStreamToVideo(captureVideoRefInternal.current),
      bindStreamToVideo(previewVideoRef.current),
    ]);
  }, [bindStreamToVideo]);

  const captureVideoRef: RefCallback<HTMLVideoElement> = useCallback(
    (node) => {
      captureVideoRefInternal.current = node;
      void bindStreamToVideo(node);
    },
    [bindStreamToVideo]
  );

  const videoRef: RefCallback<HTMLVideoElement> = useCallback(
    (node) => {
      previewVideoRef.current = node;
      void bindStreamToVideo(node);
    },
    [bindStreamToVideo]
  );

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (captureVideoRefInternal.current) captureVideoRefInternal.current.srcObject = null;
    if (previewVideoRef.current) previewVideoRef.current.srcObject = null;
    setStatus('idle');
    markMicReady(false);
  }, [markMicReady]);

  const startCamera = useCallback(
    async (options?: StartCameraOptions): Promise<boolean> => {
      const wantAudio = Boolean(options?.audio);

      if (status === 'active' && streamRef.current?.active) {
        // Already have camera; if mic was requested and not yet primed, request audio once.
        if (wantAudio && !micReadyRef.current) {
          try {
            const audioStream = await navigator.mediaDevices.getUserMedia({
              audio: true,
              video: false,
            });
            audioStream.getTracks().forEach((t) => t.stop());
            markMicReady(true);
          } catch {
            markMicReady(false);
            toast.error('Microphone access is required for speaking questions.');
            return false;
          }
        }
        await rebindAllVideos();
        return true;
      }

      setStatus('requesting');
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setStatus('unavailable');
        toast.error('Camera is not supported in this browser.');
        return false;
      }
      try {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 },
          },
          audio: wantAudio,
        });

        // Stop audio tracks immediately after permission grant so we are not
        // recording during the exam; browser retains mic permission for SpeechRecognition.
        if (wantAudio) {
          stream.getAudioTracks().forEach((track) => track.stop());
          markMicReady(true);
        } else {
          markMicReady(false);
        }

        streamRef.current = stream;
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) videoTrack.onended = () => setStatus('lost');
        setStatus('active');
        await rebindAllVideos();
        return true;
      } catch (err: unknown) {
        const name = (err as { name?: string })?.name ?? '';
        markMicReady(false);
        if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
          setStatus('unavailable');
          toast.error(
            wantAudio
              ? 'No camera or microphone found. Connect devices and try again.'
              : 'No camera found. Please connect a webcam and try again.',
          );
        } else {
          setStatus('denied');
          toast.error(
            wantAudio
              ? 'Camera and microphone access are required to take this assessment.'
              : 'Camera access is required to take this assessment.',
          );
        }
        return false;
      }
    },
    [status, rebindAllVideos, markMicReady],
  );

  /** Prefer the persistent capture surface; fall back to visible preview. */
  const getVideoElement = useCallback(
    () => captureVideoRefInternal.current || previewVideoRef.current,
    []
  );

  return {
    videoRef,
    captureVideoRef,
    getVideoElement,
    status,
    startCamera,
    stopCamera,
    isCameraActive: status === 'active',
    micReady,
  };
}
