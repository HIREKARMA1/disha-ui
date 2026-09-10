'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, Users, Trophy, Loader2, Clock } from 'lucide-react'
import { contestEventService } from '@/services/contestEventService'
import type { ContestEventListItem } from '@/types/contestEvent'
import { CONTEST_STATUS_LABELS } from '@/types/contestEvent'
import { StudentSectionCard } from '@/components/student/ui/StudentSectionCard'
import { cn } from '@/lib/utils'

interface UpcomingEventsCardProps {
  className?: string
}

function getCountdown(target?: string) {
  if (!target) return null
  const diff = new Date(target).getTime() - Date.now()
  if (diff <= 0) return null
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days > 0) return `${days}d left`
  const hours = Math.floor(diff / (1000 * 60 * 60))
  return hours > 0 ? `${hours}h left` : 'Soon'
}

export function UpcomingEventsCard({ className = '' }: UpcomingEventsCardProps) {
  const [events, setEvents] = useState<ContestEventListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    contestEventService.getUpcomingEvents(5)
      .then((res) => setEvents(res.events))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  const header = (
    <div className="mb-4 flex items-start justify-between gap-3">
      <h3 className="flex items-center gap-2 text-lg font-bold tracking-tight text-gray-900 dark:text-white">
        <span className="h-5 w-1 shrink-0 rounded-sm bg-primary-500" aria-hidden />
        Upcoming Events
      </h3>
      <Link
        href="/events"
        className={cn(
          'group inline-flex shrink-0 items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5',
          'text-xs font-semibold text-primary-700 shadow-sm transition-colors',
          'hover:border-primary-400 hover:bg-primary-100',
          'dark:border-primary-800 dark:bg-primary-950/50 dark:text-primary-300 dark:hover:bg-primary-900/60'
        )}
      >
        <span>View All</span>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white transition-transform group-hover:translate-x-0.5">
          <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
        </span>
      </Link>
    </div>
  )

  if (loading) {
    return (
      <StudentSectionCard className={className}>
        {header}
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
        </div>
      </StudentSectionCard>
    )
  }

  if (events.length === 0) {
    return (
      <StudentSectionCard className={className}>
        {header}
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/60 p-6 text-center dark:border-gray-600 dark:bg-gray-800/40">
          <Calendar className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming events right now.</p>
        </div>
      </StudentSectionCard>
    )
  }

  return (
    <StudentSectionCard className={cn('relative z-0 h-auto overflow-visible', className)}>
      {header}
      <div className="relative z-0 space-y-3 overflow-visible">
        {events.map((event, index) => {
          const slug = event.slug || event.id
          const eventDate = event.event_start_date
            ? new Date(event.event_start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
            : null
          const countdown = getCountdown(event.registration_end_date || event.event_start_date)
          const mediaSrc = event.banner_url || event.organizer_logo_url

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              className="relative z-0"
            >
              <Link href={`/events/${slug}`} className="group block">
                <div
                  className={cn(
                    'overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm',
                    'transition-[box-shadow,border-color] duration-200',
                    'hover:border-primary-200 hover:shadow-md',
                    'dark:border-gray-700 dark:bg-gray-900 dark:hover:border-primary-800'
                  )}
                >
                  <div className="relative aspect-[2.4/1] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {mediaSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={mediaSrc}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Trophy className="h-7 w-7 text-gray-300 dark:text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="p-3.5">
                    <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="rounded border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:border-gray-600 dark:text-gray-300">
                        {CONTEST_STATUS_LABELS[event.contest_status]}
                      </span>
                      {countdown && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                          <Clock className="h-3 w-3" /> {countdown}
                        </span>
                      )}
                    </div>
                    <h4 className="line-clamp-2 text-[15px] font-semibold leading-snug text-gray-900 transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
                      {event.title}
                    </h4>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                      {eventDate && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                          {eventDate}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        {event.participant_count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </StudentSectionCard>
  )
}
