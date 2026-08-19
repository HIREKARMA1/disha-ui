"use client"

import { useEffect, useState } from 'react'
import { Loader2, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { contestEventService } from '@/services/contestEventService'
import type { EventFeedbackAnalytics } from '@/types/contestEvent'

interface EventFeedbackAnalyticsProps {
  eventId: string
}

function formatSubmittedAt(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function EventFeedbackAnalyticsSection({ eventId }: EventFeedbackAnalyticsProps) {
  const [data, setData] = useState<EventFeedbackAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    contestEventService
      .getFeedbackAnalytics(eventId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [eventId])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Unable to load feedback.</p>
        </CardContent>
      </Card>
    )
  }

  const maxCount = Math.max(1, ...[1, 2, 3, 4, 5].map((n) => data.rating_distribution[String(n)] || data.rating_distribution[n as unknown as string] || 0))

  const countFor = (star: number) =>
    data.rating_distribution[String(star)] ?? (data.rating_distribution as Record<number, number>)[star] ?? 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Feedback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
            <p className="text-xs uppercase tracking-wide text-gray-500">Average Rating</p>
            <p className="mt-1 flex items-center gap-1.5 text-2xl font-bold text-gray-900 dark:text-white">
              {data.total_ratings ? data.average_rating.toFixed(1) : '—'}
              <span className="text-sm font-medium text-gray-500">/ 5</span>
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
            <p className="text-xs uppercase tracking-wide text-gray-500">Total Responses</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{data.total_ratings}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
            <p className="text-xs uppercase tracking-wide text-gray-500">Written Feedback</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{data.feedback_count}</p>
          </div>
        </div>

        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = countFor(star)
            const width = Math.round((count / maxCount) * 100)
            return (
              <div key={star} className="flex items-center gap-3 text-sm">
                <span className="w-8 shrink-0 text-gray-600 dark:text-gray-400">{star} ★</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{ width: `${width}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-gray-500">{count}</span>
              </div>
            )
          })}
        </div>

        <div className="overflow-x-auto">
          {data.entries.length === 0 ? (
            <p className="text-sm text-gray-500">No feedback submitted yet.</p>
          ) : (
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-700">
                  <th className="py-2 pr-3 font-medium">User</th>
                  <th className="py-2 pr-3 font-medium">Rating</th>
                  <th className="py-2 pr-3 font-medium">Feedback</th>
                  <th className="py-2 font-medium">Submitted Date</th>
                </tr>
              </thead>
              <tbody>
                {data.entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                    <td className="py-3 pr-3 font-medium text-gray-900 dark:text-white">
                      {entry.user_name || 'Registered user'}
                    </td>
                    <td className="py-3 pr-3">
                      <span className="inline-flex items-center gap-1 text-gray-800 dark:text-gray-200">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {entry.rating}
                      </span>
                    </td>
                    <td className="max-w-xs py-3 pr-3 text-gray-600 dark:text-gray-400">
                      {entry.feedback || '—'}
                    </td>
                    <td className="whitespace-nowrap py-3 text-gray-500">
                      {formatSubmittedAt(entry.submitted_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
