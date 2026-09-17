'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Briefcase, Calendar, ChevronLeft, ChevronRight, ArrowRight, MapPin, Trophy } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CompanyLogo } from '@/components/jobs/CompanyLogo'
import { formatSalaryRange } from '@/lib/currency'
import { CATEGORY_LABELS, CONTEST_STATUS_LABELS } from '@/types/contestEvent'
import type { ContestEventListItem } from '@/types/contestEvent'
import { isPortalEventCompleted } from '@/lib/eventsPortalConfig'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useAuthLoginModal } from '@/contexts/AuthLoginModalContext'
import {
  buildEventRegisterRedirect,
  storePendingEventRegistration,
} from '@/lib/pendingEventRegistration'

const hubCardClass =
  'flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-[box-shadow,border-color] duration-200 dark:border-[#1A2233] dark:bg-[#141A29] dark:shadow-none'

export type HubJobCardData = {
  id: string
  title: string
  job_type?: string
  location?: string | string[]
  company_name?: string
  corporate_name?: string
  company_logo?: string
  salary_min?: number
  salary_max?: number
}

function jobTypeLabel(type?: string) {
  if (!type) return 'Job'
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function locationText(location?: string | string[]) {
  if (Array.isArray(location)) return location.filter(Boolean).join(', ') || 'Location TBA'
  return location || 'Location TBA'
}

const cardMotion = {
  rest: { y: 0 },
  hover: { y: -4 },
}

export function HubJobCard({
  job,
  onView,
  onApply,
  index = 0,
}: {
  job: HubJobCardData
  onView: () => void
  onApply: () => void
  index?: number
}) {
  const company = job.company_name || job.corporate_name || 'Company'
  const reduceMotion = useReducedMotion()

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index, 8) * 0.04 }}
      whileHover={reduceMotion ? undefined : 'hover'}
      variants={cardMotion}
      className={cn(hubCardClass, 'hover:border-primary-200 hover:shadow-md dark:hover:border-[#33405E] dark:hover:bg-[#1B2334]')}
    >
      <button
        type="button"
        onClick={onView}
        className="flex flex-1 flex-col p-3.5 text-left"
      >
        <div className="flex items-start gap-3">
          <CompanyLogo logoUrl={job.company_logo} companyName={company} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-gray-900 dark:text-white">
                {job.title}
              </h3>
              <span
                className={cn(
                  'rounded border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:border-transparent',
                  job.job_type === 'part_time'
                    ? 'dark:bg-[rgba(254,196,13,0.14)] dark:text-[#FEC40D]'
                    : 'dark:bg-[rgba(9,136,85,0.16)] dark:text-[#3FD996]'
                )}
              >
                {jobTypeLabel(job.job_type)}
              </span>
            </div>
            <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">{company}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{locationText(job.location)}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            {formatSalaryRange(job.salary_min, job.salary_max)}
          </span>
        </div>
      </button>

      <div className="border-t border-gray-100 px-3.5 py-2.5 dark:border-gray-800">
        <Button
          type="button"
          size="sm"
          className="h-8 w-full rounded-md bg-primary-600 text-xs text-white shadow-none transition-transform hover:bg-primary-700 active:scale-[0.98] dark:bg-[#00A2E5] dark:text-[#04141C] dark:hover:bg-[#24B4F0]"
          onClick={onApply}
        >
          Apply
        </Button>
      </div>
    </motion.article>
  )
}

