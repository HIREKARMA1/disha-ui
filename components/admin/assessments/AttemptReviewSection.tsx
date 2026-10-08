"use client"

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, ShieldCheck } from 'lucide-react'

type ReviewStatus = 'PENDING' | 'PASS' | 'FAIL' | 'DISQUALIFIED'

const REVIEW_OPTIONS: { value: ReviewStatus; label: string }[] = [
    { value: 'PENDING', label: 'Not reviewed' },
    { value: 'PASS', label: 'Pass' },
    { value: 'FAIL', label: 'Fail' },
    { value: 'DISQUALIFIED', label: 'Disqualified' },
]

const OPTION_ACTIVE_CLASSES: Record<ReviewStatus, string> = {
    PENDING: 'bg-gray-500 text-white border-gray-500',
    PASS: 'bg-green-600 text-white border-green-600',
    FAIL: 'bg-red-600 text-white border-red-600',
    DISQUALIFIED: 'bg-amber-600 text-white border-amber-600',
}

const BADGE_CLASSES: Record<ReviewStatus, string> = {
    PENDING: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
    PASS: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-200',
    FAIL: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200',
    DISQUALIFIED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
}

function formatReviewedAt(value?: string | null): string {
    if (!value) return ''
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return String(value)
    return d.toLocaleString()
}

export function AttemptReviewSection({
    assessmentId,
    attemptId,
    attempt,
    onReviewUpdated,
}: {
    assessmentId: string
    attemptId: string
    attempt: any
    onReviewUpdated?: (
        attemptId: string,
        meta: {
            review_status: string
            review_remark?: string | null
            reviewed_by?: string | null
            reviewed_at?: string | null
            status?: string | null
        }
    ) => void
}) {
    const attemptStatus = String(attempt?.status || '').toUpperCase()
    const alreadyFailed =
        attemptStatus === 'FAILED' || attemptStatus === 'DISQUALIFIED'

    const savedStatus: ReviewStatus = ['PENDING', 'PASS', 'FAIL', 'DISQUALIFIED'].includes(
        attempt?.review_status
    )
        ? attempt.review_status
        : 'PENDING'
    const savedRemark: string = attempt?.review_remark || ''

    const [status, setStatus] = useState<ReviewStatus>(savedStatus)
    const [remark, setRemark] = useState<string>(savedRemark)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [justSaved, setJustSaved] = useState(false)

    useEffect(() => {
        setStatus(savedStatus)
        setRemark(savedRemark)
        setSaving(false)
        setError(null)
        setJustSaved(false)
        // Reset local state only when a different attempt is opened.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attemptId])

    // Already failed/disqualified — review not required; show read-only note if any.
    if (alreadyFailed && savedStatus === 'PENDING') {
        return (
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    Manual review
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    This attempt is already {attemptStatus === 'DISQUALIFIED' ? 'disqualified' : 'failed'}.
                    Manual review is not required.
                </p>
            </div>
        )
    }

    if (alreadyFailed) {
        return (
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    Manual review
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    This attempt is already {attemptStatus === 'DISQUALIFIED' ? 'disqualified' : 'failed'}.
                    Manual review is not required.
                </p>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${BADGE_CLASSES[savedStatus]}`}
                    >
                        {savedStatus}
                    </span>
                    {savedRemark && (
                        <span className="text-gray-600 dark:text-gray-300">{savedRemark}</span>
                    )}
                </div>
            </div>
        )
    }

    const isDirty = status !== savedStatus || remark !== savedRemark
    const previouslyReviewed = savedStatus !== 'PENDING'
    const remarkRequired = status === 'FAIL' || status === 'DISQUALIFIED'
    const canSave =
        isDirty &&
        !saving &&
        (!remarkRequired || Boolean(remark.trim()))

    const handleSave = async () => {
        if (!canSave) return

        if (remarkRequired && !remark.trim()) {
            setError('A reason is required when marking Fail or Disqualified.')
            return
        }

        if (previouslyReviewed) {
            const ok = window.confirm(
                `This attempt was already reviewed as "${savedStatus}". Overwrite the review decision?`
            )
            if (!ok) return
        }

        setSaving(true)
        setError(null)
        setJustSaved(false)
        try {
            const data = await apiClient.put(
                `/admin/assessments/${assessmentId}/attempts/${attemptId}/review`,
                {
                    review_status: status,
                    review_remark: remark.trim() ? remark.trim() : null,
                }
            )
            onReviewUpdated?.(attemptId, {
                review_status: data?.review_status ?? status,
                review_remark: data?.review_remark ?? (remark.trim() || null),
                reviewed_by: data?.reviewed_by ?? null,
                reviewed_at: data?.reviewed_at ?? null,
                status: data?.status ?? undefined,
            })
            setJustSaved(true)
        } catch (err: any) {
            const detail =
                err?.response?.data?.detail || err?.message || 'Failed to save review'
            setError(typeof detail === 'string' ? detail : 'Failed to save review')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Manual review
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Review this candidate after checking proctoring evidence. Marking Fail or
                Disqualified updates the attempt result and requires a reason.
            </p>

            {previouslyReviewed && (
                <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${BADGE_CLASSES[savedStatus]}`}
                    >
                        {savedStatus}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                        Reviewed
                        {attempt?.reviewed_by ? ` by ${attempt.reviewed_by}` : ''}
                        {attempt?.reviewed_at
                            ? ` on ${formatReviewedAt(attempt.reviewed_at)}`
                            : ''}
                    </span>
                </div>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
                {REVIEW_OPTIONS.map((opt) => {
                    const active = status === opt.value
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setStatus(opt.value)}
                            className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                                active
                                    ? OPTION_ACTIVE_CLASSES[opt.value]
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            {opt.label}
                        </button>
                    )
                })}
            </div>

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Review remark{remarkRequired ? ' (required)' : ''}
            </label>
            <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder={
                    remarkRequired
                        ? 'Required — explain why this attempt is failed or disqualified'
                        : 'Optional — note the reason for the decision (max 2000 characters)'
                }
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{remark.length}/2000</p>

            {error && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
            )}

            <div className="flex items-center gap-3 mt-3">
                <Button onClick={handleSave} disabled={!canSave}>
                    {saving ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving…
                        </span>
                    ) : (
                        'Save review'
                    )}
                </Button>
                {justSaved && !error && (
                    <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        Review saved
                    </span>
                )}
                <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Saved to audit trail
                </span>
            </div>
        </div>
    )
}
