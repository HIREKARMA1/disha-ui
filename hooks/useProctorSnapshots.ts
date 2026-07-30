'use client';

import { useCallback, useEffect, useRef } from 'react';

const TOTAL_SNAPSHOTS = 4;
const STORAGE_PREFIX = 'disha-proctor-schedule-';
const TICK_MS = 4000;

type ScheduleState = {
  scheduledAt: number[];
  captured: number[];
};

function storageKey(attemptId: string) {
  return `${STORAGE_PREFIX}${attemptId}`;
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

function buildSchedule(examEndMs: number): number[] {
  const now = Date.now();
  const end = Math.max(examEndMs, now + 3 * 60 * 1000);
  const remaining = Math.max(end - now, 3 * 60 * 1000);
  return [0.12, 0.35, 0.58, 0.82].map((f) => Math.round(now + remaining * f));
}

export function useProctorSnapshots(options: {
  attemptId: string | null;
  active: boolean;
  getVideoElement: () => HTMLVideoElement | null;
  examEndMs: number | null;
  onUpload: (index: number, blob: Blob) => Promise<void>;
}) {
  const { attemptId, active, getVideoElement, examEndMs, onUpload } = options;
  const uploadingRef = useRef(false);
  const scheduleRef = useRef<ScheduleState | null>(null);

  useEffect(() => {
    if (!attemptId || !active || !examEndMs) return;
    try {
      const raw = sessionStorage.getItem(storageKey(attemptId));
      if (raw) {
        scheduleRef.current = JSON.parse(raw) as ScheduleState;
      }
    } catch {
      scheduleRef.current = null;
    }
    if (!scheduleRef.current || scheduleRef.current.scheduledAt.length !== TOTAL_SNAPSHOTS) {
      scheduleRef.current = { scheduledAt: buildSchedule(examEndMs), captured: [] };
      sessionStorage.setItem(storageKey(attemptId), JSON.stringify(scheduleRef.current));
    }
  }, [attemptId, active, examEndMs]);

  const tick = useCallback(async () => {
    if (!attemptId || !active || !scheduleRef.current || uploadingRef.current) return;
    const now = Date.now();
    const state = scheduleRef.current;
    for (let i = 0; i < TOTAL_SNAPSHOTS; i++) {
      const index = i + 1;
      if (state.captured.includes(index)) continue;
      if (state.scheduledAt[i] > now) continue;
      const video = getVideoElement();
      if (!video) return;
      const blob = await captureVideoFrame(video);
      if (!blob) return;
      uploadingRef.current = true;
      try {
        await onUpload(index, blob);
        state.captured.push(index);
        sessionStorage.setItem(storageKey(attemptId), JSON.stringify(state));
      } catch {
        /* retry next tick */
      } finally {
        uploadingRef.current = false;
      }
      break;
    }
  }, [attemptId, active, getVideoElement, onUpload]);

  useEffect(() => {
    if (!active || !attemptId) return;
    const id = window.setInterval(() => void tick(), TICK_MS);
    return () => window.clearInterval(id);
  }, [active, attemptId, tick]);
}
