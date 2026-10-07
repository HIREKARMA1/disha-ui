"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
    Loader2,
    Play,
    Video,
    VideoOff,
    AlertTriangle,
    Clock,
    Calendar,
    Activity,
    RefreshCw,
} from 'lucide-react'
import { MAX_SCREEN_RECORDING_SEGMENTS } from '@/hooks/useScreenRecording'

interface RecordingChunk {
    recording_id: string
    chunk_index?: number | null
    status: string
    content_type?: string | null
    size_bytes?: number | null
    duration?: number | null
    started_at?: string | null
    ended_at?: string | null
    available: boolean
}

interface RecordingInfo {
    status: string
    chunks_total: number
    chunks_uploaded: number
    chunks_failed: number
    duration?: number | null
    started_at?: string | null
    ended_at?: string | null
    available: boolean
    recordings: RecordingChunk[]
}

interface ProctoringEvent {
    id: string
    attempt_id: string
    user_id: string
    event_type: string
    occurred_at: string
    client_occurred_at?: string | null
    metadata?: Record<string, any> | null
}

type PlaybackEntry =
    | { status: 'loading' }
    | { status: 'ready'; url: string }
    | { status: 'error'; message: string }

const EVENT_LABELS: Record<string, string> = {
    SCREEN_SHARE_STARTED: 'Screen sharing started',
    SCREEN_SHARE_STOPPED: 'Screen sharing stopped',
    SCREEN_SHARE_RESTARTED: 'Screen sharing restarted',
    ASSESSMENT_STARTED: 'Assessment started',
    ASSESSMENT_SUBMITTED: 'Assessment submitted',
    FULLSCREEN_EXIT: 'Exited fullscreen',
    TAB_SWITCH: 'Switched browser tab',
    WINDOW_BLUR: 'Window lost focus',
    NETWORK_DISCONNECTED: 'Network disconnected',
    NETWORK_RECONNECTED: 'Network reconnected',
}

const SLOT_COUNT = MAX_SCREEN_RECORDING_SEGMENTS

function formatDuration(totalSeconds?: number | null): string {
    if (!totalSeconds || totalSeconds <= 0) return '—'
    const s = Math.round(totalSeconds)
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    if (h > 0) return `${h}h ${m}m ${sec}s`
    if (m > 0) return `${m}m ${sec}s`
    return `${sec}s`
}

function formatDateTime(iso?: string | null): string {
    if (!iso) return '—'
    return new Date(iso).toLocaleString()
}

