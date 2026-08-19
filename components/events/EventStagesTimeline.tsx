"use client"

import { Calendar } from 'lucide-react'
import type { RoundItem } from '@/types/contestEvent'
import { sanitizeEventDescriptionHtml } from '@/lib/sanitizeHtml'
import { cn } from '@/lib/utils'

const IST = 'Asia/Kolkata'

function formatBadgeDate(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    timeZone: IST,
  })
}

export function formatRangeDateTime(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const datePart = date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: IST,
  })
  const timePart = date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: IST,
  })
  return `${datePart}, ${timePart} IST`
}

function getRoundStatus(round: RoundItem, now: number): 'live' | 'upcoming' | 'completed' | null {
  const start = round.start_date ? new Date(round.start_date).getTime() : NaN
  const end = round.end_date ? new Date(round.end_date).getTime() : NaN
  const hasStart = !Number.isNaN(start)
  const hasEnd = !Number.isNaN(end)
  if (!hasStart && !hasEnd) return null
  if (hasStart && now < start) return 'upcoming'
  if (hasEnd && now > end) return 'completed'
  if (hasStart && !hasEnd && now >= start) return 'live'
  if (hasStart && hasEnd && now >= start && now <= end) return 'live'
  if (!hasStart && hasEnd && now <= end) return 'live'
  return null
}

const STATUS_STYLES: Record<string, string> = {
  live: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  upcoming: 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  completed: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
}

const STATUS_LABELS: Record<string, string> = {
  live: 'Live',
  upcoming: 'Upcoming',
  completed: 'Completed',
}

interface EventStagesTimelineProps {
  rounds: RoundItem[]
  now?: number
}

export function EventStagesTimeline({ rounds, now = Date.now() }: EventStagesTimelineProps) {
  if (!rounds.length) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        Timeline details will be announced soon.
      </p>
    )
  }

  return (
    <ol className="relative space-y-0 overflow-x-hidden">
      {rounds.map((round, i) => {
        const badge = formatBadgeDate(round.start_date || round.end_date)
        const startLabel = formatRangeDateTime(round.start_date)
        const endLabel = formatRangeDateTime(round.end_date)
        const status = getRoundStatus(round, now)
        const isLast = i === rounds.length - 1

        return (
          <li key={round.id || i} className="relative grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-x-5">
            <div className="relative flex flex-col items-center">
              <span
                className={cn(
                  'z-10 inline-flex min-h-[1.75rem] min-w-[3.75rem] items-center justify-center rounded-full bg-primary-500 px-2.5 py-1 text-center text-[11px] font-semibold leading-tight text-white sm:min-w-[4.5rem] sm:text-xs'
                )}
              >
                {badge || <Calendar className="h-3.5 w-3.5" />}
              </span>
              {!isLast && (
                <span
                  aria-hidden
                  className="absolute top-8 bottom-0 left-1/2 w-0 -translate-x-1/2 border-l-2 border-dashed border-primary-300 dark:border-primary-700"
                />
              )}
            </div>

            <div className={cn('min-w-0', isLast ? 'pb-0' : 'pb-8 md:pb-10')}>
              {(startLabel || endLabel) && (
                <p className="mb-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400 sm:text-sm">
                  {startLabel || 'TBA'}
                  {endLabel ? ` → ${endLabel}` : ''}
                </p>
              )}
              <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 md:rounded-xl md:p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white">{round.title}</h3>
                {round.description ? (
                  <div
                    className="event-description-html prose prose-sm dark:prose-invert mt-1 max-w-none text-sm text-gray-600 dark:text-gray-400"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeEventDescriptionHtml(round.description, ''),
                    }}
                  />
                ) : null}
                {status && (
                  <span
                    className={cn(
                      'mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      STATUS_STYLES[status]
                    )}
                  >
                    {status === 'live' && (
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden />
                    )}
                    {STATUS_LABELS[status]}
                  </span>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
