"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, Users, Trophy, Loader2, Clock } from 'lucide-react'
import { contestEventService } from '@/services/contestEventService'
import type { ContestEventListItem } from '@/types/contestEvent'
import { CONTEST_STATUS_LABELS } from '@/types/contestEvent'
import { Badge } from '@/components/ui/badge'
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
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Upcoming Events</h3>
      <Link
        href="/events"
        className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center gap-1 transition-colors"
      >
        View All <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  )

  if (loading) {
    return (
      <div className={className}>
        {header}
        <div className="flex items-center justify-center py-10 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className={className}>
        {header}
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/40 p-6 text-center">
          <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming events right now.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {header}
      <div className="space-y-3">
        {events.map((event, index) => {
          const slug = event.slug || event.id
          const eventDate = event.event_start_date
            ? new Date(event.event_start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
            : null
          const countdown = getCountdown(event.registration_end_date || event.event_start_date)

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
            >
              <Link href={`/events/${slug}`} className="block group">
                <div className="relative overflow-hidden rounded-xl border border-gray-200/80 dark:border-gray-700/80 bg-white dark:bg-gray-800/90 p-3.5 shadow-sm hover:shadow-md hover:border-primary-300/50 dark:hover:border-primary-600/40 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex gap-3">
                    {event.organizer_logo_url ? (
                      <div className="h-12 w-12 shrink-0 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 p-1.5 shadow-sm">
                        <img src={event.organizer_logo_url} alt="" className="h-full w-full object-contain" />
                      </div>
                    ) : (
                      <div className="h-12 w-12 shrink-0 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <Badge className="shrink-0 text-[10px] border-0 bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                          {CONTEST_STATUS_LABELS[event.contest_status]}
                        </Badge>
                        {countdown && (
                          <span className="shrink-0 text-[10px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> {countdown}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {event.title}
                      </h4>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                        {eventDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {eventDate}
                          </span>
                        )}
                        {event.prize_pool && (
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium truncate max-w-[120px]">
                            <Trophy className="w-3 h-3" /> {event.prize_pool}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {event.participant_count}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 shrink-0 self-center group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
