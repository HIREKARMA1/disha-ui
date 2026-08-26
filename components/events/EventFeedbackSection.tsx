"use client"

import { useCallback, useEffect, useState } from 'react'
import { CheckCircle, Loader2, Star } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { contestEventService } from '@/services/contestEventService'
import type { EventFeedbackItem } from '@/types/contestEvent'
import { EVENT_FEEDBACK_MAX_LENGTH } from '@/types/contestEvent'
import { cn } from '@/lib/utils'

interface EventFeedbackSectionProps {
  slug: string
  isRegistered: boolean
}

function StarRating({
  value,
  onChange,
  disabled,
}: {
  value: number
  onChange?: (rating: number) => void
  disabled?: boolean
}) {
  const [hovered, setHovered] = useState(0)
  const display = hovered || value

  return (
    <div
      className="flex flex-wrap items-center gap-1 sm:gap-1.5"
      role="radiogroup"
      aria-label="Event rating"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= display
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
            disabled={disabled}
            onMouseEnter={() => !disabled && setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onFocus={() => !disabled && setHovered(star)}
            onBlur={() => setHovered(0)}
            onClick={() => onChange?.(star)}
            className={cn(
              'inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors sm:h-10 sm:w-10',
              disabled ? 'cursor-default' : 'hover:bg-primary-50 dark:hover:bg-primary-900/20'
            )}
          >
            <Star
              className={cn(
                'h-7 w-7 sm:h-6 sm:w-6',
                filled
                  ? 'fill-accent-yellow-500 text-accent-yellow-500'
                  : 'text-gray-300 dark:text-gray-600'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

function SubmittedView({ item }: { item: EventFeedbackItem }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-xl bg-green-50 px-4 py-3 text-green-800 dark:bg-green-900/20 dark:text-green-300">
        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <p className="text-sm font-medium">Thank you for your feedback!</p>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Your Rating</p>
        <StarRating value={item.rating} disabled />
      </div>
      {item.feedback ? (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Your Feedback</p>
          <p className="whitespace-pre-wrap break-words text-sm text-gray-700 dark:text-gray-300">
            {item.feedback}
          </p>
        </div>
      ) : null}
    </div>
  )
}

export function EventFeedbackSection({ slug, isRegistered }: EventFeedbackSectionProps) {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [canSubmit, setCanSubmit] = useState(false)
  const [submitted, setSubmitted] = useState<EventFeedbackItem | null>(null)
  const [maxLength, setMaxLength] = useState(EVENT_FEEDBACK_MAX_LENGTH)
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [ratingError, setRatingError] = useState('')
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(false)
    contestEventService
      .getMyFeedback(slug)
      .then((data) => {
        if (cancelled) return
        setLoadError(false)
        setCanSubmit(Boolean(data.can_submit))
        setSubmitted(data.feedback || null)
        setMaxLength(data.max_length || EVENT_FEEDBACK_MAX_LENGTH)
      })
      .catch(() => {
        if (cancelled) return
        setCanSubmit(false)
        setSubmitted(null)
        setLoadError(true)
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    if (loading) return
    if (typeof window === 'undefined') return
    if (window.location.hash !== '#feedback') return
    const timer = window.setTimeout(() => {
      document.getElementById('feedback')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 50)
    return () => window.clearTimeout(timer)
  }, [loading, canSubmit, submitted])

  const handleSubmit = useCallback(async () => {
    if (rating < 1 || rating > 5) {
      setRatingError('Please select a rating from 1 to 5 stars')
      return
    }
    setRatingError('')
    setSubmitting(true)
    try {
      const result = await contestEventService.submitFeedback(slug, {
        rating,
        feedback: feedback.trim() || undefined,
      })
      setSubmitted(result.feedback)
      setCanSubmit(false)
      toast.success(result.message || 'Thank you for your feedback!')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Unable to submit feedback'
      toast.error(typeof msg === 'string' ? msg : 'Unable to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }, [slug, rating, feedback])

  if (loading) {
    return <section id="feedback" className="scroll-mt-36" aria-hidden />
  }

  if (!canSubmit && !submitted) {
    if (loadError && isRegistered) {
      return (
        <section id="feedback" className="scroll-mt-36">
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white md:mb-4 md:text-xl">
            Review &amp; Feedback
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Unable to load feedback. Please try again.</p>
        </section>
      )
    }
    return null
  }

  const remaining = maxLength - feedback.length

  return (
    <section id="feedback" className="scroll-mt-36">
      <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white md:mb-4 md:text-xl">
        Review &amp; Feedback
      </h2>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 md:rounded-xl md:p-5">
        {submitted ? (
          <SubmittedView item={submitted} />
        ) : (
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                How was the event?
              </p>
              <StarRating value={rating} onChange={(value) => {
                setRating(value)
                setRatingError('')
              }} />
              {ratingError ? (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{ratingError}</p>
              ) : null}
            </div>
            <div>
              <label
                htmlFor="event-feedback-text"
                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
              >
                Share your feedback
              </label>
              <Textarea
                id="event-feedback-text"
                value={feedback}
                maxLength={maxLength}
                rows={4}
                placeholder="Your feedback..."
                onChange={(e) => setFeedback(e.target.value.slice(0, maxLength))}
                className="min-h-[120px] w-full"
              />
              <p className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
                {remaining} characters remaining
              </p>
            </div>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