export function HubEventCard({
  event,
  index = 0,
}: {
  event: ContestEventListItem
  index?: number
}) {
  const slug = event.slug || event.id
  const detailHref = `/events/${slug}`
  const registerHref = buildEventRegisterRedirect(slug, event.id)
  const isCompleted = isPortalEventCompleted(event)
  const displayStatus = isCompleted ? 'completed' : event.contest_status
  const category =
    event.category ? CATEGORY_LABELS[event.category] || event.category : null
  const showRegister = !event.is_registered && !isCompleted
  const mediaSrc = event.banner_url || event.organizer_logo_url
  const reduceMotion = useReducedMotion()
  const { isAuthenticated } = useAuth()
  const { openLoginModal } = useAuthLoginModal()

  const requireGuestLogin = (href: string, pendingRegister = false) => {
    if (pendingRegister) {
      storePendingEventRegistration(slug, event.id)
    }
    openLoginModal({
      redirect: href,
      preferredType: 'student',
    })
  }

  const onGuestNav = (href: string, pendingRegister = false) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (isAuthenticated) return
    e.preventDefault()
    requireGuestLogin(href, pendingRegister)
  }

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index, 8) * 0.04 }}
      whileHover={reduceMotion ? undefined : 'hover'}
      variants={cardMotion}
      className={cn(hubCardClass, 'group hover:border-primary-200 hover:shadow-md dark:hover:border-primary-800')}
    >
      <Link
        href={detailHref}
        onClick={onGuestNav(detailHref)}
        className="relative block aspect-[2.4/1] w-full overflow-hidden bg-gray-100 dark:bg-gray-800"
      >
        {mediaSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaSrc}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Trophy className="h-7 w-7 text-gray-300 dark:text-gray-600" />
          </div>
        )}
      </Link>

      <Link href={detailHref} onClick={onGuestNav(detailHref)} className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-gray-900 dark:text-white">
          {event.title}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="rounded border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:border-gray-600 dark:text-gray-300">
            {CONTEST_STATUS_LABELS[displayStatus] || displayStatus}
          </span>
          {category && (
            <span className="rounded border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:border-gray-600 dark:text-gray-300">
              {category}
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            {event.mode === 'online' ? 'Online' : event.venue || 'On-site'}
          </span>
          <span>{event.participant_count.toLocaleString()} registered</span>
        </div>
      </Link>

      <div className="border-t border-gray-100 px-3.5 py-2.5 dark:border-gray-800">
        {event.is_registered ? (
          <Button
            type="button"
            size="sm"
            disabled
            className="h-8 w-full rounded-md bg-emerald-600 text-xs text-white opacity-100 shadow-none"
          >
            Registered
          </Button>
        ) : showRegister ? (
          <Link href={registerHref} onClick={onGuestNav(registerHref, true)} className="block">
            <Button
              type="button"
              size="sm"
              className="h-8 w-full rounded-md bg-primary-600 text-xs text-white shadow-none transition-transform hover:bg-primary-700 active:scale-[0.98] dark:bg-[#00A2E5] dark:text-[#04141C] dark:hover:bg-[#24B4F0]"
            >
              Register
            </Button>
          </Link>
        ) : (
          <Link href={detailHref} onClick={onGuestNav(detailHref)} className="block">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 w-full rounded-md border-gray-200 text-xs shadow-none transition-transform active:scale-[0.98] dark:border-gray-600"
            >
              View details
            </Button>
          </Link>
        )}
      </div>
    </motion.article>
  )
}

export function HubCardSkeleton({ withImage = false }: { withImage?: boolean }) {
  return (
    <div className={cn(hubCardClass, 'animate-pulse')}>
      {withImage && <div className="aspect-[2.4/1] w-full bg-gray-100 dark:bg-gray-800" />}
      <div className="p-3.5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-800" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-3 w-1/2 rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        </div>
        <div className="mt-3 h-3 w-2/3 rounded bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="border-t border-gray-100 px-3.5 py-2.5 dark:border-gray-800">
        <div className="h-8 w-full rounded-md bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  )
}

export function HubPromoStrip() {
  return (
    <Link
      href="/events"
      className="group mb-5 block overflow-hidden rounded-lg border border-gray-200 dark:border-[#1A2233]"
    >
      <div className="relative aspect-[4.5/1] w-full min-h-[88px] sm:min-h-[100px]">
        <Image
          src="https://hirekarma.s3.us-east-1.amazonaws.com/disha-ui/disha_hero_img.jpg"
          alt=""
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 1152px) 100vw, 1152px"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
        <div className="absolute inset-0 flex items-center justify-between gap-4 px-4 sm:px-6">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-white/75">
              Featured
            </p>
            <p className="text-sm font-semibold text-white sm:text-base">
              Explore campus events & contests
            </p>
          </div>
          <span className="shrink-0 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 transition group-hover:bg-gray-100">
            Browse events
          </span>
        </div>
      </div>
    </Link>
  )
}

type LogoItem = { id: number; name: string; logo: string }

type PlacedStudent = {
  name: string
  company: string
  imageUrl: string
}

function scrollByAmount(el: HTMLElement | null, dir: 1 | -1) {
  if (!el) return
  el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.85, 320), behavior: 'smooth' })
}

function RailArrow({
  dir,
  onClick,
}: {
  dir: 'left' | 'right'
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 'left' ? 'Scroll left' : 'Scroll right'}
      className={cn(
        'absolute top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full',
        'border border-gray-200 bg-white/95 text-gray-700 shadow-md backdrop-blur',
        'transition hover:border-primary-300 hover:text-primary-700 hover:shadow-lg active:scale-95',
        'dark:border-gray-600 dark:bg-[#141A29]/95 dark:text-gray-200 sm:flex',
        dir === 'left' ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'
      )}
    >
      {dir === 'left' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
    </button>
  )
}