function formatClock(iso?: string | null): string {
    if (!iso) return '—'
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatSegmentWindow(slotIndex: number, examDurationMinutes?: number | null): string {
    const totalMin =
        typeof examDurationMinutes === 'number' && examDurationMinutes > 0
            ? examDurationMinutes
            : null
    if (totalMin == null) return `Clip ${slotIndex + 1}`
    const segmentMin = totalMin / SLOT_COUNT
    const start = Math.round(slotIndex * segmentMin * 10) / 10
    const end = Math.round((slotIndex + 1) * segmentMin * 10) / 10
    return `Clip ${slotIndex + 1} · ${start}–${end} min`
}

export function ScreenRecordingReview({
    assessmentId,
    attemptId,
    enabled,
    examDurationMinutes,
}: {
    assessmentId: string
    attemptId: string
    enabled: boolean
    /** Assessment total duration — used to label the 4 expected clip windows. */
    examDurationMinutes?: number | null
}) {
    const [info, setInfo] = useState<RecordingInfo | null>(null)
    const [infoState, setInfoState] = useState<'loading' | 'error' | 'ready'>('loading')
    const [events, setEvents] = useState<ProctoringEvent[]>([])
    const [playback, setPlayback] = useState<Record<string, PlaybackEntry>>({})
    const [watchError, setWatchError] = useState<string | null>(null)
    const [watching, setWatching] = useState(false)

    useEffect(() => {
        if (!enabled) return
        let cancelled = false
        setInfo(null)
        setInfoState('loading')
        setEvents([])
        setPlayback({})
        setWatchError(null)

        const load = async () => {
            try {
                const data: RecordingInfo = await apiClient.get(
                    `/admin/assessments/${assessmentId}/attempts/${attemptId}/screen-recordings`
                )
                if (!cancelled) {
                    setInfo(data)
                    setInfoState('ready')
                }
            } catch {
                if (!cancelled) setInfoState('error')
            }
            try {
                const ev = await apiClient.get(
                    `/admin/assessments/${assessmentId}/attempts/${attemptId}/proctoring/events`
                )
                if (!cancelled) setEvents(ev?.events || [])
            } catch {
                /* Timeline stays empty — recording info is the primary content. */
            }
        }

        void load()
        return () => {
            cancelled = true
        }
    }, [assessmentId, attemptId, enabled])

    const slots = useMemo(() => {
        const byIndex = new Map<number, RecordingChunk>()
        for (const rec of info?.recordings || []) {
            const idx = typeof rec.chunk_index === 'number' ? rec.chunk_index : null
            if (idx == null || idx < 0 || idx >= SLOT_COUNT) continue
            // Prefer available recordings if duplicates exist
            const existing = byIndex.get(idx)
            if (!existing || (rec.available && !existing.available)) {
                byIndex.set(idx, rec)
            }
        }
        return Array.from({ length: SLOT_COUNT }, (_, i) => ({
            slotIndex: i,
            label: formatSegmentWindow(i, examDurationMinutes),
            recording: byIndex.get(i) || null,
        }))
    }, [info, examDurationMinutes])

    const playableSlots = useMemo(
        () => slots.filter((s) => s.recording?.available),
        [slots]
    )

    const handleWatch = useCallback(async () => {
        if (!playableSlots.length) {
            setWatchError('No uploaded recording clips are available for playback yet.')
            return
        }

        setWatching(true)
        setWatchError(null)
        setPlayback(
            Object.fromEntries(
                playableSlots.map((s) => [s.recording!.recording_id, { status: 'loading' as const }])
            )
        )

        await Promise.all(
            playableSlots.map(async (slot) => {
                const chunk = slot.recording!
                try {
                    const res = await apiClient.post(
                        `/admin/assessments/${assessmentId}/attempts/${attemptId}/screen-recordings/${chunk.recording_id}/playback-url`,
                        { expires_in: 1800 }
                    )
                    setPlayback((prev) => ({
                        ...prev,
                        [chunk.recording_id]: { status: 'ready', url: res.playback_url },
                    }))
                } catch (err: any) {
                    const detail =
                        err?.response?.data?.detail || err?.message || 'Could not generate a playback URL.'
                    setPlayback((prev) => ({
                        ...prev,
                        [chunk.recording_id]: { status: 'error', message: String(detail) },
                    }))
                }
            })
        )
        setWatching(false)
    }, [playableSlots, assessmentId, attemptId])

    if (!enabled) return null

    const hasAnyUpload = Boolean(info && info.chunks_total > 0)
    const allFailed =
        info !== null &&
        info.chunks_total > 0 &&
        !info.available &&
        info.chunks_failed >= info.chunks_total
    const processing = info !== null && info.chunks_total > 0 && !info.available && !allFailed
    const noneRecorded = infoState === 'ready' && (!info || info.chunks_total === 0)

    const stateBadge = (() => {
        if (infoState === 'loading')
            return { label: 'Loading…', className: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' }
        if (infoState === 'error')
            return { label: 'Unavailable', className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' }
        if (noneRecorded)
            return { label: 'Not recorded', className: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' }
        if (allFailed)
            return { label: 'Failed', className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' }
        if (processing)
            return { label: 'Processing', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' }
        return { label: 'Ready', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' }
    })()

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Video className="h-5 w-5 text-blue-600" />
                        Screen Recording
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Up to {SLOT_COUNT} clips covering the exam (exam duration ÷ {SLOT_COUNT}).
                        Missing clips show as not recorded.
                    </p>
                </div>
                <span className={`shrink-0 px-2 py-1 text-xs font-semibold rounded-full ${stateBadge.className}`}>
                    {stateBadge.label}
                </span>
            </div>

            {infoState === 'loading' && (
                <div className="flex items-center justify-center gap-2 py-8 text-gray-500">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <span className="text-sm">Loading recording…</span>
                </div>
            )}

            {infoState === 'error' && (
                <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800 p-4 text-sm text-red-800 dark:text-red-200 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>Could not load the screen recording for this attempt. Refresh to try again.</span>
                </div>
            )}

            {infoState === 'ready' && noneRecorded && (
                <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 p-4 text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                    <VideoOff className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>Screen recording was not recorded for this attempt.</span>
                </div>
            )}

            {infoState === 'ready' && processing && info && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 p-4 text-sm text-amber-900 dark:text-amber-100 flex items-start gap-2">
                    <Loader2 className="h-4 w-4 mt-0.5 shrink-0 animate-spin" />
                    <span>
                        Recording is being processed
                        {info.chunks_uploaded > 0
                            ? ` (${info.chunks_uploaded}/${info.chunks_total} clips uploaded).`
                            : '…'}{' '}
                        Check back shortly.
                    </span>
                </div>
            )}

            {infoState === 'ready' && allFailed && (
                <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800 p-4 text-sm text-red-800 dark:text-red-200 flex items-start gap-2">
                    <VideoOff className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>
                        The screen recording failed to upload ({info?.chunks_failed} clip(s) failed).
                        No playable video is available for this attempt.
                    </span>
                </div>
            )}

            {infoState === 'ready' && hasAnyUpload && info && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Recording status</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                            {info.status?.toLowerCase() || 'uploaded'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Duration</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                            {formatDuration(info.duration)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Start time</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            {formatDateTime(info.started_at)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">End time</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            {formatDateTime(info.ended_at)}
                        </p>
                    </div>
                </div>
            )}

            {infoState === 'ready' && (
                <>
                    {info && info.chunks_failed > 0 && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 p-3 text-sm text-amber-900 dark:text-amber-100 flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>
                                {info.chunks_failed} of {info.chunks_total} recording clip(s) failed to
                                upload. Available clips are shown below.
                            </span>
                        </div>
                    )}

                    {playableSlots.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                onClick={() => void handleWatch()}
                                disabled={watching}
                                className="gap-2"
                            >
                                {watching ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Play className="h-4 w-4" />
                                )}
                                Watch Recording
                            </Button>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                Playback links expire 30 minutes after being generated.
                            </span>
                        </div>
                    )}

                    {watchError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800 p-3 text-sm text-red-800 dark:text-red-200">
                            {watchError}
                        </div>
                    )}

                    <div className="space-y-3">
                        {slots.map((slot) => {
                            const chunk = slot.recording
                            const entry = chunk ? playback[chunk.recording_id] : undefined
                            const available = Boolean(chunk?.available)

                            return (
                                <div key={slot.slotIndex}>
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                        {slot.label}
                                        {chunk?.duration ? ` · ${formatDuration(chunk.duration)}` : ''}
                                    </p>
                                    {!available && (
                                        <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 py-10 text-center text-sm text-gray-500 dark:text-gray-400 flex flex-col items-center gap-2">
                                            <VideoOff className="h-5 w-5" />
                                            Not recorded
                                        </div>
                                    )}
                                    {available && !entry && (
                                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 py-8 text-center text-sm text-gray-500">
                                            Click Watch Recording to load this clip.
                                        </div>
                                    )}
                                    {available && entry?.status === 'loading' && (
                                        <div className="flex items-center justify-center gap-2 rounded-lg bg-black/80 py-16 text-gray-300">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span className="text-sm">Preparing playback…</span>
                                        </div>
                                    )}
                                    {available && entry?.status === 'error' && (
                                        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800 p-3 text-sm text-red-800 dark:text-red-200 flex items-center justify-between gap-2">
                                            <span>{entry.message}</span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1 shrink-0"
                                                onClick={() => void handleWatch()}
                                            >
                                                <RefreshCw className="h-3.5 w-3.5" />
                                                Retry
                                            </Button>
                                        </div>
                                    )}
                                    {available && entry?.status === 'ready' && (
                                        <video
                                            controls
                                            preload="metadata"
                                            src={entry.url}
                                            className="w-full rounded-lg bg-black max-h-[420px]"
                                            onError={() =>
                                                setPlayback((prev) => ({
                                                    ...prev,
                                                    [chunk!.recording_id]: {
                                                        status: 'error',
                                                        message:
                                                            'Playback failed — the link may have expired. Click Watch Recording to refresh it.',
                                                    },
                                                }))
                                            }
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </>
            )}

            {events.length > 0 && (
                <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                        <Activity className="h-4 w-4 text-blue-600" />
                        Proctoring event timeline
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Events are indicators for review — not proof of misconduct.
                    </p>
                    <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-1.5 space-y-3">
                        {events.map((ev) => {
                            const highPriority = ev.metadata?.priority === 'high'
                            return (
                                <li key={ev.id} className="relative ml-4">
                                    <span
                                        className={`absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full ${
                                            highPriority
                                                ? 'bg-red-500'
                                                : 'bg-blue-400 dark:bg-blue-600'
                                        }`}
                                    />
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {formatClock(ev.occurred_at)}
                                        </span>
                                        <span className="text-sm text-gray-600 dark:text-gray-300">
                                            {EVENT_LABELS[ev.event_type] || ev.event_type}
                                        </span>
                                        {highPriority && (
                                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                                                High priority
                                            </span>
                                        )}
                                    </div>
                                </li>
                            )
                        })}
                    </ol>
                </div>
            )}
        </div>
    )
}
