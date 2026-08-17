'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useExamFullscreen, exitExamFullscreen } from '@/hooks/useExamFullscreen';
import { useExamCamera } from '@/hooks/useExamCamera';
import { useProctorSnapshots } from '@/hooks/useProctorSnapshots';
import {
  Loader2,
  AlertTriangle,
  AlertCircle,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  User,
  Video,
  VideoOff,
  Volume2,
  Mic,
  List,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CodingWorkspace } from '@/components/assessments/CodingWorkspace';
import { detectExamDevice } from '@/lib/examDevice';

type Phase = 'camera' | 'exam' | 'round_break' | 'warning' | 'ending';

type ExamQuestion = {
  id: string;
  round_id: string;
  round_number: number;
  round_type: string;
  question_text: string;
  question_type: string;
  options?: string[];
  question_order: number;
  points: number;
  question_metadata?: any;
  coding_submitted?: boolean;
  coding_submission?: any;
};

type Props = {
  assessmentId: string;
  attemptId: string;
};

type ConfirmModal =
  | null
  | { kind: 'submit'; unanswered: number; codingUnsubmitted?: number }
  | { kind: 'round'; unanswered: number };

function cameraStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'Camera on';
    case 'requesting':
      return 'Starting camera…';
    case 'denied':
      return 'Camera blocked';
    case 'unavailable':
      return 'No camera found';
    case 'lost':
      return 'Camera disconnected';
    default:
      return 'Camera off';
  }
}

function splitTime(seconds: number | null) {
  if (seconds === null || seconds < 0) {
    return { hours: '--', minutes: '--', seconds: '--' };
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: secs.toString().padStart(2, '0'),
  };
}

function sortQuestions(qs: ExamQuestion[]): ExamQuestion[] {
  return [...qs].sort((a, b) => {
    if (a.round_number !== b.round_number) return a.round_number - b.round_number;
    return (a.question_order || 0) - (b.question_order || 0);
  });
}

function resolveQuestionType(q: ExamQuestion | undefined): string {
  return (q?.question_type || 'mcq').toLowerCase().replace(/-/g, '_');
}

function isCodingType(q: ExamQuestion | undefined): boolean {
  if (!q) return false;
  return (
    resolveQuestionType(q) === 'coding' ||
    String(q.round_type || '').toLowerCase() === 'coding'
  );
}

/** Safe string for controlled inputs / React text children. */
function answerAsText(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return '';
}

function playQuestionAudio(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    toast.error('Audio not supported in this browser');
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const preferred =
    voices.find((v) => v.lang.startsWith('en') && v.name.includes('Google')) ||
    voices.find((v) => v.lang.startsWith('en'));
  if (preferred) utterance.voice = preferred;
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

function extractSentenceFromListeningQuestion(questionText: string): string {
  const singleQuoteMatch = questionText.match(/'([^']+)'/);
  const doubleQuoteMatch = questionText.match(/"([^"]+)"/);
  const colonMatch = questionText.match(/:\s*(.+?)(?:\.|$)/);
  if (singleQuoteMatch) return singleQuoteMatch[1].trim();
  if (doubleQuoteMatch) return doubleQuoteMatch[1].trim();
  if (colonMatch) return colonMatch[1].trim();
  return questionText;
}

function hideSentenceFromDisplay(questionText: string): string {
  let displayText = questionText.replace(/'[^']+'/g, '');
  displayText = displayText.replace(/"[^"]+"/g, '');
  displayText = displayText.replace(/:\s*\.+$/, ':');
  displayText = displayText.replace(/:\s+$/, ':');
  displayText = displayText.replace(/\s+/g, ' ').trim();
  if (!displayText.endsWith(':') && !displayText.endsWith('.')) {
    displayText += ':';
  }
  if (!displayText || displayText.length < 10 || displayText === ':') {
    return 'Listen and write down the sentence you hear:';
  }
  return displayText;
}

function isListeningType(q: ExamQuestion | undefined): boolean {
  const qt = resolveQuestionType(q);
  const text = (q?.question_text || '').toLowerCase();
  return (
    qt === 'dictation' ||
    qt === 'listening' ||
    qt === 'listening_question' ||
    text.includes('listen and write')
  );
}

function isSpeakingType(q: ExamQuestion | undefined): boolean {
  const qt = resolveQuestionType(q);
  const text = (q?.question_text || '').toLowerCase();
  const opts = q?.options || [];
  const hasNoOptions = !opts || opts.length === 0;
  if (qt === 'voice_speaking' || qt === 'voice_reading' || qt === 'voice') return true;
  if (isListeningType(q)) return false;
  if (/\b(write|type)\b/i.test(text) && !text.includes('listen and write')) return false;
  const hasSpeakingKeywords =
    text.includes('speak') ||
    text.includes('read aloud') ||
    /read[\s\S]*?aloud/i.test(text) ||
    text.includes('tell us') ||
    text.includes('describe') ||
    text.includes('explain verbally');
  return (
    hasSpeakingKeywords &&
    (qt === 'soft_skills' || hasNoOptions)
  );
}

function isWritingType(q: ExamQuestion | undefined): boolean {
  const qt = resolveQuestionType(q);
  if (qt === 'text' || qt === 'writing' || qt === 'written' || qt === 'scenario') return true;
  return false;
}

function isMcqType(q: ExamQuestion | undefined): boolean {
  if (!q) return false;
  if (isListeningType(q) || isSpeakingType(q) || isWritingType(q)) return false;
  const opts = q.options || [];
  return opts.length > 0 || resolveQuestionType(q) === 'mcq';
}

