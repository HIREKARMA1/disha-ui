"use client"

import Link from 'next/link'
import { Calendar, Users, Trophy, Building2, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ContestEventListItem } from '@/types/contestEvent'
import { CONTEST_STATUS_LABELS, CATEGORY_LABELS } from '@/types/contestEvent'
import { cn } from '@/lib/utils'

interface EventCardProps {
  event: ContestEventListItem
}

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  live: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  closed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  archived: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
}

export function EventCard({ event }: EventCardProps) {
  const slug = event.slug || event.id
  const deadline = event.registration_end_date
    ? new Date(event.registration_end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Banner */}
      <div className="relative h-40 bg-gradient-to-br from-primary-500 to-secondary-500 overflow-hidden">
        {event.banner_url ? (
          <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Trophy className="w-12 h-12 text-white/60" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className={cn('text-xs', statusColors[event.contest_status] || statusColors.upcoming)}>
            {CONTEST_STATUS_LABELS[event.contest_status] || event.contest_status}
          </Badge>
          {event.registration_is_open && (
            <Badge className="bg-accent-green-500/90 text-white text-xs">Reg. Open</Badge>
          )}
        </div>
        {event.organizer_logo_url && (
          <div className="absolute bottom-3 left-3 w-10 h-10 rounded-lg bg-white dark:bg-gray-800 p-1 shadow">
            <img src={event.organizer_logo_url} alt="" className="w-full h-full object-contain rounded" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {event.category && (
          <span className="text-xs text-primary-600 dark:text-primary-400 font-medium uppercase tracking-wide">
            {CATEGORY_LABELS[event.category] || event.category}
          </span>
        )}
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-1 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {event.title}
        </h3>
        {event.short_description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{event.short_description}</p>
        )}

        <div className="mt-3 space-y-1.5">
          {event.prize_pool && (
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="w-3.5 h-3.5 text-accent-yellow-500 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300 font-medium truncate">{event.prize_pool}</span>
            </div>
          )}
          {event.organizer_name && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{event.organizer_name}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{event.participant_count}{event.max_participants ? ` / ${event.max_participants}` : ''} participants</span>
            </div>
            {deadline && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{deadline}</span>
              </div>
            )}
          </div>
        </div>

        {event.is_registered && (
          <Badge className="mt-2 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
            Registered
          </Badge>
        )}

        <Link href={`/events/${slug}`} className="block mt-4">
          <Button className="w-full" size="sm">View Event</Button>
        </Link>
      </div>
    </div>
  )
}
