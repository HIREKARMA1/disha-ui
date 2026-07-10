"use client"

import Link from 'next/link'
import { Calendar, Users, Trophy, Building2, Clock, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ContestEventListItem } from '@/types/contestEvent'
import { CONTEST_STATUS_LABELS, CATEGORY_LABELS } from '@/types/contestEvent'
import { cn } from '@/lib/utils'

interface EventCardProps {
  event: ContestEventListItem
}

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  live: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  closed: 'bg-gray-500/15 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  postponed: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  cancelled: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
}

function formatEventDate(iso?: string) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function EventCard({ event }: EventCardProps) {
  const slug = event.slug || event.id
  const deadline = formatEventDate(event.registration_end_date)
  const eventDate = formatEventDate(event.event_start_date)

  return (
    <article
      className={cn(
        'group flex w-full flex-col overflow-hidden rounded-2xl border border-gray-200/80 dark:border-gray-700/80',
        'bg-white dark:bg-gray-800/90 shadow-sm hover:shadow-xl hover:shadow-primary-500/10',
        'transition-all duration-300 hover:-translate-y-0.5',
        'md:flex-row'
      )}
    >
      {/* Left: banner + logo */}
      <div className="relative h-48 w-full shrink-0 overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 md:h-auto md:min-h-[200px] md:w-2/5 lg:w-5/12">
        {event.banner_url ? (
          <img
            src={event.banner_url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full min-h-[12rem] w-full items-center justify-center">
            <Trophy className="h-12 w-12 text-white/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {event.organizer_logo_url && (
          <div className="absolute bottom-3 left-3 h-12 w-12 rounded-xl border-2 border-white/30 bg-white/95 p-1.5 shadow-lg backdrop-blur-sm dark:bg-gray-900/95">
            <img src={event.organizer_logo_url} alt="" className="h-full w-full object-contain" />
          </div>
        )}
      </div>

      {/* Right: details */}
      <div className="flex min-w-0 flex-1 flex-col p-5 md:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {event.category && (
            <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider">
              {CATEGORY_LABELS[event.category] || event.category}
            </Badge>
          )}
          <Badge className={cn('border text-[10px]', statusColors[event.contest_status] || statusColors.upcoming)}>
            {CONTEST_STATUS_LABELS[event.contest_status] || event.contest_status}
          </Badge>
          {event.registration_is_open && (
            <Badge className="border-0 bg-emerald-500 text-[10px] text-white">Registration Open</Badge>
          )}
          {event.is_registered && (
            <Badge className="border-0 bg-primary-500 text-[10px] text-white">Registered</Badge>
          )}
        </div>

        <h3 className="text-lg font-bold leading-snug text-gray-900 break-words line-clamp-2 transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400 md:text-xl">
          {event.title}
        </h3>

        {event.short_description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {event.short_description}
          </p>
        )}

        <div className="mt-4 space-y-2 text-sm">
          {event.prize_pool && (
            <div className="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400">
              <Trophy className="h-4 w-4 shrink-0" />
              <span className="truncate">{event.prize_pool}</span>
            </div>
          )}
          {event.organizer_name && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="truncate">{event.organizer_name}</span>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {event.participant_count}{event.max_participants ? ` / ${event.max_participants}` : ''} participants
            </span>
            {eventDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {eventDate}
              </span>
            )}
            {deadline && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Reg. by {deadline}
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto pt-5">
          <Link href={`/events/${slug}`} className="inline-block w-full sm:w-auto">
            <Button className="group/btn w-full sm:w-auto" size="sm">
              View Event
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  )
}
