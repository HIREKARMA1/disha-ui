"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Eye, Edit, Trash2, Copy, Users, Calendar, Clock, MapPin, Building2,
  Megaphone, Lock, BarChart3, Pause, XCircle, Loader2, Unlock, Ban,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ContestEventListItem } from '@/types/contestEvent'
import { CONTEST_STATUS_LABELS, CATEGORY_LABELS } from '@/types/contestEvent'
import { cn } from '@/lib/utils'

const pubBadge: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  closed: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  archived: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
}

const statusBadge: Record<string, string> = {
  upcoming: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  live: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  closed: 'bg-gray-500/15 text-gray-700 dark:text-gray-300',
  cancelled: 'bg-red-500/15 text-red-700 dark:text-red-300',
  postponed: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  draft: 'bg-gray-500/15 text-gray-600 dark:text-gray-400',
}

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface AdminEventCardProps {
  event: ContestEventListItem
  actionLoading: string | null
  onAction: (eventId: string, action: string) => void
  onCancel: (event: ContestEventListItem) => void
  onPostpone: (event: ContestEventListItem) => void
}

export function AdminEventCard({
  event,
  actionLoading,
  onAction,
  onCancel,
  onPostpone,
}: AdminEventCardProps) {
  const router = useRouter()
  const loading = (action: string) => actionLoading === `${event.id}-${action}`

  return (
    <article className="group h-auto overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-700/80 dark:bg-gray-800/90">
      {/* Mobile: image first → data. Desktop: ~42% image | ~58% data */}
      <div className="grid h-auto grid-cols-1 lg:grid-cols-[42%_58%]">
        {/* LEFT — complete 16:9 event image (no overlays) */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100 dark:bg-gray-900/60">
          {event.banner_url ? (
            <img
              src={event.banner_url}
              alt=""
              loading="lazy"
              className="h-full w-full object-contain object-center"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-600 to-secondary-500">
              <Calendar className="h-10 w-10 text-white/40" />
            </div>
          )}
        </div>

        {/* RIGHT — all event information + actions */}
        <div className="flex min-w-0 flex-col p-4 md:p-5">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {event.organizer_logo_url && (
              <div className="mr-1 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-600 dark:bg-gray-900">
                <img
                  src={event.organizer_logo_url}
                  alt=""
                  className="h-full w-full object-contain"
                />
              </div>
            )}
            {event.category && (
              <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wide">
                {CATEGORY_LABELS[event.category] || event.category}
              </Badge>
            )}
            <Badge className={cn('border-0 text-[10px]', pubBadge[event.publication_status || 'draft'])}>
              {event.publication_status || 'draft'}
            </Badge>
            <Badge className={cn('border-0 text-[10px]', statusBadge[event.contest_status] || statusBadge.upcoming)}>
              {CONTEST_STATUS_LABELS[event.contest_status] || event.contest_status}
            </Badge>
            <Badge className={cn('border-0 text-[10px]', event.registration_is_open ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white')}>
              {event.registration_is_open ? 'Reg. Open' : 'Reg. Closed'}
            </Badge>
          </div>

          <h3 className="line-clamp-2 text-lg font-bold text-gray-900 dark:text-white">{event.title}</h3>
          {event.short_description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{event.short_description}</p>
          )}

          <div className="mt-3 grid grid-cols-1 gap-1.5 text-sm text-gray-600 dark:text-gray-400 sm:grid-cols-2">
            {event.organizer_name && (
              <span className="flex items-center gap-1.5 truncate">
                <Building2 className="h-3.5 w-3.5 shrink-0" /> {event.organizer_name}
              </span>
            )}
            {event.mode && (
              <span className="flex items-center gap-1.5 capitalize">
                <MapPin className="h-3.5 w-3.5 shrink-0" /> {event.mode}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0" /> {formatDate(event.event_start_date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0" /> Reg. by {formatDate(event.registration_end_date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 shrink-0" />
              {event.participant_count}{event.max_participants ? ` / ${event.max_participants}` : ''} participants
            </span>
            {event.prize_pool && (
              <span className="truncate font-medium text-amber-600 dark:text-amber-400">{event.prize_pool}</span>
            )}
          </div>

          {/* Actions — View is never gated by registration/publication status for admins */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4 dark:border-gray-700/80">
            {event.slug ? (
              <Button variant="outline" size="sm" className="h-8" asChild>
                <Link href={`/events/${event.slug}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="h-8" disabled title="Event slug missing">
                <Eye className="mr-1.5 h-3.5 w-3.5" /> View
              </Button>
            )}
            <Button variant="outline" size="sm" className="h-8" onClick={() => router.push(`/dashboard/admin/events/${event.id}/edit`)}>
              <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
            </Button>
            <Button variant="outline" size="sm" className="h-8" disabled={loading('duplicate')} onClick={() => onAction(event.id, 'duplicate')}>
              {loading('duplicate') ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
              Duplicate
            </Button>
            {event.publication_status !== 'published' ? (
              <Button variant="outline" size="sm" className="h-8" disabled={loading('publish')} onClick={() => onAction(event.id, 'publish')}>
                {loading('publish') ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Megaphone className="mr-1.5 h-3.5 w-3.5" />}
                Publish
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="h-8" disabled={loading('unpublish')} onClick={() => onAction(event.id, 'unpublish')}>
                {loading('unpublish') ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="mr-1.5 h-3.5 w-3.5" />}
                Unpublish
              </Button>
            )}
            <Button variant="outline" size="sm" className="h-8" onClick={() => router.push(`/dashboard/admin/events/${event.id}/analytics`)}>
              <BarChart3 className="mr-1.5 h-3.5 w-3.5" /> Analytics
            </Button>
            {!event.is_cancelled && (
              <>
                <Button variant="outline" size="sm" className="h-8" onClick={() => onPostpone(event)}>
                  <Pause className="mr-1.5 h-3.5 w-3.5" /> Postpone
                </Button>
                {event.registration_is_open ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    disabled={loading('close-registration')}
                    onClick={() => onAction(event.id, 'close-registration')}
                  >
                    {loading('close-registration') ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Ban className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Close Reg
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    disabled={loading('open-registration')}
                    onClick={() => onAction(event.id, 'open-registration')}
                  >
                    {loading('open-registration') ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Unlock className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Open Reg
                  </Button>
                )}
                <Button variant="outline" size="sm" className="h-8 text-red-600 hover:text-red-700" onClick={() => onCancel(event)}>
                  <XCircle className="mr-1.5 h-3.5 w-3.5" /> Cancel
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" className="h-8 text-red-600 hover:text-red-700" disabled={loading('delete')} onClick={() => onAction(event.id, 'delete')}>
              {loading('delete') ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-1.5 h-3.5 w-3.5" />}
              Delete
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
