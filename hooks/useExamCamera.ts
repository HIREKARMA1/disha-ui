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

export function useExamCamera() {
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<ExamCameraStatus>('idle');

  const bindStreamToVideo = useCallback(async (video: HTMLVideoElement | null) => {
    if (!video) return;
    const stream = streamRef.current;
    if (!stream) {
      video.srcObject = null;
      return;
    }
    if (video.srcObject !== stream) video.srcObject = stream;
    video.muted = true;
    try {
      await video.play();
    } catch {
      /* autoplay */
    }
  }, []);

  const videoRef: RefCallback<HTMLVideoElement> = useCallback(
    (node) => {
      videoElementRef.current = node;
      void bindStreamToVideo(node);
    },
    [bindStreamToVideo]
  );

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoElementRef.current) videoElementRef.current.srcObject = null;
    setStatus('idle');
  }, []);

  const startCamera = useCallback(async (): Promise<boolean> => {
    if (status === 'active' && streamRef.current?.active) {
      await bindStreamToVideo(videoElementRef.current);
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
        video: { facingMode: 'user', width: { ideal: 640, max: 1280 }, height: { ideal: 480, max: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) videoTrack.onended = () => setStatus('lost');
      setStatus('active');
      await bindStreamToVideo(videoElementRef.current);
      return true;
    } catch (err: unknown) {
      const name = (err as { name?: string })?.name ?? '';
      if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setStatus('unavailable');
        toast.error('No camera found. Please connect a webcam and try again.');
      } else {
        setStatus('denied');
        toast.error('Camera access is required to take this assessment.');
      }
      return false;
    }
  }, [status, bindStreamToVideo]);

  const getVideoElement = useCallback(() => videoElementRef.current, []);

  return {
    videoRef,
    getVideoElement,
    status,
    startCamera,
    stopCamera,
    isCameraActive: status === 'active',
  };
}