export function AssessmentExam({ assessmentId, attemptId }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('camera');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [allQuestions, setAllQuestions] = useState<ExamQuestion[]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  /** Marked / visited keyed by question id (stable across rounds). */
  const [markedIds, setMarkedIds] = useState<Set<string>>(new Set());
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLgUp, setIsLgUp] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [fullscreenWarningShown, setFullscreenWarningShown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>(null);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [isLiveTranscribing, setIsLiveTranscribing] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [codingBusy, setCodingBusy] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isLiveTranscribingRef = useRef(false);
  const endingRef = useRef(false);
  const codingBusyRef = useRef(false);
  const answersRef = useRef(answers);
  const wasFullscreenRef = useRef(false);
  const flushSnapshotsRef = useRef<() => Promise<void>>(async () => {});
  const timeWarn5ShownRef = useRef(false);
  const timeWarn1ShownRef = useRef(false);
  answersRef.current = answers;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const apply = () => {
      const matches = mq.matches;
      setIsLgUp(matches);
      setIsSidebarOpen(matches);
      if (matches) setMobileDrawerOpen(false);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const { videoRef, getVideoElement, startCamera, stopCamera, isCameraActive, status: cameraStatus, micReady } =
    useExamCamera();
  const examActive = phase === 'exam' || phase === 'warning' || phase === 'round_break';
  const { isFullscreen, enterFullscreen } = useExamFullscreen({
    autoEnter: true,
    active: examActive,
  });

  const examEndMs = useMemo(() => {
    if (!session?.ends_at) return null;
    return new Date(session.ends_at).getTime();
  }, [session]);

  /** Soft-skills listening/speaking need mic primed before fullscreen. */
  const needsMicrophone = useMemo(() => {
    const rounds = session?.rounds || [];
    if (
      rounds.some(
        (r: any) => String(r.round_type || '').toLowerCase() === 'soft_skills',
      )
    ) {
      return true;
    }
    return allQuestions.some((q) => {
      const qt = resolveQuestionType(q);
      return (
        qt === 'dictation' ||
        qt === 'listening' ||
        qt === 'listening_question' ||
        qt === 'voice_speaking' ||
        qt === 'voice_reading' ||
        qt === 'voice' ||
        isSpeakingType(q) ||
        isListeningType(q)
      );
    });
  }, [session, allQuestions]);

  const roundNumbers = useMemo(() => {
    const nums = Array.from(new Set(allQuestions.map((q) => q.round_number))).sort(
      (a, b) => a - b
    );
    return nums;
  }, [allQuestions]);

  const totalRounds = roundNumbers.length;
  const currentRoundNumber = roundNumbers[roundIdx] ?? roundNumbers[0];
  const roundQuestions = useMemo(
    () => allQuestions.filter((q) => q.round_number === currentRoundNumber),
    [allQuestions, currentRoundNumber]
  );
  const current = roundQuestions[currentIdx];
  const isLastRound = roundIdx >= totalRounds - 1;
  const hasMoreRounds = !isLastRound && totalRounds > 1;
  const isLastQuestionInRound =
    roundQuestions.length > 0 && currentIdx >= roundQuestions.length - 1;
  const isLastQuestionOfExam = isLastQuestionInRound && !hasMoreRounds;
  const candidateName =
    (typeof session?.student_name === 'string' && session.student_name.trim()) ||
    'Candidate';

  const roundDurationMs = useMemo(() => {
    const rounds = session?.rounds || [];
    const match = rounds.find(
      (r: any) => Number(r.round_number) === Number(currentRoundNumber)
    );
    const mins = match?.duration_minutes;
    if (typeof mins === 'number' && mins > 0) return mins * 60 * 1000;
    if (examEndMs) {
      const remainingRounds = Math.max(totalRounds - roundIdx, 1);
      return Math.max(examEndMs - Date.now(), 60_000) / remainingRounds;
    }
    return 10 * 60 * 1000;
  }, [session, currentRoundNumber, examEndMs, totalRounds, roundIdx]);

  const buildAnswerPayload = useCallback(() => {
    const codingIds = new Set(
      allQuestions.filter(isCodingType).map((q) => q.id)
    );
    return Object.entries(answersRef.current)
      .filter(([qid, answer]) => {
        if (codingIds.has(qid)) return false;
        return answer != null && String(answer).length > 0;
      })
      .map(([question_id, answer]) => ({
        question_id,
        answer,
        time_spent: 0,
      }));
  }, [allQuestions]);

  const finishAndGoHome = useCallback(
    async (mode: 'submit' | 'auto' | 'disqualify', reason?: string) => {
      if (endingRef.current) return;

      if (codingBusyRef.current) {
        if (mode === 'submit') {
          toast.error(
            'Wait for coding Run/Submit to finish before submitting the exam.'
          );
          return;
        }
        // Auto / disqualify: wait briefly for in-flight coding job
        const waitUntil = Date.now() + 90_000;
        while (codingBusyRef.current && Date.now() < waitUntil) {
          await new Promise((r) => setTimeout(r, 500));
        }
      }

      endingRef.current = true;
      setSubmitting(true);
      setPhase('ending');
      try {
        // Capture any remaining proctoring shots for the current round before submit
        try {
          await flushSnapshotsRef.current();
        } catch {
          /* non-blocking */
        }
        const payload = buildAnswerPayload();
        if (mode === 'disqualify') {
          await apiClient.disqualifyAssessmentExam(assessmentId, attemptId, {
            reason: reason || 'FULLSCREEN_EXIT',
            answers: payload,
          });
          toast.error('You have been disqualified. The exam was submitted.');
        } else {
          await apiClient.submitAssessmentExam(assessmentId, attemptId, {
            answers: payload,
            auto_submit: mode === 'auto',
            attempted_device: detectExamDevice(),
          });
          toast.success(mode === 'auto' ? 'Time is up — exam auto-submitted.' : 'Exam submitted.');
        }
      } catch (e: any) {
        toast.error(e?.response?.data?.detail || e?.message || 'Failed to submit exam');
        endingRef.current = false;
        setPhase('exam');
      } finally {
        setSubmitting(false);
        stopCamera();
        await exitExamFullscreen();
        router.replace('/dashboard/student');
      }
    },
    [assessmentId, attemptId, buildAnswerPayload, router, stopCamera]
  );

  const onUploadSnapshot = useCallback(
    async (slot: number, blob: Blob, round: number) => {
      await apiClient.uploadAssessmentProctoringSnapshot(
        assessmentId,
        attemptId,
        slot,
        blob,
        round
      );
    },
    [assessmentId, attemptId]
  );

  const { flushRemaining } = useProctorSnapshots({
    attemptId,
    active: phase === 'exam',
    roundNumber: currentRoundNumber ?? null,
    roundDurationMs,
    examEndMs,
    getVideoElement,
    onUpload: onUploadSnapshot,
  });
  flushSnapshotsRef.current = flushRemaining;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const start = await apiClient.startAssessmentExam(assessmentId, attemptId, {
          attempted_device: detectExamDevice(),
        });
        if (cancelled) return;
        setSession(start);
        const ends = new Date(start.ends_at).getTime();
        timeWarn5ShownRef.current = false;
        timeWarn1ShownRef.current = false;
        setSecondsLeft(Math.max(0, Math.floor((ends - Date.now()) / 1000)));
        const qs = await apiClient.getAssessmentExamQuestions(assessmentId, attemptId);
        if (cancelled) return;
        const sorted = sortQuestions(Array.isArray(qs) ? qs : []);
        setAllQuestions(sorted);
        const initialAnswers: Record<string, any> = {};
        sorted.forEach((q: ExamQuestion) => {
          if (q.coding_submitted) {
            // Never store the coding payload object in answers — it breaks
            // React when non-coding UI tries to render answers[id] as text.
            initialAnswers[q.id] = 'submitted';
          }
        });
        if (Object.keys(initialAnswers).length) {
          setAnswers(initialAnswers);
        }
        if (sorted[0]) {
          setVisitedIds(new Set([sorted[0].id]));
        }
      } catch (e: any) {
        toast.error(e?.response?.data?.detail || 'Could not start exam');
        router.replace(`/assessments/exam/${assessmentId}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [assessmentId, attemptId, router]);

  useEffect(() => {
    if (phase !== 'exam') return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          void finishAndGoHome('auto');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, finishAndGoHome]);

  useEffect(() => {
    if (phase !== 'exam') return;
    if (secondsLeft <= 0) return;

    if (secondsLeft <= 300 && !timeWarn5ShownRef.current) {
      timeWarn5ShownRef.current = true;
      toast('5 min to end the exam.', { duration: 5000 });
    }
    if (secondsLeft <= 60 && !timeWarn1ShownRef.current) {
      timeWarn1ShownRef.current = true;
      toast.error(
        'Submit your exam now — otherwise it will automatically submit.',
        { duration: 5000 },
      );
    }
  }, [phase, secondsLeft]);

  useEffect(() => {
    if (phase !== 'exam' && phase !== 'warning' && phase !== 'round_break') return;
    if (isFullscreen) {
      wasFullscreenRef.current = true;
      if (phase === 'warning') setPhase('exam');
      return;
    }
    if (!wasFullscreenRef.current) return;
    if (!fullscreenWarningShown) {
      setFullscreenWarningShown(true);
      setPhase('warning');
    } else if (phase === 'exam' || phase === 'round_break') {
      void finishAndGoHome('disqualify', 'FULLSCREEN_EXIT');
    }
  }, [isFullscreen, phase, fullscreenWarningShown, finishAndGoHome]);

  useEffect(() => {
    if (phase !== 'exam' && phase !== 'round_break') return;
    const onVis = () => {
      if (document.hidden) {
        void finishAndGoHome('disqualify', 'TAB_SWITCH');
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [phase, finishAndGoHome]);

  const beginExam = async () => {
    const ok = await startCamera({ audio: needsMicrophone });
    if (!ok) return;
    await enterFullscreen();
    setPhase('exam');
  };

  const startNextRound = () => {
    const nextRound = roundIdx + 1;
    if (nextRound >= totalRounds) return;
    setRoundIdx(nextRound);
    setCurrentIdx(0);
    const nextRoundNum = roundNumbers[nextRound];
    const firstQ = allQuestions.find((q) => q.round_number === nextRoundNum);
    if (firstQ) {
      setVisitedIds((prev) => new Set([...Array.from(prev), firstQ.id]));
    }
    setPhase('exam');
    toast.success(`Starting Round ${nextRound + 1} of ${totalRounds}`);
  };

  const goToRoundBreakOrStay = () => {
    void (async () => {
      try {
        await flushSnapshotsRef.current();
      } catch {
        /* non-blocking */
      }
      if (hasMoreRounds) {
        setPhase('round_break');
        return;
      }
      const unanswered = allQuestions.filter((q) => !answersRef.current[q.id]).length;
      const codingUnsubmitted = allQuestions.filter(
        (q) => isCodingType(q) && !q.coding_submitted
      ).length;
      setConfirmModal({ kind: 'submit', unanswered, codingUnsubmitted });
    })();
  };

  const counts = useMemo(() => {
    let answered = 0;
    let marked = 0;
    let notAnswered = 0;
    let notVisited = 0;
    roundQuestions.forEach((q) => {
      const hasAnswer = Boolean(answers[q.id]);
      const isMarked = markedIds.has(q.id);
      const isVisited = visitedIds.has(q.id);
      if (hasAnswer && !isMarked) answered += 1;
      else if (isMarked) marked += 1;
      else if (isVisited) notAnswered += 1;
      else notVisited += 1;
    });
    return { answered, marked, notAnswered, notVisited };
  }, [answers, markedIds, roundQuestions, visitedIds]);

  const getQuestionStatus = (q: ExamQuestion) => {
    const isAnswered = Boolean(answers[q.id]);
    const isMarked = markedIds.has(q.id);
    const isVisited = visitedIds.has(q.id);
    if (isAnswered && !isMarked) return 'answered';
    if (isMarked) return 'marked';
    if (isVisited) return 'notAnswered';
    return 'notVisited';
  };

  const navigateToQuestion = (index: number) => {
    const q = roundQuestions[index];
    if (!q) return;
    setCurrentIdx(index);
    setVisitedIds((prev) => new Set([...Array.from(prev), q.id]));
  };

  const advanceWithinOrEndRound = (opts?: { clearMark?: boolean; toggleMark?: boolean }) => {
    const q = roundQuestions[currentIdx];
    if (!q) return;

    if (opts?.toggleMark) {
      setMarkedIds((prev) => {
        const next = new Set(prev);
        if (next.has(q.id)) next.delete(q.id);
        else next.add(q.id);
        return next;
      });
    } else if (opts?.clearMark) {
      setMarkedIds((prev) => {
        if (!prev.has(q.id)) return prev;
        const next = new Set(prev);
        next.delete(q.id);
        return next;
      });
    }

    if (currentIdx < roundQuestions.length - 1) {
      const nextIdx = currentIdx + 1;
      const nextQ = roundQuestions[nextIdx];
      setCurrentIdx(nextIdx);
      if (nextQ) {
        setVisitedIds((prev) => new Set([...Array.from(prev), nextQ.id]));
      }
      return;
    }

    // Last question of this round
    goToRoundBreakOrStay();
  };

  const handleNextQuestion = () => advanceWithinOrEndRound({ clearMark: true });
  const handleMarkForReview = () => advanceWithinOrEndRound({ toggleMark: true });

  const handlePreviousQuestion = () => {
    if (currentIdx <= 0) return;
    navigateToQuestion(currentIdx - 1);
  };

  const handleClearResponse = () => {
    if (!current) return;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[current.id];
      return next;
    });
    setLiveTranscript('');
    setInterimTranscript('');
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const stopLiveTranscription = useCallback(() => {
    isLiveTranscribingRef.current = false;
    try {
      recognitionRef.current?.stop?.();
    } catch {
      /* ignore */
    }
    setIsLiveTranscribing(false);
    if (current && (liveTranscript || interimTranscript)) {
      const finalText = `${liveTranscript}${interimTranscript}`.trim();
      if (finalText) {
        setAnswers((prev) => ({
          ...prev,
          [current.id]: (prev[current.id] ? `${prev[current.id]} ` : '') + finalText,
        }));
      }
    }
    setInterimTranscript('');
  }, [current, liveTranscript, interimTranscript]);

  const startLiveTranscription = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in this browser');
      return;
    }
    try {
      if (!recognitionRef.current) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.onresult = (event: any) => {
          let interim = '';
          let finalChunk = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) finalChunk += `${transcript} `;
            else interim += transcript;
          }
          if (finalChunk) {
            setLiveTranscript((prev) => `${prev}${finalChunk}`);
            setInterimTranscript('');
          } else {
            setInterimTranscript(interim);
          }
        };
        recognition.onerror = (event: any) => {
          if (event.error === 'not-allowed') {
            toast.error('Microphone access denied');
            isLiveTranscribingRef.current = false;
            setIsLiveTranscribing(false);
          }
        };
        recognition.onend = () => {
          if (isLiveTranscribingRef.current) {
            try {
              recognition.start();
            } catch {
              /* ignore */
            }
          } else {
            setIsLiveTranscribing(false);
          }
        };
        recognitionRef.current = recognition;
      }
      setLiveTranscript('');
      setInterimTranscript('');
      recognitionRef.current.start();
      isLiveTranscribingRef.current = true;
      setIsLiveTranscribing(true);
    } catch (e) {
      console.error(e);
      toast.error('Could not start microphone');
    }
  }, []);

  useEffect(() => {
    setAudioPlayed(false);
    if (isLiveTranscribingRef.current) {
      stopLiveTranscription();
    }
    setLiveTranscript('');
    setInterimTranscript('');
  }, [current?.id]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop?.();
      } catch {
        /* ignore */
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSubmitRound = () => {
    const unanswered = counts.notVisited + counts.notAnswered + counts.marked;
    if (unanswered > 0) {
      setConfirmModal({ kind: 'round', unanswered });
      return;
    }
    goToRoundBreakOrStay();
  };

  const handleSubmitWithConfirmation = () => {
    if (codingBusy) {
      toast.error(
        'Wait for coding Run/Submit to finish before submitting the exam.'
      );
      return;
    }
    const unanswered = allQuestions.filter((q) => {
      if (isCodingType(q)) return !q.coding_submitted && !answers[q.id];
      return !answers[q.id];
    }).length;
    const codingUnsubmitted = allQuestions.filter(
      (q) => isCodingType(q) && !q.coding_submitted
    ).length;
    setConfirmModal({ kind: 'submit', unanswered, codingUnsubmitted });
  };

  const closeConfirmModal = () => setConfirmModal(null);

  const confirmModalAction = () => {
    if (!confirmModal) return;
    if (confirmModal.kind === 'round') {
      setConfirmModal(null);
      goToRoundBreakOrStay();
      return;
    }
    setConfirmModal(null);
    void finishAndGoHome('submit');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-10 w-10 animate-spin text-[#2563EB]" />
      </div>
    );
  }

  if (phase === 'camera') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="max-w-lg w-full rounded-2xl border border-amber-200 bg-amber-50 shadow-lg p-6 space-y-5">
          <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-700 mx-auto max-w-[320px]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover -scale-x-100 ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}
            />
            {!isCameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2 p-4 text-center">
                <VideoOff className="w-10 h-10" />
                <p className="text-sm">Camera preview will appear here</p>
              </div>
            )}
            {isCameraActive && (
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600/90 text-white text-xs font-bold px-2 py-1 rounded-full">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
            )}
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-amber-100 p-2 rounded-lg shrink-0">
              <Video className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg mb-1">
                {needsMicrophone ? 'Camera and microphone required' : 'Camera required'}
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed">
                {needsMicrophone
                  ? 'Your webcam must stay on for the entire assessment, and microphone access is needed for soft-skills speaking questions. Enable both before you begin so permission prompts do not interrupt fullscreen. Snapshots are taken silently during the exam.'
                  : 'Your webcam must stay on for the entire assessment. Enable the camera before you begin; it will remain active through every round. Snapshots are taken silently during the exam.'}
              </p>
            </div>
          </div>

          {totalRounds > 1 && (
            <p className="text-sm text-gray-800 bg-white/70 border border-amber-100 rounded-lg px-3 py-2">
              This assessment has <strong>{totalRounds} rounds</strong>. You will complete them one
              after another.
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
            <p className="text-xs text-gray-600">
              Status:{' '}
              <span className="font-semibold text-gray-900">{cameraStatusLabel(cameraStatus)}</span>
              {needsMicrophone && isCameraActive && (
                <span className="ml-2 font-semibold text-gray-900">
                  · Mic: {micReady ? 'ready' : 'needed'}
                </span>
              )}
            </p>
            {(!isCameraActive || (needsMicrophone && !micReady)) && (
              <button
                type="button"
                onClick={() => void startCamera({ audio: needsMicrophone })}
                disabled={cameraStatus === 'requesting'}
                className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-60 shadow-sm"
              >
                {cameraStatus === 'requesting' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enabling…
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4" />
                    {needsMicrophone ? 'Enable camera & mic' : 'Enable camera'}
                  </>
                )}
              </button>
            )}
          </div>

          {(cameraStatus === 'denied' ||
            cameraStatus === 'unavailable' ||
            cameraStatus === 'lost') && (
            <p className="text-sm text-red-600 flex items-start gap-2 pt-2 border-t border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {needsMicrophone
                ? 'Check site permissions for camera and microphone, and ensure no other app is using them.'
                : 'Check site permissions and ensure no other app is using the camera.'}
            </p>
          )}

          <button
            type="button"
            onClick={() => void beginExam()}
            disabled={!isCameraActive || (needsMicrophone && !micReady)}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            Start exam in fullscreen
          </button>

          <p className="text-xs text-gray-500 text-center">
            Leaving fullscreen after one warning, or switching tabs, will disqualify you and
            auto-submit the exam.
          </p>
        </div>
      </div>
    );
  }

  if (phase === 'warning') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/70 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-6 w-6" />
            <h2 className="text-lg font-semibold">Stay in fullscreen</h2>
          </div>
          <p className="text-sm text-gray-700">
            Do not exit fullscreen. If you leave fullscreen again or switch tabs, you will be
            disqualified and the exam will be submitted automatically.
          </p>
          <Button
            type="button"
            className="w-full bg-[#2563EB] hover:bg-blue-700"
            onClick={() => void enterFullscreen()}
          >
            Resume fullscreen
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'round_break') {
    const nextRoundNum = roundNumbers[roundIdx + 1];
    const nextQs = allQuestions.filter((q) => q.round_number === nextRoundNum);
    const nextType = nextQs[0]?.round_type || 'next';
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-5 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Round {roundIdx + 1} of {totalRounds} complete
          </h2>
          <p className="text-sm text-gray-600">
            You finished <span className="font-semibold">{currentRoundNumber != null ? `Round ${currentRoundNumber}` : 'this round'}</span>
            {current?.round_type ? ` (${current.round_type})` : ''}.
          </p>
          <p className="text-sm text-gray-700 bg-[#E6F3FF] border border-blue-100 rounded-lg px-4 py-3">
            Next: <strong>Round {roundIdx + 2} of {totalRounds}</strong>
            {nextType ? ` — ${nextType}` : ''} ({nextQs.length} questions)
          </p>
          <Button
            type="button"
            className="w-full bg-[#2563EB] hover:bg-blue-700"
            onClick={startNextRound}
          >
            Start Round {roundIdx + 2}
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'ending' || submitting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-100">
        <Loader2 className="h-10 w-10 animate-spin text-[#2563EB]" />
        <p className="text-sm text-gray-600">Submitting and redirecting…</p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">No questions available for this assessment.</p>
      </div>
    );
  }

  const t = splitTime(secondsLeft);

  const openPalette = () => {
    if (isLgUp) setIsSidebarOpen(true);
    else setMobileDrawerOpen(true);
  };

  const closeMobileDrawer = () => setMobileDrawerOpen(false);

  const navigateToQuestionFromPalette = (index: number) => {
    navigateToQuestion(index);
    if (!isLgUp) setMobileDrawerOpen(false);
  };

  return (
    <div
      className="flex h-screen min-h-0 flex-col overflow-hidden bg-gray-100 font-sans select-none"
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <div className="relative z-20 flex h-14 sm:h-16 shrink-0 items-center justify-between bg-[#2563EB] px-3 sm:px-6 text-white shadow-md">
        <div className="min-w-0">
          <h1 className="truncate text-base sm:text-xl font-bold">
            {session?.assessment_name || 'Assessment'}
          </h1>
          <p className="truncate text-xs sm:text-sm text-blue-100">
            Round {roundIdx + 1} of {totalRounds}
            {current.round_type ? `: ${current.round_type}` : ''}
          </p>
        </div>
        {totalRounds > 1 && (
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            {roundNumbers.map((rn, i) => (
              <span
                key={rn}
                className={`h-2.5 w-2.5 rounded-full ${
                  i < roundIdx
                    ? 'bg-green-300'
                    : i === roundIdx
                      ? 'bg-white'
                      : 'bg-white/30'
                }`}
                title={`Round ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {!isLgUp && (
        <div className="z-30 flex shrink-0 items-center gap-3 border-b border-blue-100 bg-[#E6F3FF] px-3 py-2">
          <div className="flex h-14 w-14 shrink-0 items-end justify-center overflow-hidden rounded-lg bg-black shadow-sm">
            {isCameraActive ? (
              <video
                ref={videoRef}
                className="h-full w-full object-cover -scale-x-100"
                playsInline
                muted
              />
            ) : (
              <User className="mb-[-2px] h-10 w-10 fill-current text-gray-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-600">
              Time left
            </div>
            <div className="font-mono text-base font-bold leading-tight text-gray-900">
              {t.hours}:{t.minutes}:{t.seconds}
            </div>
            <div className="truncate text-xs text-gray-600">{candidateName}</div>
          </div>
          <button
            type="button"
            onClick={openPalette}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-sm font-semibold text-white shadow-sm"
          >
            <List className="h-4 w-4" />
            Questions
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="relative z-40 flex min-h-0 flex-1 flex-col bg-white transition-all duration-300">
          {isLgUp && (
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label={isSidebarOpen ? 'Collapse palette' : 'Expand palette'}
              className={`absolute top-1/2 z-[60] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-2 border-gray-400 bg-white text-gray-800 shadow-lg transition-transform duration-300 hover:bg-gray-100 ${
                isSidebarOpen ? 'right-0 translate-x-1/2' : 'right-3 translate-x-0'
              }`}
              title={isSidebarOpen ? 'Collapse palette' : 'Expand palette'}
            >
              {isSidebarOpen ? (
                <ChevronsRight className="h-5 w-5 shrink-0 text-gray-800" strokeWidth={2.5} />
              ) : (
                <ChevronsLeft className="h-5 w-5 shrink-0 text-gray-800" strokeWidth={2.5} />
              )}
            </button>
          )}

          <div className={`flex min-h-0 flex-1 flex-col overflow-hidden ${isCodingType(current) ? "p-2 sm:p-3" : "p-3 sm:p-6"}`}>
            {!isCodingType(current) && (
            <div className="mb-3 sm:mb-4 shrink-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-800">
                Question {currentIdx + 1} of {roundQuestions.length}
                <span className="ml-2 text-xs sm:text-sm font-medium text-gray-500">
                  (this round)
                </span>
              </h2>
              <div className="mt-2 h-px w-full bg-gray-200" />
            </div>
            )}

            <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-sm border border-gray-300 bg-white shadow-sm">
              {isCodingType(current) ? (
                <CodingWorkspace
                  assessmentId={assessmentId}
                  attemptId={attemptId}
                  question={current as any}
                  allCodingQuestions={roundQuestions.filter(isCodingType) as any}
                  onSelectQuestion={(qid) => {
                    const idx = roundQuestions.findIndex((q) => q.id === qid);
                    if (idx >= 0) navigateToQuestion(idx);
                  }}
                  onBusyChange={(b) => {
                    codingBusyRef.current = b;
                    setCodingBusy(b);
                  }}
                  onSubmitted={(qid, result) => {
                    setAnswers((prev) => ({
                      ...prev,
                      [qid]: 'submitted',
                    }));
                    setAllQuestions((prev) =>
                      prev.map((q) =>
                        q.id === qid
                          ? {
                              ...q,
                              coding_submitted: true,
                              coding_submission: {
                                language: result?.language,
                                points_earned: result?.points_earned,
                                max_points: result?.max_points,
                                passed: result?.passed,
                                total: result?.total,
                              },
                            }
                          : q
                      )
                    );
                  }}
                />
              ) : (
              <div className="flex min-h-0 flex-1 flex-col md:flex-row">
                <div className="flex-1 overflow-y-auto border-b border-gray-300 bg-white p-4 sm:p-6 md:border-b-0 md:border-r">
                  {resolveQuestionType(current) === 'dictation' ? (
                    <div className="space-y-4">
                      <p className="text-lg font-bold text-blue-600">Listening Exercise</p>
                      <p className="text-gray-700">
                        Click the button below to hear a sentence. Listen carefully and type
                        exactly what you hear in the box.
                      </p>
                      <button
                        type="button"
                        onClick={() => playQuestionAudio(current.question_text || '')}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
                      >
                        <Volume2 className="h-5 w-5" />
                        <span>Play Audio</span>
                      </button>
                    </div>
                  ) : isListeningType(current) ? (
                    <div className="space-y-4">
                      <p className="select-none text-lg font-medium leading-relaxed text-gray-800">
                        {hideSentenceFromDisplay(current.question_text)}
                      </p>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            if (!audioPlayed) {
                              setAudioPlayed(true);
                              playQuestionAudio(
                                extractSentenceFromListeningQuestion(current.question_text),
                              );
                            }
                          }}
                          disabled={audioPlayed}
                          className={`flex items-center gap-2 rounded-lg px-6 py-3 font-medium shadow-md transition-all ${
                            audioPlayed
                              ? 'cursor-not-allowed bg-gray-400 text-gray-600'
                              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                          }`}
                        >
                          <Volume2 className="h-5 w-5" />
                          <span>{audioPlayed ? 'Audio Played' : 'Play Audio'}</span>
                        </button>
                        {audioPlayed && (
                          <span className="text-sm italic text-gray-500">
                            Audio has been played. Type your answer in the box below.
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="select-none text-base sm:text-lg font-medium leading-relaxed text-gray-800">
                      {current.question_text}
                    </p>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 sm:p-6">
                  {isListeningType(current) || resolveQuestionType(current) === 'dictation' ? (
                    <div className="flex h-full flex-col">
                      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <p className="text-sm text-gray-700">
                          <strong>Instructions:</strong> Listen to the audio and type exactly what
                          you hear in the box below.
                        </p>
                      </div>
                      <label className="mb-2 text-sm font-semibold text-gray-600">
                        Type what you heard:
                      </label>
                      <textarea
                        className="w-full flex-1 resize-none rounded-lg border border-gray-300 bg-white p-4 text-base text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        placeholder="Type sentence here..."
                        value={answerAsText(answers[current.id])}
                        onChange={(e) => handleAnswerChange(current.id, e.target.value)}
                      />
                      <div className="mt-2 text-right text-xs text-gray-500">
                        {answerAsText(answers[current.id]).length} characters
                      </div>
                    </div>
                  ) : isWritingType(current) ? (
                    <div className="flex h-full flex-col">
                      <label className="mb-2 text-sm font-semibold text-gray-600">Your Answer:</label>
                      <textarea
                        className="w-full flex-1 resize-none rounded-lg border border-gray-300 bg-white p-4 text-base text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        placeholder="Type your answer here..."
                        value={answerAsText(answers[current.id])}
                        onChange={(e) => handleAnswerChange(current.id, e.target.value)}
                      />
                    </div>
                  ) : isSpeakingType(current) ||
                    resolveQuestionType(current) === 'voice_speaking' ||
                    resolveQuestionType(current) === 'voice_reading' ? (
                    <div className="flex h-full flex-col space-y-4">
                      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                        <p className="mb-2 text-sm text-gray-700">
                          <strong>Instructions:</strong> Click &quot;Start Speaking&quot; when ready.
                          Speak clearly and organize your thoughts.
                        </p>
                        <p className="text-xs text-gray-600">
                          Tip: Organize your thoughts, speak clearly, and use relevant examples.
                        </p>
                      </div>
                      <div className="flex justify-center">
                        {!isLiveTranscribing ? (
                          <button
                            type="button"
                            onClick={startLiveTranscription}
                            className="flex items-center gap-3 rounded-lg bg-[#EF4444] px-8 py-4 font-bold text-white shadow-lg transition-all hover:bg-red-600 hover:shadow-xl"
                          >
                            <Mic className="h-5 w-5" />
                            <span>Start Speaking</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={stopLiveTranscription}
                            className="flex animate-pulse items-center gap-3 rounded-lg bg-[#EF4444] px-8 py-4 font-bold text-white shadow-lg transition-all hover:bg-red-700"
                          >
                            <div className="h-4 w-4 animate-pulse rounded-full bg-white" />
                            <span>Stop & Save</span>
                          </button>
                        )}
                      </div>
                      {(isLiveTranscribing || liveTranscript) && (
                        <div className="flex min-h-[200px] flex-1 flex-col rounded-lg border border-green-200 bg-[#ECFDF5] p-4">
                          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#10B981]">
                            Speaking... (Live transcription):
                          </h3>
                          <div className="flex-1 overflow-y-auto rounded border border-green-100 bg-white p-4">
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                              {liveTranscript ||
                                (interimTranscript ? (
                                  <span className="italic text-gray-500">{interimTranscript}</span>
                                ) : (
                                  'Listening...'
                                ))}
                            </p>
                          </div>
                        </div>
                      )}
                      {!isLiveTranscribing &&
                        (liveTranscript || answerAsText(answers[current.id])) && (
                          <div className="flex flex-1 flex-col rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <label className="mb-2 text-sm font-semibold text-gray-700">
                              Your Response:
                            </label>
                            <div className="min-h-[200px] flex-1 overflow-y-auto whitespace-pre-wrap rounded-lg border border-gray-300 bg-white p-4 text-base text-gray-700">
                              {answerAsText(answers[current.id]) || liveTranscript || ''}
                            </div>
                            <div className="mt-2 text-right text-xs text-gray-500">
                              {(answerAsText(answers[current.id]) || liveTranscript || '').length}{' '}
                              characters
                            </div>
                          </div>
                        )}
                    </div>
                  ) : isMcqType(current) ? (
                    <div className="space-y-3 sm:space-y-4">
                      {(current.options || []).map((optionText, index) => {
                        const optionLetter = String.fromCharCode(65 + index);
                        const isSelected =
                          answers[current.id] === optionLetter ||
                          answers[current.id] === optionText;
                        return (
                          <label
                            key={`${current.id}-${index}`}
                            className={`flex min-h-11 cursor-pointer items-start space-x-3 rounded-lg border p-3 sm:p-4 transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 shadow-sm'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            <div className="relative mt-0.5 flex shrink-0 items-center justify-center">
                              <input
                                type="radio"
                                name={`question-${current.id}`}
                                checked={isSelected}
                                onChange={() =>
                                  handleAnswerChange(current.id, optionLetter)
                                }
                                className="peer h-5 w-5 appearance-none rounded-full border-2 border-gray-400 bg-white transition-all checked:border-[6px] checked:border-blue-600"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="mr-2 font-bold text-gray-700">
                                {optionLetter})
                              </span>
                              <span className="text-sm sm:text-base text-gray-800 break-words">
                                {optionText}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex h-full flex-col">
                      <label className="mb-2 text-sm font-semibold text-gray-600">Your Answer:</label>
                      <textarea
                        className="w-full flex-1 resize-none rounded-lg border border-gray-300 bg-white p-4 text-base text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        placeholder="Type your answer here..."
                        value={answerAsText(answers[current.id])}
                        onChange={(e) => handleAnswerChange(current.id, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
              )}

              <div className="z-20 flex min-h-14 sm:h-16 shrink-0 flex-wrap items-center justify-between gap-2 border-t border-gray-300 bg-white px-2 sm:px-6 py-2">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={handlePreviousQuestion}
                    disabled={currentIdx <= 0}
                    aria-label="Previous question"
                    className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                    <span className="sm:hidden">Back</span>
                    <span className="hidden sm:inline">Previous</span>
                  </button>
                  {!isLastQuestionOfExam && (
                    <button
                      type="button"
                      onClick={handleMarkForReview}
                      className="rounded bg-[#DC2626] px-3 sm:px-6 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
                    >
                      <span className="sm:hidden">Mark</span>
                      <span className="hidden sm:inline">Mark for review & Next</span>
                    </button>
                  )}
                  {isLastQuestionOfExam && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!current) return;
                        setMarkedIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(current.id)) next.delete(current.id);
                          else next.add(current.id);
                          return next;
                        });
                      }}
                      className="rounded bg-[#DC2626] px-3 sm:px-6 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
                    >
                      <span className="sm:hidden">Mark</span>
                      <span className="hidden sm:inline">Mark for review</span>
                    </button>
                  )}
                  {!isCodingType(current) && (
                    <button
                      type="button"
                      onClick={handleClearResponse}
                      className="rounded border border-gray-300 bg-white px-3 sm:px-6 py-2 text-xs sm:text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                    >
                      <span className="sm:hidden">Clear</span>
                      <span className="hidden sm:inline">Clear Response</span>
                    </button>
                  )}
                </div>
                {isCodingType(current) ? (
                  currentIdx < roundQuestions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!current?.coding_submitted) {
                          toast.error(
                            'Save your answer first using Save Answer in the editor.'
                          );
                          return;
                        }
                        handleNextQuestion();
                      }}
                      disabled={codingBusy}
                      className="rounded bg-[#16A34A] px-4 sm:px-8 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-60"
                    >
                      <span className="sm:hidden">Next</span>
                      <span className="hidden sm:inline">Submit & Next</span>
                    </button>
                  ) : hasMoreRounds ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!current?.coding_submitted) {
                          toast.error(
                            'Save your answer first using Save Answer in the editor.'
                          );
                          return;
                        }
                        handleNextQuestion();
                      }}
                      disabled={codingBusy}
                      className="rounded bg-[#16A34A] px-4 sm:px-8 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-60"
                    >
                      <span className="sm:hidden">End round</span>
                      <span className="hidden sm:inline">Save & End Round</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitWithConfirmation}
                      disabled={submitting || codingBusy}
                      className="rounded bg-[#2563EB] px-4 sm:px-8 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
                    >
                      {codingBusy
                        ? 'Coding job running…'
                        : submitting
                          ? 'Submitting…'
                          : 'Submit'}
                    </button>
                  )
                ) : isLastQuestionOfExam ? (
                  <button
                    type="button"
                    onClick={handleSubmitWithConfirmation}
                    disabled={submitting || codingBusy}
                    className="rounded bg-[#2563EB] px-4 sm:px-8 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
                  >
                    {codingBusy
                      ? 'Coding job running…'
                      : submitting
                        ? 'Submitting…'
                        : (
                          <>
                            <span className="sm:hidden">Submit</span>
                            <span className="hidden sm:inline">Submit Test</span>
                          </>
                        )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="rounded bg-[#16A34A] px-4 sm:px-8 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700"
                  >
                    {isLastQuestionInRound && hasMoreRounds ? (
                      <>
                        <span className="sm:hidden">End round</span>
                        <span className="hidden sm:inline">Save & End Round</span>
                      </>
                    ) : (
                      <>
                        <span className="sm:hidden">Next</span>
                        <span className="hidden sm:inline">Save & Next</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`${
            isLgUp && isSidebarOpen ? 'w-80 border-l' : 'hidden w-0 border-l-0'
          } ${isLgUp ? 'flex' : 'hidden'} h-full shrink-0 flex-col overflow-hidden border-gray-200 bg-[#E6F3FF] font-sans transition-all duration-300`}
        >
          <div className="relative m-2 rounded-lg border border-dashed border-blue-300 p-4">
            <div className="flex items-start gap-4">
              <div className="flex h-32 w-32 shrink-0 items-end justify-center overflow-hidden rounded-xl bg-black shadow-sm">
                {isCameraActive ? (
                  <video
                    ref={isLgUp ? videoRef : undefined}
                    className="h-full w-full object-cover -scale-x-100"
                    playsInline
                    muted
                  />
                ) : (
                  <User className="mb-[-4px] h-24 w-24 fill-current text-gray-400" />
                )}
              </div>
              <div className="flex-1 text-center">
                <div className="mb-1 text-lg font-bold text-gray-900">Time Left</div>
                <div className="flex items-start justify-center gap-2">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold leading-none text-black">{t.hours}</div>
                    <div className="mt-1 text-xs font-medium text-black">Hr</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold leading-none text-black">{t.minutes}</div>
                    <div className="mt-1 text-xs font-medium text-black">Min</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold leading-none text-black">{t.seconds}</div>
                    <div className="mt-1 text-xs font-medium text-black">Sec</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
                <User className="h-3 w-3 text-gray-500" />
              </div>
              <span className="text-sm font-normal text-gray-700">{candidateName}</span>
            </div>
          </div>

          <div className="mx-4 mb-2 text-xs font-semibold text-gray-700">
            Round {roundIdx + 1}/{totalRounds} palette
          </div>

          <div className="mx-4 mb-4 grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#16A34A] text-sm font-bold text-white shadow-sm">
                {counts.answered}
              </div>
              <span className="font-medium text-black">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center bg-[#DC2626] text-sm font-bold text-white shadow-sm"
                style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)' }}
              >
                <span className="-mt-1">{counts.notAnswered}</span>
              </div>
              <span className="font-medium text-black">Not Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9333EA] text-sm font-bold text-white shadow-sm">
                {counts.marked}
              </div>
              <span className="font-medium text-black">Marked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-200 text-sm font-bold text-gray-600 shadow-sm">
                {counts.notVisited}
              </div>
              <span className="font-medium text-black">Not Visited</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6">
            <h3 className="mb-4 text-base font-bold text-black">Question Palette:</h3>
            <div className="grid grid-cols-5 gap-3 pb-4">
              {roundQuestions.map((q, index) => {
                const status = getQuestionStatus(q);
                const isCurrent = index === currentIdx;
                let baseClasses =
                  'flex h-9 w-9 items-center justify-center text-sm font-bold shadow-sm transition-all';
                let style: CSSProperties = {};
                const content = (
                  <span className={status === 'notAnswered' ? '-mt-1' : ''}>{index + 1}</span>
                );

                if (status === 'answered') baseClasses += ' rounded-md bg-[#16A34A] text-white';
                else if (status === 'notAnswered') {
                  baseClasses += ' bg-[#DC2626] text-white';
                  style = { clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)' };
                } else if (status === 'marked') baseClasses += ' rounded-full bg-[#9333EA] text-white';
                else baseClasses += ' rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300';

                if (isCurrent) baseClasses += ' z-10 scale-105 ring-2 ring-blue-600 ring-offset-1';

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => navigateToQuestion(index)}
                    className={baseClasses}
                    style={style}
                    title={`Q${index + 1}`}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-[#E6F3FF] p-6 space-y-2">
            {hasMoreRounds ? (
              <button
                type="button"
                onClick={handleSubmitRound}
                className="w-full rounded bg-[#16A34A] py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-green-700"
              >
                Submit Round & Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitWithConfirmation}
                disabled={submitting || codingBusy}
                className="w-full rounded bg-[#2563EB] py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-blue-700 disabled:opacity-60"
              >
                {codingBusy ? (
                  'Coding job running…'
                ) : submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </span>
                ) : (
                  'Submit Test'
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {!isLgUp && mobileDrawerOpen && (
        <div className="fixed inset-0 z-[80] flex justify-end lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={closeMobileDrawer} />
          <div className="relative flex h-full w-full max-w-sm flex-col overflow-hidden bg-[#E6F3FF] shadow-2xl">
            <div className="flex items-center justify-between border-b border-blue-200 px-4 py-3">
              <h3 className="text-base font-bold text-gray-900">Questions</h3>
              <button
                type="button"
                onClick={closeMobileDrawer}
                className="rounded-lg p-2 text-gray-600 hover:bg-white/60"
                aria-label="Close questions"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mx-4 mt-3 mb-2 text-xs font-semibold text-gray-700">
              Round {roundIdx + 1}/{totalRounds} palette
            </div>
            <div className="mx-4 mb-4 grid grid-cols-2 gap-y-3 gap-x-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#16A34A] text-sm font-bold text-white">
                  {counts.answered}
                </div>
                <span className="font-medium text-black">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center bg-[#DC2626] text-sm font-bold text-white"
                  style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)' }}
                >
                  <span className="-mt-1">{counts.notAnswered}</span>
                </div>
                <span className="font-medium text-black">Not Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9333EA] text-sm font-bold text-white">
                  {counts.marked}
                </div>
                <span className="font-medium text-black">Marked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-200 text-sm font-bold text-gray-600">
                  {counts.notVisited}
                </div>
                <span className="font-medium text-black">Not Visited</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6">
              <h3 className="mb-4 text-base font-bold text-black">Question Palette:</h3>
              <div className="grid grid-cols-5 gap-3 pb-4">
                {roundQuestions.map((q, index) => {
                  const status = getQuestionStatus(q);
                  const isCurrent = index === currentIdx;
                  let baseClasses =
                    'flex h-9 w-9 items-center justify-center text-sm font-bold shadow-sm transition-all';
                  let style: CSSProperties = {};
                  if (status === 'answered') baseClasses += ' rounded-md bg-[#16A34A] text-white';
                  else if (status === 'notAnswered') {
                    baseClasses += ' bg-[#DC2626] text-white';
                    style = { clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)' };
                  } else if (status === 'marked') baseClasses += ' rounded-full bg-[#9333EA] text-white';
                  else baseClasses += ' rounded-md bg-gray-200 text-gray-700';
                  if (isCurrent) baseClasses += ' z-10 scale-105 ring-2 ring-blue-600 ring-offset-1';
                  return (
                    <button
                      key={`m-${q.id}`}
                      type="button"
                      onClick={() => navigateToQuestionFromPalette(index)}
                      className={baseClasses}
                      style={style}
                    >
                      <span className={status === 'notAnswered' ? '-mt-1' : ''}>{index + 1}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="border-t border-blue-100 p-4 space-y-2">
              {hasMoreRounds ? (
                <button
                  type="button"
                  onClick={() => {
                    closeMobileDrawer();
                    handleSubmitRound();
                  }}
                  className="w-full rounded bg-[#16A34A] py-3 text-base font-bold text-white shadow-md"
                >
                  Submit Round & Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    closeMobileDrawer();
                    handleSubmitWithConfirmation();
                  }}
                  disabled={submitting || codingBusy}
                  className="w-full rounded bg-[#2563EB] py-3 text-base font-bold text-white shadow-md disabled:opacity-60"
                >
                  {submitting ? 'Submitting…' : 'Submit Test'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {confirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="exam-confirm-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4"
          >
            <h2 id="exam-confirm-title" className="text-lg font-bold text-gray-900">
              {confirmModal.kind === 'round'
                ? 'Continue to the next round?'
                : 'Submit the exam now?'}
            </h2>
            <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
              {confirmModal.kind === 'round' ? (
                confirmModal.unanswered > 0 ? (
                  <p>
                    This round has{' '}
                    <strong>
                      {confirmModal.unanswered} unanswered question
                      {confirmModal.unanswered > 1 ? 's' : ''}
                    </strong>
                    . Continue to the next round anyway?
                  </p>
                ) : (
                  <p>You are about to leave this round and start the next one.</p>
                )
              ) : (
                <>
                  {(confirmModal.codingUnsubmitted ?? 0) > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-amber-900">
                      <p className="font-semibold text-amber-950">
                        {confirmModal.codingUnsubmitted} coding question
                        {(confirmModal.codingUnsubmitted ?? 0) > 1 ? 's' : ''} not
                        saved in the editor
                      </p>
                      <p className="mt-1">
                        Use <strong>Save Answer</strong> in the coding editor to
                        grade your solution. <strong>Run</strong> is not graded.
                        Submit the exam anyway?
                      </p>
                    </div>
                  )}
                  {confirmModal.unanswered > 0 ? (
                    <p>
                      You have{' '}
                      <strong>
                        {confirmModal.unanswered} unanswered question
                        {confirmModal.unanswered > 1 ? 's' : ''}
                      </strong>
                      . Unanswered questions will be scored as 0.
                    </p>
                  ) : (confirmModal.codingUnsubmitted ?? 0) === 0 ? (
                    <p>
                      You are about to submit before the timer ends. This cannot be
                      undone.
                    </p>
                  ) : null}
                </>
              )}
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={closeConfirmModal}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModalAction}
                disabled={submitting && confirmModal.kind === 'submit'}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold text-white shadow-sm transition disabled:opacity-60 ${
                  confirmModal.kind === 'round'
                    ? 'bg-[#16A34A] hover:bg-green-700'
                    : 'bg-[#2563EB] hover:bg-blue-700'
                }`}
              >
                {confirmModal.kind === 'round' ? 'Continue' : 'Submit exam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
