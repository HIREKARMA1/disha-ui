"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { contestEventService } from '@/services/contestEventService'
import type { ContestEventDetail } from '@/types/contestEvent'
import { CONTEST_STATUS_LABELS, CATEGORY_LABELS } from '@/types/contestEvent'
import { isPortalEventCompleted } from '@/lib/eventsPortalConfig'
import {
  Loader2, Users, Trophy, Building2, Clock, Calendar,
  Mail, Phone, Globe, MapPin, ChevronDown, ChevronUp, CheckCircle,
  Share2, Briefcase, Target, Video, type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { sanitizeEventDescriptionHtml, stripHtmlToPlainText } from '@/lib/sanitizeHtml'
import { resolveEventMediaUrl } from '@/lib/eventMedia'
import {
  buildEventRegisterRedirect,
  clearPendingEventRegistration,
  peekPendingEventRegistration,
  storePendingEventRegistration,
} from '@/lib/pendingEventRegistration'

const SECTIONS = [
  { id: 'description', label: 'Description', shortLabel: 'Description' },
  { id: 'eligibility', label: 'Eligibility', shortLabel: 'Eligibility' },
  { id: 'rounds', label: 'Rounds', shortLabel: 'Rounds' },
  { id: 'rewards', label: 'Rewards', shortLabel: 'Rewards' },
  { id: 'about-organizer', label: 'About Organizer', shortLabel: 'Organizer' },
  { id: 'faq', label: 'FAQs', shortLabel: 'FAQs' },
  { id: 'results', label: 'Results', shortLabel: 'Results' },
  { id: 'support', label: 'Support', shortLabel: 'Support' },
]

function formatEventDate(value?: string | null) {
  if (!value) return null
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatEventTime(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  if (date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0) return null
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

/** Full date+time for registration-opens messaging (browser-local / en-IN). */
function formatRegistrationOpensAt(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const datePart = date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const timePart = date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  })
  return `${datePart} at ${timePart}`
}

function isOnlineEventMode(mode?: string | null) {
  const m = (mode || '').toLowerCase()
  return m === 'online' || m === 'hybrid'
}

function formatMeetingOpensAt(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const datePart = date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const timePart = date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  })
  return `${datePart} ${timePart}`
}

interface EventDetailPageProps {
  slug: string
}

