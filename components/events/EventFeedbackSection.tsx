"use client"

import { useState } from 'react'
import { CheckCircle, Loader2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { contestEventService } from '@/services/contestEventService'
import type { EventFeedbackItem } from '@/types/contestEvent'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

const QUICK_OPTIONS = ['Very Good', 'Good', 'Average', 'Poor'] as const
const MAX_FEEDBACK_LENGTH = 2000

interface EventFeedbackSectionProps {
  slug: string
  isClosed: boolean
  isRegistered: boolean
  canSubmit: boolean
  submitted: EventFeedbackItem | null
  onSubmitted: (feedback: EventFeedbackItem) => void
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
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Event rating">
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
            onClick={() => onChange?.(star)}
            className={cn(
              'rounded-md p-1 transition-colors',
              disabled ? 'cursor-default' : 'cursor-pointer hover:scale-105',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
            )}
          >
            <Star
              className={cn(
                'h-7 w-7 sm:h-8 sm:w-8',
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-300 dark:text-gray-600'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

function SubmittedState({ feedback }: { feedback: EventFeedbackItem }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 md:rounded-xl md:p-5">
      <div className="mb-3 flex items-center gap-2 text-green-700 dark:text-green-300">
        <CheckCircle className="h-5 w-5 shrink-0" />
        <h3 className="font-semibold">Thank you for your feedback!</h3>
      </div>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Your feedback has been submitted successfully.
      </p>
      <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Your rating</p>
      <StarRating value={feedback.rating} disabled />
      {feedback.feedback ? (
        <p className="mt-4 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
          {feedback.feedback}
        </p>
      ) : null}
    </div>
  )
}

export function EventFeedbackSection({
  slug,
  isClosed,
  isRegistered,
  canSubmit,
  submitted,
  onSubmitted,
}: EventFeedbackSectionProps) {
  const [rating, setRating] = useState(submitted?.rating || 0)
  const [quick, setQuick] = useState<string | null>(null)
  const [text, setText] = useState(submitted?.feedback || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isClosed || !isRegistered) return null

  if (submitted) {
    return <SubmittedState feedback={submitted} />
  }

  if (!canSubmit) return null

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      setError('Please select a rating from 1 to 5 stars.')
      return
    }
    const combined = [quick, text.trim()].filter(Boolean).join('\n')
    if (combined.length > MAX_FEEDBACK_LENGTH) {
      setError(`Feedback must be ${MAX_FEEDBACK_LENGTH} characters or fewer.`)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const result = await contestEventService.submitEventFeedback(slug, {
        rating,
        feedback: combined || undefined,
      })
      toast.success('Thank you for your feedback!')
      onSubmitted(result)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { detail?: string } } })?.response?.status
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      if (status === 409) {
        setError('You have already submitted feedback for this event.')
      } else {
        setError(typeof detail === 'string' ? detail : 'Unable to submit feedback. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 md:rounded-xl md:p-5">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">How was the event?</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Rate your experience from 1 to 5 stars.</p>
      <div className="mt-3">
        <StarRating value={rating} onChange={setRating} disabled={submitting} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            disabled={submitting}
            onClick={() => setQuick(quick === option ? null : option)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm transition-colors',
              quick === option
                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-300'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-900/40'
            )}
          >
            {option}
          </button>
        ))}
      </div>

      <label className="mt-5 block text-sm font-medium text-gray-900 dark:text-white">
        Share your feedback
      </label>
      <Textarea
        className="mt-2 min-h-[120px]"
        placeholder="Tell us what you liked or what we can improve..."
        maxLength={MAX_FEEDBACK_LENGTH}
        value={text}
        disabled={submitting}
        onChange={(e) => setText(e.target.value)}
      />
      <p className="mt-1 text-right text-xs text-gray-400">
        {text.length}/{MAX_FEEDBACK_LENGTH}
      </p>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <Button
        className="mt-4 w-full sm:w-auto"
        onClick={() => void handleSubmit()}
        disabled={submitting || rating < 1}
      >
        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Submit Feedback
      </Button>
    </div>
  )
}