type FeaturedItem = {
  id: string
  eyebrow: string
  title: string
  cta: string
  href: string
  image: string
  gradient: string
  auth?: boolean
  openInNewTab?: boolean
  /** Artwork already includes the title — keep CTA only */
  hideOverlayText?: boolean
}

const FEATURED_ITEMS: FeaturedItem[] = [
  {
    id: 'events',
    eyebrow: 'Events',
    title: 'Campus events & contests',
    cta: 'Browse events',
    href: '/events',
    image: 'https://disha-ui.s3.ap-south-1.amazonaws.com/new-disha/1st_img(disha).png',
    gradient: 'from-sky-900/55 via-sky-900/25 to-transparent',
    hideOverlayText: true,
    openInNewTab: true,
  },
  {
    id: 'jobs',
    eyebrow: 'Jobs',
    title: 'Internships & full-time roles',
    cta: 'Find jobs',
    href: '/jobs',
    image: 'https://disha-ui.s3.ap-south-1.amazonaws.com/new-disha/2nd_img2(disha).png',
    gradient: 'from-emerald-950/55 via-emerald-900/25 to-transparent',
    hideOverlayText: true,
    openInNewTab: true,
  },
  {
    id: 'practice',
    eyebrow: 'Practice',
    title: 'Prep with assessments',
    cta: 'Start practice',
    href: '/dashboard/student/practice',
    auth: true,
    image: 'https://disha-ui.s3.ap-south-1.amazonaws.com/new-disha/3rd_img(disha).png',
    gradient: 'from-indigo-950/55 via-indigo-900/25 to-transparent',
    hideOverlayText: true,
  },
  {
    id: 'create',
    eyebrow: 'Host',
    title: 'Create your campus event',
    cta: 'Create event',
    href: '/events#create-event-request',
    image: 'https://disha-ui.s3.ap-south-1.amazonaws.com/new-disha/4th_img(disha).png',
    gradient: 'from-amber-950/55 via-amber-900/25 to-transparent',
    hideOverlayText: true,
  },
  {
    id: 'resume',
    eyebrow: 'Career',
    title: 'Build a stronger resume',
    cta: 'Resume builder',
    href: '/dashboard/student/resume-builder',
    auth: true,
    image: 'https://disha-ui.s3.ap-south-1.amazonaws.com/new-disha/5th_img(disha).png',
    gradient: 'from-rose-950/55 via-rose-900/25 to-transparent',
    hideOverlayText: true,
  },
]

/** Horizontal featured strip with arrows + auto-nudge. */
export function HubFeaturedCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const reduceMotion = useReducedMotion()
  const { isAuthenticated, user } = useAuth()
  const { openLoginModal } = useAuthLoginModal()

  useEffect(() => {
    if (reduceMotion || paused) return
    const id = window.setInterval(() => {
      const el = scrollerRef.current
      if (!el) return
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8
      if (atEnd) el.scrollTo({ left: 0, behavior: 'smooth' })
      else scrollByAmount(el, 1)
    }, 4200)
    return () => window.clearInterval(id)
  }, [paused, reduceMotion])

  return (
    <motion.section
      className="mb-6"
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="mb-3 flex items-end justify-between gap-3 sm:mb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-gray-900 dark:text-white sm:gap-3 sm:text-[22px]">
          <span className="h-5 w-1 shrink-0 rounded-sm bg-primary-500 dark:bg-[#00A2E5] sm:h-6" aria-hidden />
          Featured
        </h2>
        <div className="flex gap-1.5 sm:hidden">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scrollByAmount(scrollerRef.current, -1)}
            className="rounded-full border border-gray-200 bg-white p-1.5 dark:border-[#1A2233] dark:bg-[#141A29]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => scrollByAmount(scrollerRef.current, 1)}
            className="rounded-full border border-gray-200 bg-white p-1.5 dark:border-[#1A2233] dark:bg-[#141A29]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <RailArrow dir="left" onClick={() => scrollByAmount(scrollerRef.current, -1)} />
        <RailArrow dir="right" onClick={() => scrollByAmount(scrollerRef.current, 1)} />
        <div
          ref={scrollerRef}
          className="flex gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {FEATURED_ITEMS.map((item, i) => (
            <motion.div
              key={item.id}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              whileHover={reduceMotion ? undefined : { scale: 1.02 }}
              className="w-[min(72vw,240px)] shrink-0 sm:w-[min(100%,280px)] lg:w-[300px] 2xl:w-[calc((100%-2.25rem)/4)]"
            >
              <Link
                href={item.href}
                aria-label={`${item.title} — ${item.cta}`}
                {...(item.openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                onClick={(e) => {
                  const needsStudent = Boolean(item.auth)
                  const isStudent = isAuthenticated && user?.user_type === 'student'
                  if (needsStudent && !isStudent) {
                    e.preventDefault()
                    openLoginModal({
                      redirect: item.href,
                      preferredType: 'student',
                    })
                  }
                }}
                className="group relative block h-[132px] w-full overflow-hidden rounded-xl border border-gray-200 dark:border-[#1A2233] sm:h-[168px] 2xl:h-[200px]"
              >
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  sizes="(min-width: 1536px) 25vw, 300px"
                />
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-t to-transparent',
                    item.hideOverlayText
                      ? 'from-black/35 via-transparent'
                      : 'from-black/55 via-black/10'
                  )}
                />
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  {!item.hideOverlayText && (
                    <>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-white/70">
                        {item.eyebrow}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-white sm:text-[15px]">
                        {item.title}
                      </p>
                    </>
                  )}
                  <span
                    className={cn(
                      'w-fit rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-gray-900 transition group-hover:bg-white',
                      !item.hideOverlayText && 'mt-2'
                    )}
                  >
                    {item.cta} →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

