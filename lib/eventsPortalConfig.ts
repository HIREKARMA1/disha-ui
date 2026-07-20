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

/** Right-rail promotions — edit this array to change sidebar ads. */
export const EVENTS_PORTAL_ADS: PortalAdItem[] = [
  {
    id: 'upcoming-hackathon',
    title: 'Upcoming Hackathon',
    description:
      'Join national-level coding marathons, compete with top talent, and win exciting cash prizes plus internship fast-tracks.',
    ctaLabel: 'Explore Hackathons',
    href: '/events?category=hackathon',
    gradient: 'from-primary-600 via-primary-500 to-secondary-500',
    accent: 'trophy',
    imageUrl:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=640&h=480&fit=crop&auto=format',
  },
  {
    id: 'top-hiring',
    title: 'Top Hiring Companies',
    description:
      'Discover curated placement drives from India\'s leading recruiters — all in one place on HireKarma.',
    ctaLabel: 'View Drives',
    href: '/events?category=placement_drive',
    gradient: 'from-emerald-600 via-teal-500 to-cyan-500',
    accent: 'building',
    imageUrl:
      'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=640&h=720&fit=crop&auto=format',
    bullets: [
      'Verified campus & off-campus drives',
      'Pre-placement offer opportunities',
      'Apply directly from your DISHA profile',
    ],
  },
  {
    id: 'placement-drives',
    title: 'Placement Drives',
    description: 'Campus and off-campus opportunities tailored for students.',
    ctaLabel: 'Browse Drives',
    href: '/events?category=campus_drive',
    gradient: 'from-violet-600 via-purple-500 to-fuchsia-500',
    accent: 'briefcase',
  },
  {
    id: 'premium-learning',
    title: 'Premium Learning',
    description: 'Workshops and seminars to sharpen skills before your next contest.',
    ctaLabel: 'Learn More',
    href: '/events?category=workshop',
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    accent: 'book',
  },
  {
    id: 'resume-builder',
    title: 'Resume Builder',
    description: 'Build an ATS-friendly resume and stand out in every application.',
    ctaLabel: 'Build Resume',
    href: '/dashboard/student/resume-builder',
    gradient: 'from-slate-700 via-slate-600 to-primary-600',
    accent: 'file',
  },
]

export const PORTAL_STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'live', label: 'Live' },
  { value: 'closed', label: 'Closed' },
] as const

export type PortalStatusFilter = (typeof PORTAL_STATUS_OPTIONS)[number]['value']

export const PORTAL_DATE_OPTIONS = [
  { value: 'all', label: 'All Dates' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
] as const

export type PortalDateFilter = (typeof PORTAL_DATE_OPTIONS)[number]['value']
