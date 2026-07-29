'use client'

import { memo } from 'react'
import Link from 'next/link'
import {
  Building2,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Trophy,
  Wifi,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ContestEventListItem } from '@/types/contestEvent'
import { CATEGORY_LABELS, CONTEST_STATUS_LABELS } from '@/types/contestEvent'
import { cn } from '@/lib/utils'

interface EventPopupCardProps {
  event: ContestEventListItem
  onNavigate?: () => void
  className?: string
}

function formatDisplayDate(iso?: string) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function modeLabel(mode?: string) {
  if (!mode) return null
  return mode.charAt(0).toUpperCase() + mode.slice(1)
}

function locationLabel(event: ContestEventListItem) {
  if (event.mode === 'online') return 'Online'
  const venue = event.venue?.trim()
  if (event.mode === 'hybrid') {
    return venue ? `Hybrid · ${venue}` : 'Hybrid'
  }
  return venue || null
}

function EventPopupCardComponent({ event, onNavigate, className }: EventPopupCardProps) {
  const slug = event.slug || event.id
  const detailHref = `/events/${slug}`
  const registerHref = `/events/${slug}?register=1`
  const eventDate = formatDisplayDate(event.event_start_date)
  const regDeadline = formatDisplayDate(event.registration_end_date)
  const categoryLabel = event.category
    ? CATEGORY_LABELS[event.category] || event.category
    : null
  const typeLabel = modeLabel(event.mode)
  const location = locationLabel(event)
  const description =
    event.short_description?.trim() || event.subtitle?.trim() || null

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Banner */}
      <div className="relative h-28 w-full shrink-0 overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 sm:h-32">
        {event.banner_url ? (
          <img
            src={event.banner_url}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Trophy className="h-10 w-10 text-white/35" aria-hidden />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

        {event.organizer_logo_url && (
          <div className="absolute bottom-2 left-2 flex h-9 w-9 items-center justify-center rounded-lg border-2 border-white/40 bg-white p-1 shadow-md">
            <img
              src={event.organizer_logo_url}
              alt=""
              loading="lazy"
              className="h-full w-full object-contain"
            />
          </div>
        )}

        <Badge className="absolute right-2 top-2 border-0 bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-primary-700 shadow-sm backdrop-blur-sm dark:bg-gray-900/80 dark:text-primary-300">
          {CONTEST_STATUS_LABELS[event.contest_status] || event.contest_status}
        </Badge>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-3 py-3 sm:px-4 sm:py-3.5">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          {categoryLabel && (
            <Badge className="border-0 bg-primary-50 px-2 py-0 text-[10px] font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              <Sparkles className="mr-0.5 h-2.5 w-2.5" aria-hidden />
              {categoryLabel}
            </Badge>
          )}
          {typeLabel && (
            <Badge
              variant="outline"
              className="px-2 py-0 text-[10px] font-medium text-gray-700 dark:text-gray-300"
            >
              <Wifi className="mr-0.5 h-2.5 w-2.5" aria-hidden />
              {typeLabel}
            </Badge>
          )}
          {event.registration_is_open && (
            <Badge className="border-0 bg-emerald-500 px-2 py-0 text-[10px] text-white">
              Registration Open
            </Badge>
          )}
        </div>

        <h3 className="text-base font-bold leading-snug text-gray-900 dark:text-white">
          {event.title}
        </h3>

        {description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}

        <dl className="mt-2.5 grid grid-cols-2 gap-1.5 text-xs text-gray-700 dark:text-gray-300">
          {eventDate && (
            <div className="flex items-start gap-1.5 rounded-lg bg-gray-50 px-2 py-1.5 dark:bg-gray-800/80">
              <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-500" aria-hidden />
              <div className="min-w-0">
                <dt className="text-[9px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Event date
                </dt>
                <dd className="truncate font-medium">{eventDate}</dd>
              </div>
            </div>
          )}
          {regDeadline && (
            <div className="flex items-start gap-1.5 rounded-lg bg-gray-50 px-2 py-1.5 dark:bg-gray-800/80">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary-500" aria-hidden />
              <div className="min-w-0">
                <dt className="text-[9px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Reg. deadline
                </dt>
                <dd className="truncate font-medium">{regDeadline}</dd>
              </div>
            </div>
          )}
          {location && (
            <div className="flex items-start gap-1.5 rounded-lg bg-gray-50 px-2 py-1.5 dark:bg-gray-800/80 col-span-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-500" aria-hidden />
              <div className="min-w-0">
                <dt className="text-[9px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Location
                </dt>
                <dd className="truncate font-medium">{location}</dd>
              </div>
            </div>
          )}
          {event.organizer_name && (
            <div className="flex items-start gap-1.5 rounded-lg bg-gray-50 px-2 py-1.5 dark:bg-gray-800/80 col-span-2">
              <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-500" aria-hidden />
              <div className="min-w-0">
                <dt className="text-[9px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Organizer
                </dt>
                <dd className="truncate font-medium">{event.organizer_name}</dd>
              </div>
            </div>
          )}
        </dl>

        <div className="mt-3 flex flex-col gap-1.5 sm:flex-row sm:items-center">
          <Button variant="gradient" size="sm" className="w-full sm:flex-1" asChild>
            <Link href={registerHref} onClick={onNavigate}>
              {event.is_registered ? 'Manage Registration' : 'Register Now'}
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-primary-200 hover:bg-primary-50 dark:border-primary-800 dark:hover:bg-primary-900/20 sm:flex-1"
            asChild
          >
            <Link href={detailHref} onClick={onNavigate}>
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export const EventPopupCard = memo(EventPopupCardComponent)
