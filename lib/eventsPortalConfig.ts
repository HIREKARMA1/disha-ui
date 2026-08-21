import type { EventCategory } from '@/types/contestEvent'

export interface PortalCategoryChip {
  value: EventCategory
  label: string
}

/** Sidebar category chips — configurable without code changes for labels/order. */
export const PORTAL_CATEGORY_CHIPS: PortalCategoryChip[] = [
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'placement_drive', label: 'Placement Drive' },
  { value: 'competition', label: 'Competition' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'coding_contest', label: 'Coding Contest' },
  { value: 'campus_drive', label: 'Campus Drive' },
  { value: 'ai_competition', label: 'AI Competition' },
]

export interface PortalAdItem {
  id: string
  title: string
  description: string
  ctaLabel: string
  href: string
  /** Tailwind gradient classes for the card header */
  gradient: string
  /** Lucide-style accent — rendered as CSS, not copied assets */
  accent: 'trophy' | 'briefcase' | 'building' | 'book' | 'file'
  /** Optional hero/promo image (Unsplash or CDN) */
  imageUrl?: string
  /** Optional bullet highlights (right-rail card) */
  bullets?: string[]
}

/**
 * Hardcoded portal ads removed — Events page loads advertisements from
 * GET /api/v1/advertisements?page=events. Kept type for any legacy imports.
 */
export const EVENTS_PORTAL_ADS: PortalAdItem[] = []

export const PORTAL_STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'live', label: 'Live' },
  { value: 'completed', label: 'Completed' },
  { value: 'closed', label: 'Closed' },
] as const

export type PortalStatusFilter = (typeof PORTAL_STATUS_OPTIONS)[number]['value']

/** Public listing/detail: lifecycle "closed" is shown as Completed. */
export function isPortalEventCompleted(event: {
  contest_status?: string
  registration_state?: string
}): boolean {
  return event.registration_state === 'event_completed' || event.contest_status === 'closed'
}

export const PORTAL_DATE_OPTIONS = [
  { value: 'all', label: 'All Dates' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
] as const

export type PortalDateFilter = (typeof PORTAL_DATE_OPTIONS)[number]['value']