/** HireKarma-style placed students rail — auto-scroll with wrapping arrows. */
export function HubPlacedStudents({
  students,
  subtitle,
}: {
  students: PlacedStudent[]
  subtitle: string
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const hoverPausedRef = useRef(false)
  const resumeAtRef = useRef(0)
  const reduceMotion = useReducedMotion()
  const looped = useMemo(
    () => (students.length ? [...students, ...students] : []),
    [students]
  )

  useEffect(() => {
    if (reduceMotion || students.length < 2) return
    const el = scrollerRef.current
    if (!el) return

    let raf = 0
    let alive = true
    const tick = () => {
      if (!alive) return
      const paused = hoverPausedRef.current || Date.now() < resumeAtRef.current
      if (!paused) {
        el.scrollLeft += 0.55
        const half = el.scrollWidth / 2
        if (half > 0 && el.scrollLeft >= half) {
          el.scrollLeft -= half
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
    }
  }, [reduceMotion, students.length])

  const scrollByDir = (dir: -1 | 1) => {
    const el = scrollerRef.current
    if (!el) return
    resumeAtRef.current = Date.now() + 5000

    const step = Math.min(280, el.clientWidth * 0.75)
    const half = el.scrollWidth / 2
    if (half > 0 && el.scrollLeft >= half) {
      el.scrollLeft -= half
    }

    if (dir < 0 && el.scrollLeft <= 8) {
      if (half > 0) el.scrollLeft += half
      el.scrollBy({ left: -step, behavior: 'smooth' })
      return
    }

    if (dir > 0 && el.scrollLeft + el.clientWidth >= el.scrollWidth - 8) {
      el.scrollTo({ left: 0, behavior: 'smooth' })
      return
    }

    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  if (!students.length) return null

  return (
    <section id="hub-placed-students" className="scroll-mt-28">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-gray-900 dark:text-white sm:text-[22px]">
            <span className="h-7 w-1.5 shrink-0 rounded-sm bg-primary-500 dark:bg-[#00A2E5] sm:h-8" aria-hidden />
            Placed students
          </h2>
          <p className="mt-1.5 max-w-2xl pl-3.5 text-xs leading-relaxed text-gray-500 sm:text-sm dark:text-gray-400">
            {subtitle}
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            aria-label="Previous placed students"
            onClick={() => scrollByDir(-1)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition',
              'hover:border-primary-300 hover:text-primary-700',
              'dark:border-gray-600 dark:bg-[#141A29] dark:text-gray-200'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next placed students"
            onClick={() => scrollByDir(1)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition',
              'hover:border-primary-300 hover:text-primary-700',
              'dark:border-gray-600 dark:bg-[#141A29] dark:text-gray-200'
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className="relative"
        onMouseEnter={() => {
          hoverPausedRef.current = true
        }}
        onMouseLeave={() => {
          hoverPausedRef.current = false
        }}
      >
        <div
          ref={scrollerRef}
          className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4"
        >
          {looped.map((student, index) => (
            <div
              key={`${student.name}-${student.company}-${index}`}
              className="flex w-[240px] shrink-0 items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md dark:border-[#1A2233] dark:bg-[#141A29] sm:w-[260px] 2xl:w-[300px]"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-600">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={student.imageUrl}
                  alt={student.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {student.name}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {student.company}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Trusted hiring partners — soft marquee, pauses on hover. */
export function HubTrustedLogos({ companies }: { companies: LogoItem[] }) {
  const reduceMotion = useReducedMotion()
  if (!companies.length) return null
  const loop = [...companies, ...companies]

  return (
    <motion.section
      className="mb-7 overflow-hidden"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <p className="mb-4 text-center text-sm font-semibold uppercase tracking-[0.12em] text-gray-400">
        Our Trusted Partners
      </p>
      <div className="group/logos relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#f7f8fa] to-transparent dark:from-[#0A0D14]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#f7f8fa] to-transparent dark:from-[#0A0D14]" />
        <div
          className={cn(
            'flex w-max gap-10 py-2',
            !reduceMotion &&
              '[animation:hubMarquee_40s_linear_infinite] group-hover/logos:[animation-play-state:paused]'
          )}
        >
          {loop.map((c, i) => (
            <div
              key={`${c.id}-${i}`}
              className="relative h-10 w-24 shrink-0 opacity-90 transition duration-300 hover:opacity-100 hover:scale-105"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.logo} alt={c.name} className="h-full w-full object-contain" />
            </div>
          ))}
        </div>
      </div>
      {/* eslint-disable-next-line react/no-unknown-property -- keyframes for logo rail */}
      <style>{`
        @keyframes hubMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </motion.section>
  )
}

export function HubSectionHeader({
  title,
  count,
  viewAllHref,
  viewAllLabel,
  subtitle,
  onViewAllClick,
  viewAllNewTab = false,
}: {
  title: string
  count?: number
  viewAllHref: string
  viewAllLabel: string
  subtitle?: string
  /** If set, View all is a button (e.g. guest login) instead of a link. */
  onViewAllClick?: () => void
  /** Open View all in a new browser tab. */
  viewAllNewTab?: boolean
}) {
  const reduceMotion = useReducedMotion()
  const viewAllClass = cn(
    'group inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5',
    'text-sm font-semibold text-primary-700 shadow-sm transition-colors',
    'hover:border-primary-400 hover:bg-primary-100 hover:shadow-md',
    'dark:border-[#232C42] dark:bg-[#141A29] dark:text-[#F4F6FA] dark:hover:border-[rgba(0,162,229,0.35)] dark:hover:bg-[#1B2334]'
  )

  return (
    <div className="mb-5 flex items-start justify-between gap-3 sm:mb-6 sm:items-center">
      <div className="min-w-0">
        <h2 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg font-bold tracking-tight text-gray-900 dark:text-white sm:gap-x-2.5 sm:text-[22px]">
          <span className="h-7 w-1.5 shrink-0 rounded-sm bg-primary-500 dark:bg-[#00A2E5] sm:h-8" aria-hidden />
          {title}
          {typeof count === 'number' && (
            <span className="text-sm font-medium text-gray-400 sm:text-base">({count})</span>
          )}
        </h2>
        {subtitle && (
          <p className="mt-1 pl-3.5 text-xs text-gray-500 dark:text-gray-400 sm:mt-1.5 sm:text-sm">
            {subtitle}
          </p>
        )}
      </div>
      <motion.div
        whileHover={reduceMotion ? undefined : { scale: 1.04, y: -1 }}
        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
        className="shrink-0"
      >
        {onViewAllClick ? (
          <button type="button" onClick={onViewAllClick} className={viewAllClass}>
            <span>{viewAllLabel}</span>
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white',
                'transition-transform duration-200 group-hover:translate-x-0.5 group-hover:bg-primary-700'
              )}
            >
              <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
            </span>
          </button>
        ) : (
          <Link
            href={viewAllHref}
            className={viewAllClass}
            {...(viewAllNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            <span>{viewAllLabel}</span>
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white',
                'transition-transform duration-200 group-hover:translate-x-0.5 group-hover:bg-primary-700'
              )}
            >
              <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
            </span>
          </Link>
        )}
      </motion.div>
    </div>
  )
}

/** Horizontal card rail with scroll arrows. */
export function HubCarousel({ children }: { children: React.ReactNode }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const scroll = useCallback((dir: 1 | -1) => scrollByAmount(scrollerRef.current, dir), [])

  return (
    <div className="relative">
      <RailArrow dir="left" onClick={() => scroll(-1)} />
      <RailArrow dir="right" onClick={() => scroll(1)} />
      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  )
}

export function HubCarouselItem({ children }: { children: React.ReactNode }) {
  return <div className="w-[min(85vw,300px)] shrink-0 sm:w-[300px]">{children}</div>
}