export function EventDetailPage({ slug }: EventDetailPageProps) {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const isAdmin = user?.user_type === 'admin'
  const [event, setEvent] = useState<ContestEventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [joining, setJoining] = useState(false)
  const [nowTick, setNowTick] = useState(() => Date.now())
  const [activeSection, setActiveSection] = useState('description')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const autoRegisterAttempted = useRef(false)

  useEffect(() => {
    // Wait for auth so admins load via unrestricted admin API (draft/closed/cancelled/reg-closed).
    if (authLoading) return

    let cancelled = false
    setLoading(true)

    const loadEvent = async () => {
      try {
        if (isAdmin) {
          const adminEvent = await contestEventService.getAdminEventBySlug(slug)
          if (!cancelled) setEvent(adminEvent)
          return
        }
        const visitorId = localStorage.getItem('event_visitor_id') || crypto.randomUUID()
        localStorage.setItem('event_visitor_id', visitorId)
        const publicEvent = await contestEventService.getEventBySlug(slug, visitorId)
        if (!cancelled) setEvent(publicEvent)
      } catch {
        // Admin fallback: public slug may 404 for unpublished; admin by-slug should succeed.
        if (!isAdmin) {
          try {
            const token = localStorage.getItem('access_token')
            if (token) {
              const payload = JSON.parse(atob(token.split('.')[1]))
              if (payload?.user_type === 'admin') {
                const adminEvent = await contestEventService.getAdminEventBySlug(slug)
                if (!cancelled) setEvent(adminEvent)
                return
              }
            }
          } catch {
            // ignore and show not found
          }
        }
        if (!cancelled) setEvent(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadEvent()
    return () => {
      cancelled = true
    }
  }, [slug, authLoading, isAdmin])

  // Re-evaluate meeting unlock every 30s so Join enables at T−5 without a full refresh
  useEffect(() => {
    if (!event?.meeting_link_opens_at) return
    const opensAt = new Date(event.meeting_link_opens_at).getTime()
    if (Number.isNaN(opensAt) || Date.now() >= opensAt) return
    const id = window.setInterval(() => setNowTick(Date.now()), 30_000)
    return () => window.clearInterval(id)
  }, [event?.meeting_link_opens_at, event?.meeting_link_available])

  // Register Now from listing → land on details with register CTA in view
  useEffect(() => {
    if (!event || typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('register') !== '1') return
    const timer = window.setTimeout(() => {
      // Mobile sticky CTA is already visible; scroll only on tablet/desktop.
      if (window.matchMedia('(min-width: 768px)').matches) {
        document.getElementById('event-register-cta')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }, 250)
    return () => window.clearTimeout(timer)
  }, [event])

  const handleRegister = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      const redirectPath = buildEventRegisterRedirect(slug, event?.id)
      storePendingEventRegistration(slug, event?.id)
      localStorage.setItem('redirect_after_login', redirectPath)
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`)
      return
    }
    if (event?.registration_external_url) {
      clearPendingEventRegistration()
      window.open(event.registration_external_url, '_blank')
      return
    }
    if (event?.is_registered) {
      clearPendingEventRegistration()
      toast.success('You are already registered for this event.')
      return
    }
    setRegistering(true)
    try {
      await contestEventService.registerForEvent(slug)
      clearPendingEventRegistration()
      toast.success('Successfully registered for the event!')
      // Immediate UI update — don't wait for refetch to disable Register Now
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              is_registered: true,
              registration_status: 'registered',
              participant_count: (prev.participant_count || 0) + 1,
            }
          : prev
      )
      // Clean auto-register query params so refresh does not re-trigger
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.delete('register')
        url.searchParams.delete('action')
        url.searchParams.delete('eventId')
        window.history.replaceState(
          window.history.state,
          '',
          url.pathname + url.search + (url.hash || '')
        )
      }
      try {
        const updated = isAdmin
          ? await contestEventService.getAdminEventBySlug(slug)
          : await contestEventService.getEventBySlug(
              slug,
              localStorage.getItem('event_visitor_id') || undefined
            )
        setEvent({
          ...updated,
          is_registered: true,
          registration_status: updated.registration_status || 'registered',
        })
      } catch {
        // Keep optimistic registered state if refresh fails
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string }; status?: number } })?.response?.data
          ?.detail || 'Registration failed'
      const status = (err as { response?: { status?: number } })?.response?.status
      // Already registered — treat as success for seamless flow
      if (
        typeof msg === 'string' &&
        (msg.toLowerCase().includes('already registered') || status === 409)
      ) {
        clearPendingEventRegistration()
        toast.success('You are already registered for this event.')
        setEvent((prev) =>
          prev ? { ...prev, is_registered: true, registration_status: 'registered' } : prev
        )
        try {
          const updated = isAdmin
            ? await contestEventService.getAdminEventBySlug(slug)
            : await contestEventService.getEventBySlug(
                slug,
                localStorage.getItem('event_visitor_id') || undefined
              )
          setEvent({
            ...updated,
            is_registered: true,
            registration_status: updated.registration_status || 'registered',
          })
        } catch {
          // ignore refresh failure
        }
        return
      }
      // Session expired — re-store intent and send to login
      if (status === 401) {
        const redirectPath = buildEventRegisterRedirect(slug, event?.id)
        storePendingEventRegistration(slug, event?.id)
        localStorage.setItem('redirect_after_login', redirectPath)
        router.push(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`)
        return
      }
      toast.error(typeof msg === 'string' ? msg : 'Registration failed')
    } finally {
      setRegistering(false)
    }
  }, [slug, event, isAdmin, router])

  // After login: auto-trigger registration when ?register=1&action=register (or pending storage)
  useEffect(() => {
    if (!event || authLoading || registering || autoRegisterAttempted.current) return
    if (typeof window === 'undefined') return

    const token = localStorage.getItem('access_token')
    const params = new URLSearchParams(window.location.search)
    const pending = peekPendingEventRegistration()
    const wantsRegister =
      (params.get('register') === '1' && params.get('action') === 'register') ||
      (params.get('register') === '1' && !!pending && pending.slug === slug) ||
      (!!pending && pending.slug === slug && pending.action === 'register')

    if (!wantsRegister) return

    // Guest with leftover pending intent (e.g. browser Back from login): stay on
    // the event page. Login is only via explicit Register click in handleRegister.
    if (!token) return

    if (event.is_registered) {
      clearPendingEventRegistration()
      return
    }
    if (!event.registration_is_open && !event.registration_external_url) {
      clearPendingEventRegistration()
      return
    }

    autoRegisterAttempted.current = true
    void handleRegister()
  }, [event, authLoading, registering, slug, handleRegister])

  // Hash navigation on load
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash && SECTIONS.find(s => s.id === hash)) {
      setTimeout(() => scrollToSection(hash), 500)
    }
  }, [event])

  // Intersection observer for active section
  useEffect(() => {
    if (!event) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    )
    SECTIONS.forEach(({ id }) => {
      const el = sectionRefs.current[id]
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [event])

  const scrollToSection = useCallback((id: string) => {
    const el = sectionRefs.current[id]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      const nextUrl = `${window.location.pathname}${window.location.search}#${id}`
      window.history.replaceState(window.history.state, '', nextUrl)
      setActiveSection(id)
    }
  }, [])

  // Must stay above early returns — hook order must be stable across loading → loaded.
  const handleJoinMeeting = useCallback(async () => {
    if (!event || joining) return
    const token = localStorage.getItem('access_token')
    if (!token) {
      storePendingEventRegistration(slug, event.id)
      router.push(buildEventRegisterRedirect(slug))
      return
    }
    setJoining(true)
    try {
      const result = await contestEventService.joinMeeting(slug)
      if (result.event_link) {
        window.open(result.event_link, '_blank', 'noopener,noreferrer')
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Unable to open meeting link'
      toast.error(typeof msg === 'string' ? msg : 'Unable to open meeting link')
    } finally {
      setJoining(false)
    }
  }, [event, joining, slug, router])

  const handleShare = async () => {
    if (!event) return
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const shareData = {
      title: event.title,
      text: stripHtmlToPlainText(event.short_description) || event.subtitle || event.title,
      url,
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData)
        return
      }
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard')
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === 'AbortError') return
      try {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard')
      } catch {
        toast.error('Unable to share')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Navbar variant="transparent" />
        <div className="flex-grow flex items-center justify-center pt-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Event Not Found</h1>
            <p className="text-gray-500 mt-2">The event you are looking for does not exist.</p>
            <Button className="mt-4" onClick={() => router.push('/events')}>Browse Events</Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const deadline = event.registration_end_date
    ? new Date(event.registration_end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const isCancelled = event.is_cancelled || event.contest_status === 'cancelled'
  const isPostponed = event.is_postponed || event.contest_status === 'postponed'
  const registrationState =
    event.registration_state ||
    (event.registration_is_open
      ? 'registration_open'
      : event.publication_status === 'published' &&
          event.registration_start_date &&
          new Date(event.registration_start_date).getTime() > Date.now()
        ? 'registration_not_started'
        : event.contest_status === 'closed'
          ? 'event_completed'
          : 'registration_closed')
  const isRegistrationNotStarted = registrationState === 'registration_not_started'
  const showRegister = !isCancelled && event.registration_is_open && !isRegistrationNotStarted
  const showStickyRegister = showRegister && !event.is_registered
  const registrationOpensLabel = formatRegistrationOpensAt(event.registration_start_date)
  const hasOnlineMeeting =
    isOnlineEventMode(event.mode) &&
    Boolean(event.meeting_link_opens_at || event.event_link || event.meeting_link_available)
  const meetingUnlocked =
    Boolean(event.meeting_link_available) ||
    (event.meeting_link_opens_at != null &&
      new Date(event.meeting_link_opens_at).getTime() <= nowTick)
  const showJoinMeeting =
    hasOnlineMeeting && (event.is_registered || isAdmin)
  const meetingOpensLabel = formatMeetingOpensAt(event.meeting_link_opens_at)
  // keep nowTick referenced for unlock recompute
  void nowTick

  const eventDateLabel = (() => {
    const start = formatEventDate(event.event_start_date)
    const end = formatEventDate(event.event_end_date)
    if (start && end && start !== end) return `${start} – ${end}`
    return start
  })()
  const eventTimeLabel = formatEventTime(event.event_start_date)
  const rewardsHighlight =
    event.prize_pool ||
    (event.rewards.length > 0 ? event.rewards.map((r) => r.title).filter(Boolean).slice(0, 2).join(', ') : null)
  const eligibilityPlain = stripHtmlToPlainText(event.eligibility)
  const eligibilityHighlight = eligibilityPlain
    ? eligibilityPlain.slice(0, 80) + (eligibilityPlain.length > 80 ? '…' : '')
    : null
  const bannerSrc = resolveEventMediaUrl(event.banner_url)
  const logoSrc = resolveEventMediaUrl(event.organizer_logo_url)

  const highlightItems: { icon: LucideIcon; label: string; value: string; tone: string }[] = [
    event.mode === 'online'
      ? { icon: Video, label: 'Mode', value: 'Online Event', tone: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-300' }
      : event.mode
        ? { icon: Briefcase, label: 'Mode', value: event.mode.replace(/_/g, ' '), tone: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-300' }
        : null,
    event.mode !== 'online' && event.venue
      ? { icon: MapPin, label: 'Venue', value: event.venue, tone: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-300' }
      : event.mode === 'online' && !event.event_link && event.venue
        ? { icon: MapPin, label: 'Venue', value: event.venue, tone: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-300' }
        : null,
    eventDateLabel
      ? { icon: Calendar, label: 'Date', value: eventDateLabel, tone: 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-300' }
      : null,
    eventTimeLabel
      ? { icon: Clock, label: 'Time', value: eventTimeLabel, tone: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300' }
      : null,
    rewardsHighlight
      ? { icon: Trophy, label: 'Rewards', value: rewardsHighlight, tone: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' }
      : null,
    eligibilityHighlight
      ? { icon: Target, label: 'Eligibility', value: eligibilityHighlight, tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300' }
      : null,
  ].filter(Boolean) as { icon: LucideIcon; label: string; value: string; tone: string }[]

  const StatusBadges = () => (
    <>
      {event.category && (
        <Badge variant="outline">{CATEGORY_LABELS[event.category] || event.category}</Badge>
      )}
      {isCancelled ? (
        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">CANCELLED</Badge>
      ) : isPostponed ? (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">POSTPONED</Badge>
      ) : (
        <Badge className="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
          {isPortalEventCompleted(event)
            ? CONTEST_STATUS_LABELS.completed
            : CONTEST_STATUS_LABELS[event.contest_status]}
        </Badge>
      )}
      {showRegister && (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Registration Open</Badge>
      )}
      {isRegistrationNotStarted && !event.is_registered && (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          Registration Opens Soon
        </Badge>
      )}
    </>
  )

  const RegisterButton = ({ className = '' }: { className?: string }) => {
    if (isCancelled) {
      return (
        <div className={cn('w-full rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-center', className)}>
          <p className="text-red-700 dark:text-red-300 font-medium">This event has been cancelled.</p>
          {event.cancellation_reason && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">{event.cancellation_reason}</p>
          )}
        </div>
      )
    }

    if (isRegistrationNotStarted && !event.is_registered) {
      return (
        <div
          className={cn(
            'w-full rounded-xl border border-amber-200 bg-amber-50 p-4 text-center dark:border-amber-800 dark:bg-amber-900/20',
            className
          )}
        >
          <p className="font-semibold text-amber-900 dark:text-amber-200">
            Registration Not Yet Open
          </p>
          <p className="mt-2 text-sm text-amber-800 dark:text-amber-300">
            {registrationOpensLabel
              ? <>Registration will open on <span className="font-semibold">{registrationOpensLabel}</span>.</>
              : 'Registration has not opened yet.'}
          </p>
          <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-400">
            Please check back at that time.
          </p>
        </div>
      )
    }

    return (
      <div className={cn('space-y-3', className)}>
        <Button
          className="w-full"
          onClick={handleRegister}
          disabled={registering || event.is_registered || !showRegister}
        >
          {registering ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : event.is_registered ? (
            <CheckCircle className="w-4 h-4 mr-2" />
          ) : null}
          {event.is_registered ? 'Registered' : event.registration_button_text || 'Register Now'}
        </Button>
        {event.mode === 'online' && !hasOnlineMeeting ? (
          <p className="text-center text-xs text-muted-foreground">Online Event</p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar variant="transparent" />

      {/* ========== MOBILE HERO (< md) ========== */}
      <div className="md:hidden pt-16">
        {/* 1. Full-width banner */}
        <div className="px-3">
          <div className="relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 shadow-sm aspect-[16/9] max-h-[210px]">
            {bannerSrc ? (
              <img
                src={bannerSrc}
                alt={event.title ? `${event.title} banner` : 'Event banner'}
                className="absolute inset-0 h-full w-full object-cover object-center"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.parentElement
                    ?.querySelector('[data-banner-fallback]')
                    ?.classList.remove('hidden')
                }}
              />
            ) : null}
            <div
              data-banner-fallback
              className={cn(
                'absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600',
                bannerSrc ? 'hidden' : ''
              )}
              aria-hidden
            />
          </div>
        </div>

        {/* 2. Event information card */}
        <div className="px-3 mt-3">
          <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-700/80 dark:bg-gray-800">
            {/* Row 1: Logo + Title */}
            <div className="flex items-start gap-3">
              {logoSrc ? (
                <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm dark:border-gray-600 dark:bg-gray-900">
                  <img src={logoSrc} alt="" className="h-full w-full object-contain object-center" />
                </div>
              ) : null}
              <h1 className="min-w-0 flex-1 text-[1.35rem] font-bold leading-snug tracking-tight text-gray-900 line-clamp-2 dark:text-white">
                {event.title}
              </h1>
            </div>

            {/* Row 2: Badges */}
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadges />
            </div>

            {isPostponed && event.postponed_reason && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                <strong>Postponement notice:</strong> {event.postponed_reason}
              </div>
            )}

            {/* Row 3: Short description */}
            {(event.short_description || event.subtitle) && (
              event.short_description ? (
                <div
                  className="event-description-html mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeEventDescriptionHtml(event.short_description, ''),
                  }}
                />
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-3">
                  {event.subtitle}
                </p>
              )
            )}

            {/* Row 4: Participants / Deadline */}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4 shrink-0 text-primary-500" />
                {event.participant_count} participants
              </span>
              {deadline && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 shrink-0 text-primary-500" />
                  {deadline}
                </span>
              )}
            </div>

            {/* Row 5: Organizer */}
            {event.organizer_name && (
              <div className="mt-3 flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                <Building2 className="h-4 w-4 shrink-0 text-primary-500" />
                <span className="font-medium">{event.organizer_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Event highlights */}
        {highlightItems.length > 0 && (
          <div className="px-3 mt-3">
            <div className="rounded-2xl border border-gray-200/80 bg-white p-3 shadow-sm dark:border-gray-700/80 dark:bg-gray-800">
              <div className="grid grid-cols-2 gap-2.5">
                {highlightItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.label}
                      className="rounded-xl border border-gray-100 bg-gray-50/80 p-3 dark:border-gray-700 dark:bg-gray-900/40"
                    >
                      <div className={cn('mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg', item.tone)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {item.label}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold leading-snug text-gray-900 capitalize line-clamp-2 dark:text-white">
                        {item.value}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========== DESKTOP / TABLET HERO (md+) ========== */}
      <div className="relative hidden pt-20 md:block lg:pt-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Full-width 16:9 banner — cover + center on desktop */}
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100 shadow-sm dark:bg-gray-800">
            {bannerSrc ? (
              <img
                src={bannerSrc}
                alt={event.title ? `${event.title} banner` : 'Event banner'}
                className="absolute inset-0 h-full w-full rounded-2xl object-cover object-center"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.parentElement
                    ?.querySelector('[data-banner-fallback]')
                    ?.classList.remove('hidden')
                }}
              />
            ) : null}
            <div
              data-banner-fallback
              className={cn(
                'absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600',
                bannerSrc ? 'hidden' : ''
              )}
              aria-hidden
            />
          </div>

          {/* Info card sits below the banner — no negative-margin overlap */}
          <div className="relative mt-6 rounded-2xl border border-gray-200/80 bg-white p-8 shadow-xl shadow-gray-200/50 dark:border-gray-700/80 dark:bg-gray-800 dark:shadow-none">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              {logoSrc && (
                <div className="flex h-24 w-24 flex-shrink-0 rounded-2xl border-2 border-gray-100 bg-white p-2.5 shadow-md dark:border-gray-700 dark:bg-gray-900">
                  <img src={logoSrc} alt="" className="h-full w-full object-contain object-center" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex flex-wrap gap-2">
                  <StatusBadges />
                </div>
                {isPostponed && event.postponed_reason && (
                  <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                    <strong>Postponement notice:</strong> {event.postponed_reason}
                  </div>
                )}
                <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">{event.title}</h1>
                {event.subtitle && (
                  <p className="mt-1 text-gray-600 dark:text-gray-400">{event.subtitle}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  {event.prize_pool && (
                    <span className="flex items-center gap-1.5 font-medium text-accent-yellow-600 dark:text-accent-yellow-400">
                      <Trophy className="h-4 w-4" /> {event.prize_pool}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" /> {event.participant_count} participants
                  </span>
                  {deadline && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" /> Deadline: {deadline}
                    </span>
                  )}
                  {event.organizer_name && (
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" /> {event.organizer_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Navigation / Tabs */}
      <div className="sticky top-16 z-30 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
        <div className="container mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="scrollbar-hide flex gap-1 overflow-x-auto py-2">
            {SECTIONS.map(({ id, label, shortLabel }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={cn(
                  'flex-shrink-0 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors md:px-4',
                  activeSection === id
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                )}
              >
                <span className="md:hidden">{shortLabel}</span>
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl flex-grow px-3 py-5 sm:px-6 md:px-8 md:py-8 lg:px-8 pb-28 md:pb-8">
        <div className="flex flex-col gap-6 md:gap-8 lg:flex-row">
          {/* Left Content */}
          <div className="min-w-0 flex-1 space-y-6 md:space-y-8">
            {/* Description */}
            <section id="description" ref={(el) => { sectionRefs.current['description'] = el }} className="scroll-mt-36">
              <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white md:mb-4 md:text-xl">Description</h2>
              <div
                className="event-description-html prose prose-sm dark:prose-invert max-w-none rounded-2xl border border-gray-200 bg-white p-4 text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 md:p-6"
                dangerouslySetInnerHTML={{
                  __html: sanitizeEventDescriptionHtml(
                    event.long_description || event.short_description
                  ),
                }}
              />
            </section>

            {/* Eligibility */}
            <section id="eligibility" ref={(el) => { sectionRefs.current['eligibility'] = el }} className="scroll-mt-36">
              <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white md:mb-4 md:text-xl">Eligibility</h2>
              <div
                className="event-description-html prose prose-sm dark:prose-invert max-w-none rounded-2xl border border-gray-200 bg-white p-4 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 md:rounded-xl md:p-5"
                dangerouslySetInnerHTML={{
                  __html: sanitizeEventDescriptionHtml(
                    event.eligibility,
                    'Open to all eligible participants.'
                  ),
                }}
              />
            </section>

            {/* Rounds */}
            <section id="rounds" ref={(el) => { sectionRefs.current['rounds'] = el }} className="scroll-mt-36">
              <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white md:mb-4 md:text-xl">Rounds</h2>
              {event.rounds.length > 0 ? (
                <div className="space-y-3">
                  {event.rounds.map((round, i) => (
                    <div key={round.id || i} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 md:rounded-xl md:p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                          {i + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{round.title}</h3>
                          {round.description ? (
                            <div
                              className="event-description-html prose prose-sm dark:prose-invert mt-1 max-w-none text-sm text-gray-600 dark:text-gray-400"
                              dangerouslySetInnerHTML={{
                                __html: sanitizeEventDescriptionHtml(round.description, ''),
                              }}
                            />
                          ) : null}
                          {(round.start_date || round.end_date) && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="h-3.5 w-3.5" />
                              {round.start_date && new Date(round.start_date).toLocaleDateString('en-IN')}
                              {round.end_date && ` - ${new Date(round.end_date).toLocaleDateString('en-IN')}`}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Round details will be announced soon.</p>
              )}
            </section>

            {/* Rewards */}
            <section id="rewards" ref={(el) => { sectionRefs.current['rewards'] = el }} className="scroll-mt-36">
              <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white md:mb-4 md:text-xl">Rewards</h2>
              {event.rewards.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {event.rewards.map((reward, i) => (
                    <div key={reward.id || i} className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-secondary-50 p-4 dark:border-primary-800 dark:from-primary-900/20 dark:to-secondary-900/20 md:rounded-xl md:p-5">
                      <Trophy className="mb-2 h-5 w-5 text-accent-yellow-500" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">{reward.title}</h3>
                      {reward.value && <p className="mt-1 font-medium text-primary-600 dark:text-primary-400">{reward.value}</p>}
                      {reward.description ? (
                        <div
                          className="event-description-html prose prose-sm dark:prose-invert mt-1 max-w-none text-sm text-gray-600 dark:text-gray-400"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeEventDescriptionHtml(reward.description, ''),
                          }}
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Reward details will be announced soon.</p>
              )}
            </section>

            {/* About Organizer */}
            <section id="about-organizer" ref={(el) => { sectionRefs.current['about-organizer'] = el }} className="scroll-mt-36">
              <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white md:mb-4 md:text-xl">About Organizer</h2>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 md:rounded-xl md:p-5">
                <div className="mb-3 flex items-center gap-3">
                  {logoSrc && (
                    <img src={logoSrc} alt="" className="h-12 w-12 rounded-lg object-contain object-center" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{event.organizer_name}</h3>
                    {event.organizer_website && (
                      <a href={event.organizer_website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary-600 hover:underline dark:text-primary-400">
                        <Globe className="h-3.5 w-3.5" /> Website
                      </a>
                    )}
                  </div>
                </div>
                <div
                  className="event-description-html prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeEventDescriptionHtml(
                      event.about_organizer,
                      'Organizer information will be updated soon.'
                    ),
                  }}
                />
              </div>
            </section>

            {/* FAQs */}
            <section id="faq" ref={(el) => { sectionRefs.current['faq'] = el }} className="scroll-mt-36">
              <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white md:mb-4 md:text-xl">FAQs</h2>
              {event.faqs.length > 0 ? (
                <div className="space-y-2">
                  {event.faqs.map((faq, i) => (
                    <div key={faq.id || i} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                      <button
                        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-900/30 md:p-5"
                        onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      >
                        <span className="pr-4 font-medium text-gray-900 dark:text-white">{faq.question}</span>
                        {expandedFaq === i ? <ChevronUp className="h-4 w-4 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 flex-shrink-0" />}
                      </button>
                      {expandedFaq === i && (
                        <div
                          className="event-description-html prose prose-sm dark:prose-invert border-t border-gray-100 px-4 pb-4 pt-3 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeEventDescriptionHtml(faq.answer, ''),
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No FAQs available yet.</p>
              )}
            </section>

            {/* Results */}
            <section id="results" ref={(el) => { sectionRefs.current['results'] = el }} className="scroll-mt-36">
              <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white md:mb-4 md:text-xl">Results</h2>
              {event.results.length > 0 ? (
                <div className="space-y-3">
                  {event.results.map((result, i) => (
                    <div key={result.id || i} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 md:rounded-xl md:p-5">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{result.title}</h3>
                      {result.description && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{result.description}</p>}
                      {result.result_url && (
                        <a href={result.result_url} target="_blank" rel="noopener noreferrer"
                          className="mt-2 inline-block text-sm text-primary-600 hover:underline dark:text-primary-400">
                          View Results
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Results will be published after the event.</p>
              )}
            </section>

            {/* Support */}
            <section id="support" ref={(el) => { sectionRefs.current['support'] = el }} className="scroll-mt-36">
              <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white md:mb-4 md:text-xl">Support</h2>
              <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 md:rounded-xl md:p-5">
                {event.support_content && (
                  <p className="text-gray-700 dark:text-gray-300">{event.support_content}</p>
                )}
                {event.support_email && (
                  <a href={`mailto:${event.support_email}`} className="flex items-center gap-2 text-sm text-primary-600 hover:underline dark:text-primary-400">
                    <Mail className="h-4 w-4" /> {event.support_email}
                  </a>
                )}
                {event.support_phone && (
                  <a href={`tel:${event.support_phone}`} className="flex items-center gap-2 text-sm text-primary-600 hover:underline dark:text-primary-400">
                    <Phone className="h-4 w-4" /> {event.support_phone}
                  </a>
                )}
              </div>
            </section>
          </div>

          {/* Right Sidebar — hidden on mobile redesign only; tablet/desktop unchanged */}
          <aside className="hidden flex-shrink-0 md:block lg:w-80">
            <div className="sticky top-36 space-y-4">
              <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-lg shadow-gray-200/40 dark:border-gray-700 dark:bg-gray-800 dark:shadow-none">
                <h3 className="font-semibold text-gray-900 dark:text-white">Quick Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Status</span>
                    <Badge className="text-xs">
                      {isPortalEventCompleted(event)
                        ? CONTEST_STATUS_LABELS.completed
                        : CONTEST_STATUS_LABELS[event.contest_status]}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Participants</span>
                    <span className="font-medium text-gray-900 dark:text-white">{event.participant_count}</span>
                  </div>
                  {deadline && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Deadline</span>
                      <span className="text-right font-medium text-gray-900 dark:text-white">{deadline}</span>
                    </div>
                  )}
                  {event.prize_pool && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Prize Pool</span>
                      <span className="font-medium text-accent-yellow-600 dark:text-accent-yellow-400">{event.prize_pool}</span>
                    </div>
                  )}
                  {event.mode && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Mode</span>
                      <span className="font-medium capitalize text-gray-900 dark:text-white">
                        {event.mode === 'online' ? 'Online Event' : event.mode}
                      </span>
                    </div>
                  )}
                  {event.mode !== 'online' && event.venue && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400"><MapPin className="h-3.5 w-3.5" /> Venue</span>
                      <span className="text-right font-medium text-gray-900 dark:text-white">{event.venue}</span>
                    </div>
                  )}
                  {showJoinMeeting && (
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant={meetingUnlocked ? 'default' : 'outline'}
                        className="w-full"
                        disabled={!meetingUnlocked || joining}
                        onClick={() => void handleJoinMeeting()}
                      >
                        {joining ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Video className="mr-2 h-4 w-4" />
                        )}
                        Join Meeting
                      </Button>
                      {!meetingUnlocked ? (
                        <p className="text-center text-xs text-amber-700 dark:text-amber-300">
                          {meetingOpensLabel
                            ? `Meeting link will open at ${meetingOpensLabel}.`
                            : 'Meeting link will open 5 minutes before the event starts.'}
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>
                <div id="event-register-cta">
                  <RegisterButton />
                </div>
              </div>

              {event.organizer_name && (
                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Organizer</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{event.organizer_name}</p>
                  {event.organizer_email && (
                    <a href={`mailto:${event.organizer_email}`} className="mt-1 block text-xs text-primary-600 hover:underline dark:text-primary-400">
                      {event.organizer_email}
                    </a>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* 6. Mobile sticky bottom CTA */}
      {!isCancelled && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 md:hidden">
          <div
            className={cn(
              'flex items-center gap-3',
              !showStickyRegister && !event.is_registered && !isRegistrationNotStarted && 'justify-end'
            )}
          >
            {showStickyRegister ? (
              <Button
                className="h-12 flex-1 text-base font-semibold shadow-sm"
                onClick={handleRegister}
                disabled={registering || event.is_registered}
              >
                {registering ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {event.registration_button_text || 'Register Now'}
              </Button>
            ) : isRegistrationNotStarted && !event.is_registered ? (
              <div className="flex h-12 flex-1 flex-col items-center justify-center rounded-md bg-amber-50 px-2 text-center dark:bg-amber-900/20">
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                  Registration Not Yet Open
                </span>
                {registrationOpensLabel ? (
                  <span className="truncate text-[10px] text-amber-700 dark:text-amber-300">
                    Opens {registrationOpensLabel}
                  </span>
                ) : null}
              </div>
            ) : event.is_registered ? (
              <div className="flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-green-50 text-sm font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-300">
                <CheckCircle className="h-4 w-4" />
                Registered
              </div>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 shrink-0 rounded-xl"
              onClick={handleShare}
              aria-label="Share event"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      <div className="hidden md:block"><Footer /></div>
    </div>
  )
}
