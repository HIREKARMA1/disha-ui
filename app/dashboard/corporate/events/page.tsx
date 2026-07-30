'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Loader2, ExternalLink } from 'lucide-react'
import { CorporateDashboardLayout } from '@/components/dashboard/CorporateDashboardLayout'
import { CorporatePageHero } from '@/components/corporate/ui/CorporatePageHero'
import { CorporateGlassCard } from '@/components/corporate/ui/CorporateGlassCard'
import { ContestCard } from '@/components/events/EventCard'
import { contestEventService } from '@/services/contestEventService'
import type { ContestEventListItem } from '@/types/contestEvent'

export default function CorporateEventsPage() {
  const [events, setEvents] = useState<ContestEventListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await contestEventService.getUpcomingEvents(50)
      const list = (res.events || []).filter((event) => {
        if (event.is_cancelled) return false
        if (event.contest_status === 'cancelled' || event.contest_status === 'archived') return false
        if (event.contest_status === 'closed' || event.contest_status === 'draft') return false
        if (event.is_published === false) return false
        return event.contest_status === 'upcoming' || event.contest_status === 'live'
      })
      setEvents(list)
    } catch {
      setError('Failed to load events. Please try again.')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <CorporateDashboardLayout>
      <div className="space-y-4 sm:space-y-6 max-w-[1400px] mx-auto">
        <CorporatePageHero
          title="Upcoming Events 📅"
          subtitle="Discover HireKarma contests, drives, and sessions for your hiring pipeline."
          chips={[
            {
              label: new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              }),
              tone: 'blue',
              icon: <Calendar className="w-3.5 h-3.5" />,
            },
          ]}
          actions={
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-sm font-medium transition-colors"
            >
              Open Events Module
              <ExternalLink className="w-4 h-4" />
            </Link>
          }
        />

        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-gray-100 dark:bg-white/[0.04] animate-pulse"
              />
            ))}
            <div className="sr-only" aria-live="polite">
              <Loader2 className="animate-spin" /> Loading events
            </div>
          </div>
        )}

        {error && !loading && (
          <CorporateGlassCard>
            <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
            <button
              type="button"
              onClick={load}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Retry
            </button>
          </CorporateGlassCard>
        )}

        {!loading && !error && events.length === 0 && (
          <CorporateGlassCard>
            <div className="text-center py-10">
              <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                No upcoming events
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Events will appear here once available.
              </p>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
              >
                Browse all contests
              </Link>
            </div>
          </CorporateGlassCard>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="space-y-4">
            {events.map((event) => (
              <ContestCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </CorporateDashboardLayout>
  )
}
