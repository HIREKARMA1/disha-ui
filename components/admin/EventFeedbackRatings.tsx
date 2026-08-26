"use client"

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { contestEventService } from '@/services/contestEventService'
import type { EventFeedbackAdminResponse } from '@/types/contestEvent'
import { cn } from '@/lib/utils'

interface EventFeedbackRatingsProps {
  eventId: string
}

function formatDateTime(value?: string) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'h-3.5 w-3.5',
            star <= rating
              ? 'fill-accent-yellow-500 text-accent-yellow-500'
              : 'text-gray-300 dark:text-gray-600'
          )}
        />
      ))}
    </span>
  )
}

export function EventFeedbackRatings({ eventId }: EventFeedbackRatingsProps) {
  const [data, setData] = useState<EventFeedbackAdminResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await contestEventService.getAdminFeedback(eventId, {
        page,
        limit: 25,
      })
      setData(result)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [eventId, page])

  useEffect(() => {
    void load()
  }, [load])

  const dist = data?.rating_distribution
  const distRows = dist
    ? [
        { label: 5, count: dist.five },
        { label: 4, count: dist.four },
        { label: 3, count: dist.three },
        { label: 2, count: dist.two },
        { label: 1, count: dist.one },
      ]
    : []
  const maxCount = Math.max(1, ...distRows.map((row) => row.count))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-accent-yellow-500" />
          Feedback &amp; Ratings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
          </div>
        ) : !data ? (
          <p className="text-sm text-gray-500">Failed to load feedback</p>
        ) : data.total_responses === 0 ? (
          <p className="text-sm text-gray-500">No feedback received yet.</p>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                <p className="text-xs text-gray-500 dark:text-gray-400">Average Rating</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {data.average_rating != null ? `${data.average_rating} / 5` : '—'}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Responses</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {data.total_responses}
                </p>
              </div>
            </div>

            <div className="mb-6 space-y-2">
              {distRows.map((row) => (
                <div key={row.label} className="flex items-center gap-3 text-sm">
                  <Stars rating={row.label} />
                  <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full bg-accent-yellow-500"
                      style={{ width: `${(row.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-medium text-gray-900 dark:text-white">
                    {row.count}
                  </span>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Candidate</th>
                    <th className="px-3 py-2 font-medium">Rating</th>
                    <th className="px-3 py-2 font-medium">Feedback</th>
                    <th className="px-3 py-2 font-medium">Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((row) => (
                    <tr key={row.id} className="border-b last:border-0 align-top">
                      <td className="px-3 py-2.5">
                        <div className="font-medium">{row.candidate_name || '—'}</div>
                        <div className="text-xs text-gray-500">{row.email || '—'}</div>
                      </td>
                      <td className="px-3 py-2.5">
                        <Stars rating={row.rating} />
                      </td>
                      <td className="px-3 py-2.5 max-w-sm whitespace-pre-wrap break-words text-gray-700 dark:text-gray-300">
                        {row.feedback || '—'}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {formatDateTime(row.submitted_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {data.total} total · Page {data.page} of {data.total_pages || 1}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.has_prev}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.has_next}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
