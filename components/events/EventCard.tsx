"use client"

import { memo } from 'react'
import Link from 'next/link'
import {
  Trophy,
  Building2,
  Users,
  Clock,
  MapPin,
  Wifi,
  ArrowRight,
  Sparkles,
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
  live: 'bg-emerald-500/15 text-emerald-700 border-emerald-200 dark:text-emerald-300 dark:border-emerald-800',
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
  // offline / default — show admin-provided venue when available
  return venue || 'On-site'
}

function ContestCardComponent({ event }: ContestCardProps) {
  const slug = event.slug || event.id
  const detailHref = `/events/${slug}`
  const registerHref = `/events/${slug}?register=1`
  const deadline = formatDate(event.registration_end_date)
  const tags = [
    event.category ? CATEGORY_LABELS[event.category] || event.category : null,
    ...(event.visibility_labels?.slice(0, 2) ?? []),
  ].filter(Boolean) as string[]

  return (
    <article
      className={cn(
        'group overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm',
        'transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/10',
        'dark:border-gray-700/80 dark:bg-gray-900/90'
      )}
    >
      <div className="flex flex-col lg:flex-row">
        <div className="relative h-48 w-full shrink-0 overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 lg:h-auto lg:w-[38%] lg:min-h-[240px]">
          {event.banner_url ? (
            <img
              src={event.banner_url}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full min-h-[12rem] items-center justify-center">
              <Trophy className="h-14 w-14 text-white/35" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          {event.organizer_logo_url && (
            <div className="absolute bottom-3 left-3 flex h-14 w-14 items-center justify-center rounded-xl border-2 border-white/30 bg-white p-2 shadow-lg">
              <img
                src={event.organizer_logo_url}
                alt=""
                className="h-full w-full object-contain"
              />
            </div>
          )}
          <Badge
            className={cn(
              'absolute right-3 top-3 border text-[11px] font-semibold backdrop-blur-sm',
              statusStyles[event.contest_status] || statusStyles.upcoming
            )}
          >
            {CONTEST_STATUS_LABELS[event.contest_status] || event.contest_status}
          </Badge>
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {event.registration_is_open && (
              <Badge className="border-0 bg-emerald-500 text-[10px] text-white">
                Registration Open
              </Badge>
            )}
            {event.is_registered && (
              <Badge className="border-0 bg-primary-500 text-[10px] text-white">
                Registered
              </Badge>
            )}
          </div>

          <h3 className="text-xl font-bold leading-snug text-gray-900 transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
            {event.title}
          </h3>

          {event.organizer_name && (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <Building2 className="h-4 w-4 shrink-0 text-primary-500" />
              <span className="truncate">{event.organizer_name}</span>
            </p>
          )}

          {event.short_description && (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {event.short_description}
            </p>
          )}

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {event.prize_pool && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                <Trophy className="h-4 w-4 shrink-0" />
                <span className="truncate">{event.prize_pool}</span>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <Users className="h-4 w-4 shrink-0 text-primary-500" />
              <span>
                {event.participant_count.toLocaleString()}
                {event.max_participants ? ` / ${event.max_participants.toLocaleString()}` : ''}{' '}
                participants
              </span>
            </div>
            {deadline && (
              <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <Clock className="h-4 w-4 shrink-0 text-secondary-500" />
                <span>Reg. by {deadline}</span>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <Wifi className="h-4 w-4 shrink-0 text-primary-500" />
              <span>{modeLabel(event.mode)}</span>
            </div>
            {(event.mode !== 'online' || event.venue) && (
              <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300 sm:col-span-2">
                <MapPin className="h-4 w-4 shrink-0 text-primary-500" />
                <span className="truncate">{locationLabel(event)}</span>
              </div>
            )}
          </div>

          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
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

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link href={detailHref} className="sm:flex-1">
              <Button
                variant="outline"
                className="w-full border-primary-200 hover:bg-primary-50 dark:border-primary-800 dark:hover:bg-primary-900/20"
              >
                View Contest
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href={registerHref} className="sm:flex-1">
              <Button className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600">
                {event.is_registered ? 'Manage Registration' : 'Register Now'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

export const ContestCard = memo(ContestCardComponent)

/** @deprecated Use ContestCard — kept for backward-compatible imports */
export const EventCard = ContestCard
