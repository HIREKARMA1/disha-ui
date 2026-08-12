"use client"

import { memo } from 'react'
import Link from 'next/link'
import {
  Trophy,
  Users,
  Clock,
  MapPin,
  Wifi,
  ArrowRight,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ContestEventListItem } from '@/types/contestEvent'
import { CONTEST_STATUS_LABELS, CATEGORY_LABELS } from '@/types/contestEvent'
import { cn } from '@/lib/utils'

interface ContestCardProps {
  event: ContestEventListItem
}

const statusStyles: Record<string, string> = {
  upcoming: 'bg-blue-500/15 text-blue-700 border-blue-200 dark:text-blue-300 dark:border-blue-800',
  live: 'bg-emerald-500 text-white border-emerald-500',
  closed: 'bg-gray-500/15 text-gray-700 border-gray-200 dark:text-gray-300 dark:border-gray-700',
  postponed: 'bg-amber-500/15 text-amber-700 border-amber-200 dark:text-amber-300',
  cancelled: 'bg-red-500/15 text-red-700 border-red-200 dark:text-red-300',
}

function formatDate(iso?: string) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function modeLabel(mode?: string) {
  if (!mode) return 'Hybrid'
  return mode.charAt(0).toUpperCase() + mode.slice(1)
}

function locationLabel(event: ContestEventListItem) {
  if (event.mode === 'online') return 'Online'
  const venue = event.venue?.trim()
  if (event.mode === 'hybrid') {
    return venue ? `Hybrid · ${venue}` : 'Hybrid · Multiple locations'
  }
  return venue || 'On-site'
}

function ContestCardComponent({ event }: ContestCardProps) {
  const slug = event.slug || event.id
  const detailHref = `/events/${slug}`
  const registerHref = `/events/${slug}?register=1&action=register`
  const deadline = formatDate(event.registration_end_date)
  const tags = [
    event.category ? CATEGORY_LABELS[event.category] || event.category : null,
    ...(event.visibility_labels?.slice(0, 2) ?? []),
  ].filter(Boolean) as string[]

  const descriptionText =
    event.short_description ||
    (event.prize_pool ? event.prize_pool : null)

  return (
    <article
      className={cn(
        'group overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm',
        'transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/10',
        'dark:border-gray-700/80 dark:bg-gray-900/90'
      )}
    >
      {/* Full-width 16:9 banner — flush to card edges, no stretch gap */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {event.banner_url ? (
          <img
            src={event.banner_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-contain object-center"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500">
            <Trophy className="h-14 w-14 text-white/35" />
          </div>
        )}
      </div>

      {/* Content stacked below banner */}
      <div className="flex flex-col gap-3 p-4 sm:p-5">
        {/* Logo + title */}
        <div className="flex items-start gap-3">
          {event.organizer_logo_url && (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-600 dark:bg-white sm:h-12 sm:w-12">
              <img
                src={event.organizer_logo_url}
                alt=""
                className="h-full w-full object-contain"
              />
            </div>
          )}
          <Link href={detailHref} className="min-w-0 flex-1 group/title">
            <h3 className="flex items-start gap-1 text-base font-bold leading-snug text-gray-900 transition-colors group-hover/title:text-primary-600 dark:text-white dark:group-hover/title:text-primary-400 sm:text-lg">
              <span className="line-clamp-2">{event.title}</span>
              <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 opacity-60" />
            </h3>
          </Link>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className={cn(
              'border text-[11px] font-semibold',
              statusStyles[event.contest_status] || statusStyles.upcoming
            )}
          >
            {CONTEST_STATUS_LABELS[event.contest_status] || event.contest_status}
          </Badge>
          {event.registration_is_open && (
            <Badge className="border border-emerald-500/40 bg-transparent text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              Registration Open
            </Badge>
          )}
          {event.is_registered && (
            <Badge className="border-0 bg-primary-500 text-[10px] text-white">
              Registered
            </Badge>
          )}
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <Users className="h-4 w-4 shrink-0 text-primary-500" />
            <span>
              {event.participant_count.toLocaleString()}
              {event.max_participants ? ` / ${event.max_participants.toLocaleString()}` : ''}{' '}
              participants
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <Wifi className="h-4 w-4 shrink-0 text-primary-500" />
            <span>{modeLabel(event.mode)}</span>
          </div>
          {deadline && (
            <div className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <Clock className="h-4 w-4 shrink-0 text-secondary-500" />
              <span>Reg. by {deadline}</span>
            </div>
          )}
          {(event.mode !== 'online' || event.venue) && (
            <div className="inline-flex max-w-full items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <MapPin className="h-4 w-4 shrink-0 text-primary-500" />
              <span className="truncate">{locationLabel(event)}</span>
            </div>
          )}
        </div>

        {/* Category tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
              >
                <Sparkles className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Description / highlight box */}
        {descriptionText && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/60 bg-amber-50/80 px-3 py-3 text-sm leading-relaxed text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
            <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="line-clamp-2 min-w-0">{descriptionText}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link href={detailHref} className="sm:flex-1">
            <Button
              variant="outline"
              className="w-full border-primary-200 hover:bg-primary-50 dark:border-primary-800 dark:hover:bg-primary-900/20"
            >
              View Contest
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          {event.is_registered ? (
            <Button
              disabled
              className="w-full cursor-default bg-emerald-600 text-white opacity-100 hover:bg-emerald-600 sm:flex-1"
            >
              Registered
            </Button>
          ) : (
            <Link href={registerHref} className="sm:flex-1">
              <Button className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600">
                Register Now
              </Button>
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}

export const ContestCard = memo(ContestCardComponent)

/** @deprecated Use ContestCard — kept for backward-compatible imports */
export const EventCard = ContestCard
