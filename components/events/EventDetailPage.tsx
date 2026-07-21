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
import {
  Loader2, Users, Trophy, Building2, Clock, Calendar,
  Mail, Phone, Globe, MapPin, ChevronDown, ChevronUp, CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

const SECTIONS = [
  { id: 'description', label: 'Description' },
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'rounds', label: 'Rounds' },
  { id: 'rewards', label: 'Rewards' },
  { id: 'about-organizer', label: 'About Organizer' },
  { id: 'faq', label: 'FAQs' },
  { id: 'results', label: 'Results' },
  { id: 'support', label: 'Support' },
]

interface EventDetailPageProps {
  slug: string
}

export function EventDetailPage({ slug }: EventDetailPageProps) {
  const router = useRouter()
  const [event, setEvent] = useState<ContestEventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [activeSection, setActiveSection] = useState('description')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    const visitorId = localStorage.getItem('event_visitor_id') || crypto.randomUUID()
    localStorage.setItem('event_visitor_id', visitorId)
    contestEventService.getEventBySlug(slug, visitorId)
      .then(setEvent)
      .catch(() => setEvent(null))
      .finally(() => setLoading(false))
  }, [slug])

  // Register Now from listing → land on details with register CTA in view
  useEffect(() => {
    if (!event || typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('register') !== '1') return
    const timer = window.setTimeout(() => {
      document.getElementById('event-register-cta')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 250)
    return () => window.clearTimeout(timer)
  }, [event])

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
            const id = entry.target.id
            setActiveSection(id)
            window.history.replaceState(null, '', `#${id}`)
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
      window.history.replaceState(null, '', `#${id}`)
      setActiveSection(id)
    }
  }, [])

  const handleRegister = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      localStorage.setItem('redirect_after_login', `/events/${slug}?register=1`)
      router.push(`/auth/login?redirect=${encodeURIComponent(`/events/${slug}?register=1`)}`)
      return
    }
    if (event?.registration_external_url) {
      window.open(event.registration_external_url, '_blank')
      return
    }
    setRegistering(true)
    try {
      await contestEventService.registerForEvent(slug)
      toast.success('Successfully registered for the event!')
      const visitorId = localStorage.getItem('event_visitor_id') || undefined
      const updated = await contestEventService.getEventBySlug(slug, visitorId)
      setEvent(updated)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Registration failed'
      toast.error(msg)
    } finally {
      setRegistering(false)
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
  const showRegister = !isCancelled && event.registration_is_open

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
    return (
      <Button
        className={cn('w-full', className)}
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
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar variant="transparent" />

      {/* Hero Banner */}
      <div className="relative pt-16">
        <div className="relative aspect-[21/9] md:aspect-[21/7] max-h-[420px] w-full overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600">
          {event.banner_url ? (
            <>
              <img src={event.banner_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600" />
          )}
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="relative -mt-16 md:-mt-20 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white dark:bg-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 md:items-start">
              {event.organizer_logo_url && (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-2.5 bg-white dark:bg-gray-900 shadow-md flex-shrink-0 -mt-12 md:-mt-14 ring-4 ring-white dark:ring-gray-800">
                  <img src={event.organizer_logo_url} alt="" className="w-full h-full object-contain" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-3">
                  {event.category && (
                    <Badge variant="outline">{CATEGORY_LABELS[event.category] || event.category}</Badge>
                  )}
                  {isCancelled ? (
                    <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">CANCELLED</Badge>
                  ) : isPostponed ? (
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">POSTPONED</Badge>
                  ) : (
                    <Badge className="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                      {CONTEST_STATUS_LABELS[event.contest_status]}
                    </Badge>
                  )}
                  {showRegister && (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Registration Open</Badge>
                  )}
                </div>
                {isPostponed && event.postponed_reason && (
                  <div className="mb-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-200">
                    <strong>Postponement notice:</strong> {event.postponed_reason}
                  </div>
                )}
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">{event.title}</h1>
                {event.subtitle && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{event.subtitle}</p>
                )}
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                  {event.prize_pool && (
                    <span className="flex items-center gap-1.5 font-medium text-accent-yellow-600 dark:text-accent-yellow-400">
                      <Trophy className="w-4 h-4" /> {event.prize_pool}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> {event.participant_count} participants
                  </span>
                  {deadline && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> Deadline: {deadline}
                    </span>
                  )}
                  {event.organizer_name && (
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" /> {event.organizer_name}
                    </span>
                  )}
                </div>
              </div>
              <div className="hidden md:block w-52 flex-shrink-0">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50/80 dark:bg-gray-900/50">
                  <RegisterButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Navigation */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex overflow-x-auto gap-1 py-2 scrollbar-hide">
            {SECTIONS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={cn(
                  'px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-colors flex-shrink-0',
                  activeSection === id
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Content */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Description */}
            <section id="description" ref={(el) => { sectionRefs.current['description'] = el }} className="scroll-mt-36">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
                dangerouslySetInnerHTML={{ __html: event.long_description || event.short_description || 'No description available.' }}
              />
            </section>

            {/* Eligibility */}
            <section id="eligibility" ref={(el) => { sectionRefs.current['eligibility'] = el }} className="scroll-mt-36">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Eligibility</h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {event.eligibility || 'Open to all eligible participants.'}
                </p>
              </div>
            </section>

            {/* Rounds */}
            <section id="rounds" ref={(el) => { sectionRefs.current['rounds'] = el }} className="scroll-mt-36">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Rounds</h2>
              {event.rounds.length > 0 ? (
                <div className="space-y-3">
                  {event.rounds.map((round, i) => (
                    <div key={round.id || i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {i + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{round.title}</h3>
                          {round.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{round.description}</p>}
                          {(round.start_date || round.end_date) && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                              <Calendar className="w-3.5 h-3.5" />
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Rewards</h2>
              {event.rewards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {event.rewards.map((reward, i) => (
                    <div key={reward.id || i} className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl border border-primary-100 dark:border-primary-800 p-5">
                      <Trophy className="w-5 h-5 text-accent-yellow-500 mb-2" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">{reward.title}</h3>
                      {reward.value && <p className="text-primary-600 dark:text-primary-400 font-medium mt-1">{reward.value}</p>}
                      {reward.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{reward.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Reward details will be announced soon.</p>
              )}
            </section>

            {/* About Organizer */}
            <section id="about-organizer" ref={(el) => { sectionRefs.current['about-organizer'] = el }} className="scroll-mt-36">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About Organizer</h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center gap-3 mb-3">
                  {event.organizer_logo_url && (
                    <img src={event.organizer_logo_url} alt="" className="w-12 h-12 rounded-lg object-contain" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{event.organizer_name}</h3>
                    {event.organizer_website && (
                      <a href={event.organizer_website} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline">
                        <Globe className="w-3.5 h-3.5" /> Website
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {event.about_organizer || 'Organizer information will be updated soon.'}
                </p>
              </div>
            </section>

            {/* FAQs */}
            <section id="faq" ref={(el) => { sectionRefs.current['faq'] = el }} className="scroll-mt-36">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">FAQs</h2>
              {event.faqs.length > 0 ? (
                <div className="space-y-2">
                  {event.faqs.map((faq, i) => (
                    <div key={faq.id || i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <button
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors"
                        onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      >
                        <span className="font-medium text-gray-900 dark:text-white pr-4">{faq.question}</span>
                        {expandedFaq === i ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
                      </button>
                      {expandedFaq === i && (
                        <div className="px-4 pb-4 text-gray-600 dark:text-gray-400 text-sm border-t border-gray-100 dark:border-gray-700 pt-3">
                          {faq.answer}
                        </div>
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Results</h2>
              {event.results.length > 0 ? (
                <div className="space-y-3">
                  {event.results.map((result, i) => (
                    <div key={result.id || i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{result.title}</h3>
                      {result.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{result.description}</p>}
                      {result.result_url && (
                        <a href={result.result_url} target="_blank" rel="noopener noreferrer"
                          className="text-sm text-primary-600 dark:text-primary-400 hover:underline mt-2 inline-block">
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Support</h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
                {event.support_content && (
                  <p className="text-gray-700 dark:text-gray-300">{event.support_content}</p>
                )}
                {event.support_email && (
                  <a href={`mailto:${event.support_email}`} className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline">
                    <Mail className="w-4 h-4" /> {event.support_email}
                  </a>
                )}
                {event.support_phone && (
                  <a href={`tel:${event.support_phone}`} className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline">
                    <Phone className="w-4 h-4" /> {event.support_phone}
                  </a>
                )}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-36 space-y-4">
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 space-y-4 shadow-lg shadow-gray-200/40 dark:shadow-none">
                <h3 className="font-semibold text-gray-900 dark:text-white">Quick Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Status</span>
                    <Badge className="text-xs">{CONTEST_STATUS_LABELS[event.contest_status]}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Participants</span>
                    <span className="font-medium text-gray-900 dark:text-white">{event.participant_count}</span>
                  </div>
                  {deadline && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Deadline</span>
                      <span className="font-medium text-gray-900 dark:text-white text-right">{deadline}</span>
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
                      <span className="font-medium text-gray-900 dark:text-white capitalize">{event.mode}</span>
                    </div>
                  )}
                  {event.venue && (
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Venue</span>
                      <span className="font-medium text-gray-900 dark:text-white text-right">{event.venue}</span>
                    </div>
                  )}
                </div>
                <div id="event-register-cta">
                  <RegisterButton />
                </div>
              </div>

              {event.organizer_name && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Organizer</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{event.organizer_name}</p>
                  {event.organizer_email && (
                    <a href={`mailto:${event.organizer_email}`} className="text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1 block">
                      {event.organizer_email}
                    </a>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Register Bar */}
      {!isCancelled && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-200 dark:border-gray-700 z-40">
          <RegisterButton />
        </div>
      )}

      <div className="md:block hidden"><Footer /></div>
    </div>
  )
}
