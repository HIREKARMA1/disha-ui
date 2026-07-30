'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

function readFullscreenState(): boolean {
  if (typeof document === 'undefined') return false;
  return Boolean(
    document.fullscreenElement ||
      (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement
  );
}

export async function exitExamFullscreen(): Promise<void> {
  if (typeof document === 'undefined' || !readFullscreenState()) return;
  try {
    const doc = document as Document & { webkitExitFullscreen?: () => Promise<void> };
    if (doc.exitFullscreen) await doc.exitFullscreen();
    else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
  } catch {
    /* ignore */
  }
}

export function useExamFullscreen(options?: { autoEnter?: boolean; active?: boolean }) {
  const autoEnter = options?.autoEnter !== false;
  const active = options?.active ?? autoEnter;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const autoAttemptedRef = useRef(false);

  useEffect(() => {
    const sync = () => setIsFullscreen(readFullscreenState());
    sync();
    const events = ['fullscreenchange', 'webkitfullscreenchange'];
    events.forEach((event) => document.addEventListener(event, sync));
    return () => events.forEach((event) => document.removeEventListener(event, sync));
  }, []);

  const enterFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
      };
      if (!readFullscreenState()) {
        if (elem.requestFullscreen) await elem.requestFullscreen();
        else if (elem.webkitRequestFullscreen) await elem.webkitRequestFullscreen();
      }
      setTimeout(() => setIsFullscreen(readFullscreenState()), 100);
    } catch {
      /* blocked without gesture */
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    await exitExamFullscreen();
    setTimeout(() => setIsFullscreen(readFullscreenState()), 100);
  }, []);

  useEffect(() => {
    if (!autoEnter || !active || autoAttemptedRef.current) return;
    autoAttemptedRef.current = true;
    const t = setTimeout(() => void enterFullscreen(), 120);
    const once = () => {
      document.removeEventListener('pointerdown', once);
      document.removeEventListener('keydown', once);
      void enterFullscreen();
    };
    document.addEventListener('pointerdown', once, { once: true });
    document.addEventListener('keydown', once, { once: true });
    return () => clearTimeout(t);
  }, [autoEnter, active, enterFullscreen]);

  useEffect(() => {
    if (!active) return;
    // Best-effort only: OS PrintScreen / Snipping Tool / screen recorders cannot be
    // fully blocked from a web page. These handlers deter in-page capture shortcuts.
    const blockContext = (e: Event) => e.preventDefault();
    const blockClipboard = (e: Event) => e.preventDefault();
    const blockDrag = (e: Event) => e.preventDefault();
    const blockCaptureKeys = (e: KeyboardEvent) => {
      const key = e.key;
      const lower = key.toLowerCase();
      const meta = e.ctrlKey || e.metaKey;

      // PrintScreen / Meta+PrintScreen
      if (key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        return;
      }
      // Print dialog
      if (meta && lower === 'p') {
        e.preventDefault();
        return;
      }
      // Common screenshot / save-as shortcuts the page can see
      if (meta && e.shiftKey && (lower === 's' || lower === '3' || lower === '4' || lower === '5')) {
        e.preventDefault();
        return;
      }
      // DevTools / view-source (deterrent)
      if (meta && (lower === 'u' || lower === 's')) {
        e.preventDefault();
      }
      if (e.key === 'F12') {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', blockContext);
    document.addEventListener('copy', blockClipboard);
    document.addEventListener('cut', blockClipboard);
    document.addEventListener('dragstart', blockDrag);
    document.addEventListener('keydown', blockCaptureKeys, true);
    return () => {
      document.removeEventListener('contextmenu', blockContext);
      document.removeEventListener('copy', blockClipboard);
      document.removeEventListener('cut', blockClipboard);
      document.removeEventListener('dragstart', blockDrag);
      document.removeEventListener('keydown', blockCaptureKeys, true);
    };
  }, [active]);

  return { isFullscreen, enterFullscreen, exitFullscreen };
}
