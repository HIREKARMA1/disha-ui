"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, Users, Trophy, Loader2 } from 'lucide-react'
import { contestEventService } from '@/services/contestEventService'
import type { ContestEventListItem } from '@/types/contestEvent'
import { CONTEST_STATUS_LABELS } from '@/types/contestEvent'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface UpcomingEventsCardProps {
  className?: string
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

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Events</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Events</h3>
          <Link href="/events" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
            View All
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
          <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming events at the moment.</p>
          <Link href="/events" className="text-sm text-primary-600 dark:text-primary-400 hover:underline mt-2 inline-block">
            Browse all events
          </Link>
        </div>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    upcoming: 'from-blue-500 to-indigo-600',
    live: 'from-green-500 to-emerald-600',
    closed: 'from-gray-500 to-gray-600',
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Events</h3>
        <Link href="/events" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="space-y-3">
        {events.map((event, index) => {
          const slug = event.slug || event.id
          const deadline = event.registration_end_date
            ? new Date(event.registration_end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
            : null
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <Link href={`/events/${slug}`} className="block group">
                <div className={cn(
                  'rounded-xl p-4 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 bg-gradient-to-r',
                  statusColors[event.contest_status] || statusColors.upcoming
                )}>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className="bg-white/20 text-white text-xs border-0">
                      {CONTEST_STATUS_LABELS[event.contest_status]}
                    </Badge>
                    {deadline && (
                      <span className="text-xs text-white/80 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {deadline}
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-sm line-clamp-2 mb-1">{event.title}</h4>
                  {event.organizer_name && (
                    <p className="text-xs text-white/80 mb-2">{event.organizer_name}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-white/90">
                      {event.prize_pool && (
                        <span className="flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> {event.prize_pool}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {event.participant_count}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
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
