'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, ArrowUpRight, Briefcase, CalendarDays, Check, ChevronDown, Filter, Globe2, MapPin, Menu, Quote, Sparkles, Users, X, UserRound, Instagram, Linkedin, Youtube, Facebook, Twitter } from 'lucide-react'
import { formatAmountINR, formatSalaryRange } from '@/lib/currency'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { DishaAuthActions } from '@/components/ui/DishaAuthActions'
import { apiClient } from '@/lib/api'
import { getJobDetailPath } from '@/lib/jobSlug'
import { prepareGuestApplyForLogin } from '@/lib/pendingJobApplication'
import { buildAuthPath } from '@/lib/authLinks'
import { sanitizeEventDescriptionHtml, stripHtmlToPlainText } from '@/lib/sanitizeHtml'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'

type JsonItem = Record<string, unknown>
type Job = {
  id: string; source: 'manual' | 'disha'; title: string; company_name: string; company_logo?: string
  location?: string; job_type?: string; compensation?: string; salary_min?: string; salary_max?: string
  experience_min?: number; experience_max?: number; slug?: string; description?: string
  responsibilities?: string; requirements?: string; qualification?: string; age_limit?: string; gender?: string
  skills?: string[]; vacancies?: number; application_deadline?: string
}
type FairContent = Record<string, unknown> & {
  hero_heading?: string; highlighted_text?: string; subtitle?: string; short_description?: string; description?: string
  hero_image?: string; logo?: string; organizer_name?: string; date_time?: string; location?: string; mode?: string
  registration_start?: string; registration_end?: string; contact_email?: string; contact_phone?: string
  cta_label?: string; cta_url?: string; statistics?: string; highlights?: JsonItem[]; partners?: JsonItem[]
  testimonials?: JsonItem[]; gallery?: JsonItem[]; additional_sections?: JsonItem[]
  chief_guest_name?: string; chief_guest_designation?: string; chief_guest_organization?: string
  chief_guest_bio?: string; chief_guest_photo?: string
}
const REGISTER_BTN = 'inline-flex items-center justify-center rounded-full bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'
const REGISTER_BTN_LG = 'inline-flex min-h-[66px] items-center justify-center rounded-2xl bg-primary-600 px-5 py-3.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'
const REGISTER_BTN_BANNER = 'mt-3 inline-flex items-center rounded-full bg-primary-600 px-4 py-2 text-[10px] font-bold text-white transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'
const JF_META_ICON = 'text-primary-700'
const JF_META_ICON_BG = 'bg-primary-50 text-primary-700'
const APPLY_BTN = 'inline-flex w-full items-center justify-center rounded-lg bg-primary-600 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 active:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60'
const VIEW_JOB_LINK = 'inline-flex items-center justify-center py-0.5 text-[10px] font-semibold text-primary-700 hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
function chiefGuestConfigured(content?: FairContent): boolean {
  return Boolean(text(content?.chief_guest_name).trim())
}
type Fair = { id: string; slug: string; title: string; content: FairContent; jobs: Job[]; published?: boolean }
type ListingFair = { id: string; slug: string; title: string; short_description?: string; hero_image?: string }
const API = '/job-fairs/public'

function text(value: unknown): string { return typeof value === 'string' ? value : value == null ? '' : String(value) }
function displayDate(value: unknown, includeTime = false): string {
  const raw = text(value)
  if (!raw) return ''
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  return new Intl.DateTimeFormat('en-IN', includeTime
    ? { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }
    : { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}
function parseSalaryAmount(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const digits = trimmed.replace(/[^\d.]/g, '')
  if (!digits) return null
  const amount = Number(digits)
  return Number.isFinite(amount) && amount > 0 ? amount : null
}

function dishaJobSalaryLabel(job: Job): string | null {
  const custom = job.compensation?.trim()
  if (custom) return custom
  const minRaw = job.salary_min
  const maxRaw = job.salary_max
  const minNum = minRaw != null && minRaw !== '' ? Number(minRaw) : NaN
  const maxNum = maxRaw != null && maxRaw !== '' ? Number(maxRaw) : NaN
  const hasMin = Number.isFinite(minNum) && minNum > 0
  const hasMax = Number.isFinite(maxNum) && maxNum > 0
  if (!hasMin && !hasMax) return null
  if (hasMin && hasMax && minNum > maxNum) {
    return formatSalaryRange(maxNum, minNum, '') || null
  }
  return formatSalaryRange(hasMin ? minNum : null, hasMax ? maxNum : null, '') || null
}

function manualJobSalaryLabel(job: Job): string | null {
  const raw = job.compensation?.trim()
  if (!raw) return null
  const plainNumeric = raw.replace(/[\s,₹]/g, '')
  if (/^\d+$/.test(plainNumeric)) {
    return formatAmountINR(plainNumeric)
  }
  const rangeParts = raw.split(/\s*[–-]\s*/)
  if (rangeParts.length === 2) {
    const left = parseSalaryAmount(rangeParts[0])
    const right = parseSalaryAmount(rangeParts[1])
    const hasLetters = /[a-zA-Z]/.test(raw.replace(/[₹,\d\s.–-]/g, ''))
    if (left !== null && right !== null && !hasLetters) {
      const low = Math.min(left, right)
      const high = Math.max(left, right)
      return formatSalaryRange(low, high, '') || null
    }
  }
  const lone = parseSalaryAmount(raw)
  if (lone !== null && !/[a-zA-Z]/.test(raw)) {
    return formatAmountINR(lone)
  }
  return raw
}

function jobCardSalaryLabel(job: Job): string | null {
  return job.source === 'disha' ? dishaJobSalaryLabel(job) : manualJobSalaryLabel(job)
}

function safeExternalUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null
  try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null } catch { return null }
}
function safeHref(value: unknown): string | null {
  if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\')) return value
  return safeExternalUrl(value)
}
function items(value: unknown): JsonItem[] {
  return Array.isArray(value) ? value.filter((item): item is JsonItem => Boolean(item && typeof item === 'object' && !Array.isArray(item))) : []
}
function initials(value: string) { return value.trim().split(/\s+/).slice(0, 2).map(word => word[0] || '').join('').toUpperCase() }

function LogoImage({ src, name, textFallback = false }: { src: string | null; name: string; textFallback?: boolean }) {
  const [failed, setFailed] = useState(false)
  if (src && !failed) return <img src={src} alt={`${name} logo`} onError={() => setFailed(true)} className="h-full w-full object-contain"/>
  return textFallback ? <span aria-hidden="true">{initials(name)}</span> : <Briefcase className="h-6 w-6" aria-hidden="true"/>
}

function EventHeader({ fair, sections = true, onRegister }: { fair?: Fair; sections?: boolean; onRegister?: () => void }) {
  const [open, setOpen] = useState(false)
  const c = fair?.content
  const links = sections ? [
    ['Home', '#home'], ['Jobs', '#jobs'],
    ...(chiefGuestConfigured(c) ? [['Chief Guest', '#chief-guest']] : []),
    ...(items(c?.highlights).length || items(c?.additional_sections).length ? [['Programs', '#programs']] : []),
    ...(items(c?.partners).length ? [['Partners', '#partners']] : []),
    ...(items(c?.testimonials).length ? [['Testimonials', '#testimonials']] : []),
    ...(items(c?.gallery).length ? [['Gallery', '#gallery']] : []),
  ] : [['Job Fairs', '/job-fairs']]
  const cta = safeHref(c?.cta_url) || (sections ? '#jobs' : '/job-fairs')

  return <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
    <div className="mx-auto flex h-[58px] max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3"><BrandLogo href="/job-fairs" compact priority/><span className="hidden h-7 w-px bg-slate-200 sm:block"/><span className="hidden max-w-40 truncate text-xs font-semibold text-slate-700 sm:block">{fair?.title || 'Career events'}</span></div>
      <nav className="hidden items-center gap-5 xl:flex" aria-label="Event navigation">{links.map(([label, href]) => <a key={href} href={href} className="text-[12px] font-medium text-slate-600 transition-colors hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">{label}</a>)}</nav>
      <div className="flex items-center gap-2"><span className="hidden text-slate-600 sm:inline-flex"><UserRound className="h-4 w-4"/></span><div className="hidden sm:block"><DishaAuthActions/></div>{sections && onRegister ? <button type="button" onClick={onRegister} className={`hidden sm:inline-flex ${REGISTER_BTN}`}>Register Now<ArrowRight className="ml-1.5 h-3.5 w-3.5"/></button> : <a href={cta} className={`hidden sm:inline-flex ${REGISTER_BTN}`}>{sections ? (safeHref(c?.cta_url) ? 'Register Now' : 'Explore Jobs') : 'Explore Events'}<ArrowRight className="ml-1.5 h-3.5 w-3.5"/></a>}<button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 xl:hidden" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => setOpen(value => !value)}>{open ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}</button></div>
    </div>
    {open && <nav className="border-t border-slate-100 bg-white px-4 py-3 shadow-lg lg:hidden" aria-label="Mobile event navigation"><div className="mx-auto grid max-w-7xl gap-1">{links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">{label}</a>)}{sections && onRegister ? <button type="button" onClick={() => { setOpen(false); onRegister() }} className={`mt-1 w-full px-3 py-3 text-left text-sm font-semibold ${REGISTER_BTN}`}>Register Now<ArrowUpRight className="ml-2 inline h-4 w-4"/></button> : <a href={cta} onClick={() => setOpen(false)} className={`mt-1 block px-3 py-3 text-sm font-semibold ${REGISTER_BTN}`}>{sections ? (safeHref(c?.cta_url) ? 'Register Now' : 'Explore Jobs') : 'Explore Events'}<ArrowUpRight className="ml-2 inline h-4 w-4"/></a>}<div className="mt-2 border-t border-slate-100 pt-2"><DishaAuthActions/></div></div></nav>}
  </header>
}

function PageFooter({ fair }: { fair?: Fair }) {
  const c = fair?.content
  const email = text(c?.contact_email)
  const phone = text(c?.contact_phone)
  const socials = c?.social_links && typeof c.social_links === 'object' ? c.social_links as Record<string, unknown> : {}
  const socialLinks = [
    { label: 'LinkedIn', href: safeExternalUrl(socials.linkedin), icon: <Linkedin className="h-4 w-4"/> },
    { label: 'Instagram', href: safeExternalUrl(socials.instagram), icon: <Instagram className="h-4 w-4"/> },
    { label: 'Facebook', href: safeExternalUrl(socials.facebook), icon: <Facebook className="h-4 w-4"/> },
    { label: 'YouTube', href: safeExternalUrl(socials.youtube), icon: <Youtube className="h-4 w-4"/> },
    { label: 'X', href: safeExternalUrl(socials.x), icon: <Twitter className="h-4 w-4"/> },
  ].filter(item => item.href).map(item => ({ ...item, href: item.href! }))
  return <footer className="border-t border-slate-200 bg-white">
    <div className="mx-auto grid max-w-[1320px] gap-8 px-4 py-8 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1.35fr] lg:gap-7 lg:px-8 lg:py-10">
      <div><BrandLogo href="/job-fairs" compact/><p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-600">{fair ? `Explore opportunities and meet the organizations participating in ${fair.title}.` : 'Discover career fairs and opportunities from participating organizations.'}</p><div className="mt-3 flex gap-1">{socialLinks.map(({ label, href, icon }) => <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-gray-100 hover:text-teal-700">{icon}</a>)}</div></div>
      <div><h2 className="mb-4 text-base font-semibold text-slate-900">Quick Links</h2><ul className="space-y-2.5 text-sm text-slate-600"><li><Link href="/" className="hover:text-teal-700">Home</Link></li><li><Link href="/jobs" className="hover:text-teal-700">Jobs</Link></li><li><Link href="/events" className="hover:text-teal-700">Upcoming Events</Link></li><li><Link href="/mock-tests" className="hover:text-teal-700">Practice Tests</Link></li><li><Link href={buildAuthPath('/auth/login')} className="hover:text-teal-700">Sign In</Link></li><li><Link href={buildAuthPath('/auth/register')} className="hover:text-teal-700">Sign Up</Link></li></ul></div>
      <div><h2 className="mb-4 text-base font-semibold text-slate-900">Resources</h2><ul className="space-y-2.5 text-sm text-slate-600"><li><a href="https://hirekarma.in/about-us/our-story" target="_blank" rel="noopener noreferrer" className="hover:text-teal-700">Our Story</a></li><li><a href="https://hirekarma.in/about-us/mission-value" target="_blank" rel="noopener noreferrer" className="hover:text-teal-700">Mission &amp; Value</a></li><li><a href="https://hirekarma.in/about-us/people" target="_blank" rel="noopener noreferrer" className="hover:text-teal-700">People</a></li><li><Link href="/contact" className="hover:text-teal-700">Contact &amp; Support</Link></li></ul></div>
      <div><h2 className="mb-4 text-base font-semibold text-slate-900">Contact Us</h2><dl className="grid grid-cols-[4.75rem_minmax(0,1fr)] gap-x-3 gap-y-3 text-sm">{text(c?.organizer_name) && <><dt className="pt-0.5 font-medium text-slate-900">Organizer</dt><dd className="text-slate-600">{text(c?.organizer_name)}</dd></>}{email && <><dt className="pt-0.5 font-medium text-slate-900">Email</dt><dd><a href={`mailto:${email}`} className="text-slate-600 hover:text-teal-700">{email}</a></dd></>}{phone && <><dt className="pt-0.5 font-medium text-slate-900">Contact</dt><dd><a href={`tel:${phone}`} className="text-slate-600 hover:text-teal-700">{phone}</a></dd></>}{text(c?.location) && <><dt className="pt-0.5 font-medium text-slate-900">Location</dt><dd className="leading-relaxed text-slate-600">{text(c?.location)}</dd></>}</dl></div>
    </div>
    <div className="border-t border-slate-100"><p className="mx-auto max-w-[1320px] px-4 py-3 text-center text-[11px] text-slate-500 sm:px-6 lg:px-8">© 2026 Disha. All rights reserved.</p></div>
  </footer>
}

function Layout({ children, fair, sections = true, onRegister }: { children: React.ReactNode; fair?: Fair; sections?: boolean; onRegister?: () => void }) {
  return <div className="min-h-screen bg-[#fbfbf8] text-slate-950 motion-safe:scroll-smooth"><EventHeader fair={fair} sections={sections} onRegister={onRegister}/>{children}<PageFooter fair={fair}/></div>
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return <div className="mx-auto mb-6 max-w-2xl text-center sm:mb-8">{eyebrow && <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-700">{eyebrow}</p>}<h2 className={`font-[var(--font-sora)] text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl ${eyebrow ? 'mt-2' : ''}`}>{title}</h2>{subtitle && <p className="mt-3 text-base leading-7 text-slate-600">{subtitle}</p>}</div>
}

function RichTextBlock({ value, className = '' }: { value: unknown; className?: string }) {
  const html = text(value).replace(/<ol\b[^>]*>[\s\S]*?<\/ol>/gi, list => /data-list=["']bullet["']/i.test(list)
    ? `<ul>${list.replace(/<ol\b[^>]*>|<\/ol>/gi, '').replace(/<li\b[^>]*data-list=["']bullet["'][^>]*>/gi, '<li>').replace(/<span\b[^>]*class=["'][^"']*ql-ui[^"']*["'][^>]*><\/span>/gi, '')}</ul>`
    : list)
  return <div className={`[&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_strong]:font-bold [&_b]:font-bold [&_a]:text-teal-800 [&_a]:underline ${className}`} dangerouslySetInnerHTML={{ __html: sanitizeEventDescriptionHtml(html, '') }}/>
}

export function JobFairListing() {
  const [fairs, setFairs] = useState<ListingFair[]>([])
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const loadFairs = useCallback(async () => {
    setLoading(true); setLoadFailed(false)
    try { const { data } = await apiClient.client.get(API); setFairs(data.job_fairs || []) }
    catch { setLoadFailed(true); toast.error('Could not load Job Fairs') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void loadFairs() }, [loadFairs])
  return <Layout sections={false}><main className="mx-auto min-h-[70vh] max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div className="relative overflow-hidden rounded-[2rem] border border-teal-100 bg-[#effbf5] px-6 py-12 sm:px-10 lg:px-14"><div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border-[36px] border-white/60"/><div className="relative max-w-2xl"><p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-teal-800 shadow-sm"><Sparkles className="h-4 w-4"/>Career events</p><h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">Find your next opportunity <span className="text-rose-500">at a Job Fair.</span></h1><p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">Explore open roles and career events from participating organizations.</p></div></div>
    <section className="py-12" aria-labelledby="all-fairs-heading"><div className="mb-6 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">Explore</p><h2 id="all-fairs-heading" className="mt-2 text-2xl font-bold">Job Fairs</h2></div><span className="text-sm text-slate-500">{fairs.length} {fairs.length === 1 ? 'event' : 'events'}</span></div>
      {loading ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map(index => <div key={index} className="h-72 animate-pulse rounded-2xl bg-slate-200 motion-reduce:animate-none"/>)}</div> : loadFailed ? <div className="rounded-2xl border border-amber-200 bg-white px-6 py-14 text-center"><h3 className="text-lg font-semibold">Job Fairs could not be loaded</h3><p className="mt-2 text-sm text-slate-500">Check your connection and try again.</p><button type="button" onClick={() => void loadFairs()} className="mt-5 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">Try again</button></div> : fairs.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{fairs.map((fair, index) => { const image = safeExternalUrl(fair.hero_image); const tints = ['bg-[#f0faf3]', 'bg-[#fff9e8]', 'bg-[#f5f2ff]']; return <Link key={fair.id} href={`/job-fairs/${fair.slug}`} className={`group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${tints[index % tints.length]}`}><div className="relative aspect-video overflow-hidden">{image ? <img src={image} alt="" className="h-full w-full object-contain transition duration-500 group-hover:scale-105"/> : <div className="grid h-full place-items-center"><div className="grid h-24 w-24 place-items-center rounded-3xl bg-white/90 text-teal-700 shadow-sm"><Briefcase className="h-10 w-10"/></div></div>}<span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-teal-800">Career Expo</span></div><div className="p-5"><h3 className="text-xl font-bold group-hover:text-teal-800">{fair.title}</h3><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{stripHtmlToPlainText(fair.short_description) || 'Explore participating organizations and open positions.'}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-800">Explore event<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1"/></span></div></Link>})}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Briefcase className="h-7 w-7"/></div><h3 className="mt-4 text-lg font-semibold">No published Job Fairs right now</h3><p className="mt-2 text-sm text-slate-500">Check back soon for new career events.</p></div>}
    </section>
  </main></Layout>
}

function JobVisual({ fair }: { fair: Fair; jobsCount?: number }) {
  const image = safeExternalUrl(fair.content.hero_image)
  const [imageFailed, setImageFailed] = useState(false)
  return <div className="relative mx-auto w-full max-w-[580px]">
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-[8%] bottom-[3%] top-[8%] z-0 rounded-[44%] bg-[#e8faf1]"/>
    <span aria-hidden="true" className="pointer-events-none absolute -right-1 top-3 z-0 h-7 w-7 rounded-full border-[5px] border-amber-400"/>
    {image && !imageFailed ? <img src={image} alt={`People meeting recruiters at ${fair.title}`} onError={() => setImageFailed(true)} className="relative z-10 aspect-video w-full rounded-[1.75rem] object-contain"/> : <img src="/images/job-fair-hero.png" alt="Job seekers meeting recruiters at a career fair" className="relative z-10 aspect-video w-full rounded-[1.75rem] object-contain"/>}
  </div>
}

function ChiefGuestSection({ content }: { content: FairContent }) {
  if (!chiefGuestConfigured(content)) return null
  const name = text(content.chief_guest_name)
  const photo = safeExternalUrl(content.chief_guest_photo)
  const designation = text(content.chief_guest_designation)
  const organization = text(content.chief_guest_organization)
  const bio = text(content.chief_guest_bio)
  return <section id="chief-guest" className="scroll-mt-20 border-y border-slate-100 bg-white py-10 sm:py-12">
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Honored guest" title="Chief Guest" subtitle="Meet the distinguished speaker joining this Job Fair."/>
      <div className="mx-auto grid max-w-4xl items-center gap-8 rounded-[1.75rem] border border-slate-100 bg-[#fbfbf8] p-6 shadow-sm sm:p-8 md:grid-cols-[minmax(0,220px)_1fr]">
        <div className="mx-auto w-full max-w-[220px]">
          {photo ? <img src={photo} alt={name} className="aspect-[4/5] w-full rounded-2xl object-cover shadow-md"/> : <div className="grid aspect-[4/5] w-full place-items-center rounded-2xl bg-[#e8faf1] text-3xl font-bold text-teal-800">{initials(name)}</div>}
        </div>
        <div className="min-w-0 text-center md:text-left">
          <h3 className="font-[var(--font-sora)] text-2xl font-bold tracking-tight text-[#101b30] sm:text-3xl">{name}</h3>
          {designation && <p className="mt-2 text-base font-semibold text-teal-800">{designation}</p>}
          {organization && <p className="mt-1 text-sm font-medium text-slate-600">{organization}</p>}
          {bio && <RichTextBlock value={bio} className="mt-4 text-left text-sm leading-7 text-slate-700"/>}
        </div>
      </div>
    </div>
  </section>
}

function InfoPill({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${JF_META_ICON_BG}`}><Icon className="h-5 w-5"/></span><span className="min-w-0"><span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</span><span className="block truncate text-sm font-semibold text-slate-800">{value}</span></span></div>
}

function MissingImage({ children }: { children: React.ReactNode }) {
  const [failed, setFailed] = useState(false)
  return failed ? <>{children}</> : null
}

function JobCard({ job, fairSlug, onApply, applying, applied }: { job: Job; fairSlug: string; onApply: (job: Job) => void; applying: boolean; applied: boolean }) {
  const logo = safeExternalUrl(job.company_logo)
  const detailPath = job.source === 'disha' ? getJobDetailPath({ id: job.id, slug: job.slug, title: job.title, company_name: job.company_name }) : null
  const viewPath = detailPath || `/job-fairs/${encodeURIComponent(fairSlug)}?view_job=${encodeURIComponent(job.id)}`
  const salaryLabel = jobCardSalaryLabel(job)
  return <article className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-3.5 shadow-[0_2px_8px_rgba(15,23,42,.04)] transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md">
    <div className="flex min-h-20 items-center gap-2"><div className={`grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#f0faf3] ${JF_META_ICON}`}><LogoImage src={logo} name={job.company_name}/></div></div><div className="mt-2 min-h-[44px]"><h3 className="line-clamp-2 text-sm font-bold leading-5 text-slate-950">{job.title}</h3><p className="mt-0.5 text-[11px] font-medium text-slate-500">{job.company_name}</p></div>
    <div className="mt-2 flex min-h-[22px] flex-wrap gap-1.5">{job.job_type && <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-800">{job.job_type.replace(/_/g, ' ')}</span>}</div>
    <div className="mt-2 min-h-[48px] space-y-1 text-[10px] leading-4 text-slate-500">{job.location && <p><MapPin className={`mr-1 inline h-3 w-3 ${JF_META_ICON}`}/>{job.location}</p>}{job.experience_min != null && <p><Briefcase className={`mr-1 inline h-3 w-3 ${JF_META_ICON}`}/>{job.experience_min}–{job.experience_max ?? job.experience_min} years experience</p>}</div>
    {(salaryLabel || job.application_deadline) && <div className="mt-4 space-y-1 text-sm text-slate-600">{salaryLabel && <p className="font-semibold text-slate-800">{salaryLabel}</p>}{job.application_deadline && <p className="text-xs text-slate-500">Apply by {new Date(job.application_deadline).toLocaleDateString()}</p>}</div>}
    <div className="mt-auto flex flex-col gap-1.5 pt-2"><button type="button" disabled={applying || applied} onClick={() => onApply(job)} className={APPLY_BTN}>{applying ? 'Applying…' : applied ? 'Applied' : 'Apply Now'}</button><a href={viewPath} target="_blank" rel="noopener noreferrer" className={VIEW_JOB_LINK}>View Job<ArrowRight className="ml-1 h-3 w-3"/></a></div>
  </article>
}

function ManualJobDetails({ fair, job, applying, applied, onApply, onRegister }: { fair: Fair; job: Job; applying: boolean; applied: boolean; onApply: () => void; onRegister: () => void }) {
  const logo = safeExternalUrl(job.company_logo)
  const salaryLabel = jobCardSalaryLabel(job)
  return <Layout fair={fair} onRegister={onRegister}><main className="mx-auto min-h-[70vh] max-w-4xl px-4 py-10 sm:px-6">
    <Link href={`/job-fairs/${encodeURIComponent(fair.slug)}`} className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800 hover:underline"><ArrowRight className="h-4 w-4 rotate-180"/>Back to {fair.title}</Link>
    <article className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
      <div className="flex flex-col gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">{logo ? <img src={logo} alt={`${job.company_name} logo`} className="h-20 w-20 rounded-xl bg-[#f0faf3] object-contain"/> : <div className="grid h-20 w-20 place-items-center rounded-xl bg-[#f0faf3] text-teal-800"><Briefcase className="h-8 w-8"/></div>}<div><p className="text-xs font-bold uppercase tracking-widest text-teal-700">Job Fair opportunity</p><h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">{job.title}</h1><p className="mt-1 text-slate-600">{job.company_name}</p></div></div>
      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">{salaryLabel && <span className="font-semibold text-slate-800">{salaryLabel}</span>}{job.location && <span><MapPin className={`mr-1 inline h-4 w-4 ${JF_META_ICON}`}/>{job.location}</span>}{job.job_type && <span>{job.job_type.replace(/_/g, ' ')}</span>}{job.experience_min != null && <span>{job.experience_min}–{job.experience_max ?? job.experience_min} years experience</span>}{job.application_deadline && <span>Apply by {new Date(job.application_deadline).toLocaleDateString()}</span>}</div>
      <div className="mt-8 space-y-6">{job.qualification && <section><h2 className="text-lg font-bold">Qualification</h2><RichTextBlock value={job.qualification} className="mt-2 leading-7 text-slate-700"/></section>}{job.age_limit && <section><h2 className="text-lg font-bold">Age limit</h2><p className="mt-2 leading-7 text-slate-700">{job.age_limit}</p></section>}{job.gender && <section><h2 className="text-lg font-bold">Gender</h2><p className="mt-2 leading-7 capitalize text-slate-700">{job.gender}</p></section>}{job.description && <section><h2 className="text-lg font-bold">Job description</h2><RichTextBlock value={job.description} className="mt-2 leading-7 text-slate-700"/></section>}{job.responsibilities && <section><h2 className="text-lg font-bold">Responsibilities</h2><RichTextBlock value={job.responsibilities} className="mt-2 leading-7 text-slate-700"/></section>}{job.requirements && <section><h2 className="text-lg font-bold">Requirements</h2><RichTextBlock value={job.requirements} className="mt-2 leading-7 text-slate-700"/></section>}{job.skills?.length ? <section><h2 className="text-lg font-bold">Skills</h2><p className="mt-2 leading-7 text-slate-700">{job.skills.join(', ')}</p></section> : null}{!job.description && !job.responsibilities && !job.requirements && !job.skills?.length && !job.qualification && !job.age_limit && !job.gender && <p className="text-slate-600">No additional job description was provided.</p>}</div>
      <button type="button" disabled={applying || applied} onClick={onApply} className="mt-8 inline-flex min-w-40 items-center justify-center rounded-lg bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 active:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60">{applying ? 'Applying…' : applied ? 'Applied' : 'Apply Now'}</button>
    </article>
  </main></Layout>
}

function Highlights({ fair, highlights }: { fair: Fair; highlights: JsonItem[] }) {
  const additions = items(fair.content.additional_sections)
  if (!highlights.length && !additions.length) return null
  const highlightsGrid = highlights.length === 1 ? 'mx-auto grid max-w-sm grid-cols-1 gap-3' : highlights.length === 2 ? 'mx-auto grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2' : 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4'
  return <section id="programs" className="scroll-mt-20 bg-[#fffdf7] py-8 sm:py-10"><div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8"><SectionHeading eyebrow="Explore the experience" title="Programs in Job Fair" subtitle={text(fair.content.subtitle) || stripHtmlToPlainText(text(fair.content.description)) || 'Discover sessions, skills, and connections that help you move forward.'}/>{highlights.length > 0 && <div className={highlightsGrid}>{highlights.map((item, index) => { const colors = ['bg-[#fff8df]', 'bg-[#eaf9ef]', 'bg-[#f2efff]', 'bg-[#e8f8fb]']; const media = safeExternalUrl(item.image || item.image_url || item.icon_url); const website = safeExternalUrl(item.website); return <article key={text(item.id) || `${text(item.title)}-${index}`} className={`min-w-0 rounded-[1.25rem] border border-white p-4 text-center shadow-[0_2px_10px_rgba(15,23,42,.035)] sm:p-5 ${colors[index % colors.length]}`}>
    {media && <img src={media} alt={text(item.title || item.name)} className="mx-auto mb-3 aspect-video w-full rounded-xl bg-white/70 object-contain mix-blend-multiply"/>}<h3 className="text-sm font-bold leading-5 text-slate-950">{text(item.title || item.name)}</h3>{Boolean(item.role || item.category) && <p className="mt-1 text-xs text-slate-500">{text(item.role || item.category)}</p>}{Boolean(item.description || item.feedback) && <RichTextBlock value={item.description || item.feedback} className="mx-auto mt-2 max-w-[15rem] text-xs leading-[1.45] text-slate-600"/>}{website && <a href={website} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-xs font-semibold text-teal-800 underline">Learn more</a>}</article>})}</div>}{additions.length > 0 && <div className={`${highlights.length ? 'mt-5' : ''} grid gap-3 md:grid-cols-2`}>{additions.map((item, index) => { const media = safeExternalUrl(item.image || item.image_url || item.logo || item.photo); const website = safeExternalUrl(item.website); return <article key={text(item.id) || `additional-${index}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">{media && <img src={media} alt={text(item.alt || item.caption || item.title)} className="mb-4 aspect-video w-full rounded-xl object-contain mix-blend-multiply"/>}<h3 className="text-xl font-bold">{text(item.title || item.name || item.company_name || item.person)}</h3>{Boolean(item.role || item.category) && <p className="mt-1 text-sm text-slate-500">{text(item.role || item.category)}</p>}{Boolean(item.description || item.feedback) && <RichTextBlock value={item.description || item.feedback} className="mt-3 leading-7 text-slate-600"/>}{website && <a href={website} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-sm font-semibold text-teal-800 underline">Website</a>}</article>})}</div>}</div></section>
}

function Partners({ partners }: { partners: JsonItem[] }) {
  if (!partners.length) return null
  const gridClass = partners.length === 1 ? 'mx-auto grid max-w-[170px] grid-cols-1 gap-3' : partners.length === 2 ? 'mx-auto grid max-w-md grid-cols-2 gap-3' : 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
  return <section id="partners" className="scroll-mt-20 bg-white py-8 sm:py-10"><div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8"><SectionHeading eyebrow="Together we go further" title="Event Partners" subtitle="Meet the organizations supporting this career experience."/><div className={gridClass}>{partners.map((partner, index) => { const name = text(partner.name || partner.title || partner.company_name) || 'Event partner'; const logo = safeExternalUrl(partner.logo || partner.image || partner.image_url); const website = safeExternalUrl(partner.website); const content = <><div className="grid h-20 w-20 place-items-center overflow-hidden text-2xl font-bold text-teal-800"><LogoImage src={logo} name={name} textFallback/></div><div className="mt-1 flex items-center justify-center gap-1.5"><h3 className="truncate text-xs font-semibold text-slate-800">{name}</h3>{website && <ArrowUpRight className="h-3 w-3 shrink-0 text-teal-700"/>}</div></>; const classes = 'flex min-h-[124px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-2 py-3 shadow-[0_2px_8px_rgba(15,23,42,.035)] transition hover:border-teal-200 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600'; return website ? <a key={text(partner.id) || `${name}-${index}`} href={website} target="_blank" rel="noopener noreferrer" className={classes}>{content}</a> : <article key={text(partner.id) || `${name}-${index}`} className={classes}>{content}</article>})}</div></div></section>
}

function Testimonials({ testimonials }: { testimonials: JsonItem[] }) {
  if (!testimonials.length) return null
  const gridClass = testimonials.length === 1 ? 'mx-auto grid max-w-2xl grid-cols-1 gap-4' : 'grid grid-cols-1 gap-4 lg:grid-cols-2'
  return <section id="testimonials" className="relative isolate scroll-mt-24 px-5 py-8 before:pointer-events-none before:absolute before:inset-y-0 before:left-1/2 before:-z-10 before:w-screen before:-translate-x-1/2 before:bg-[#effaf3] sm:px-8 sm:py-10 lg:px-12 lg:py-12"><SectionHeading eyebrow="Attendee stories" title="What Past Attendees Say" subtitle="Experiences shared by people who have been part of the event."/><div className={gridClass}>{testimonials.map((item, index) => { const person = text(item.person || item.name || item.title); const photo = safeExternalUrl(item.photo || item.image || item.image_url); return <article key={text(item.id) || `${person}-${index}`} className="relative rounded-2xl border border-white bg-white p-5 shadow-sm sm:p-6"><Quote className="absolute right-5 top-5 h-8 w-8 text-teal-100"/><p className="relative pr-8 text-base leading-7 text-slate-700">{text(item.feedback || item.description)}</p><div className="mt-5 flex items-center gap-3">{photo ? <img src={photo} alt={person} className="h-11 w-11 rounded-full object-cover"/> : <div className="grid h-11 w-11 place-items-center rounded-full bg-[#fff4c8] text-sm font-bold text-amber-900">{initials(person)}</div>}<div><p className="font-bold text-slate-950">{person}</p><p className="text-sm text-slate-500">{[text(item.role || item.category), text(item.company_name)].filter(Boolean).join(' · ')}</p></div></div></article>})}</div></section>
}

function GalleryCard({ item }: { item: JsonItem }) {
  const [failed, setFailed] = useState(false)
  const image = safeExternalUrl(item.image || item.image_url || item.photo)
  const caption = text(item.caption || item.title || item.alt)
  if (!image || failed) return null
  return <figure className="group relative aspect-video overflow-hidden rounded-xl bg-slate-100"><img src={image} alt={caption} loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-contain transition duration-500 group-hover:scale-105"/>{caption && <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent px-3 pb-3 pt-10 text-xs font-medium text-white">{caption}</figcaption>}</figure>
}

function Gallery({ gallery, content }: { gallery: JsonItem[]; content: FairContent }) {
  if (!gallery.length) return null
  const sectionHeading = Object.prototype.hasOwnProperty.call(content, 'gallery_heading') ? text(content.gallery_heading) : 'Moments from the Fair'
  const sectionEyebrow = Object.prototype.hasOwnProperty.call(content, 'gallery_eyebrow') ? text(content.gallery_eyebrow) : 'The event experience'
  const sectionDescription = Object.prototype.hasOwnProperty.call(content, 'gallery_description') ? text(content.gallery_description) : 'A glimpse of the people, ideas, and opportunities that bring this event together.'
  return <section id="gallery" className="scroll-mt-20"><SectionHeading eyebrow={sectionEyebrow} title={sectionHeading} subtitle={sectionDescription}/><div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">{gallery.map((item, index) => <GalleryCard key={text(item.id) || `${text(item.image || item.image_url)}-${index}`} item={item}/>)}</div></section>
}

function RegistrationBanner({ fair, onRegister }: { fair: Fair; onRegister: () => void }) {
  const heading = text(fair.content.cta_heading) || 'Be Part of HireKarma Mega Career & Job Fair 2026'
  const description = text(fair.content.cta_description) || 'Connect with leading companies, explore career opportunities, and take the next step toward your dream job at the HireKarma Mega Career & Job Fair 2026.'
  const eyebrow = text(fair.content.cta_eyebrow) || 'Don’t miss out'
  const image = safeExternalUrl(fair.content.cta_image)
  return <section className="overflow-hidden bg-[#fff7e7]" aria-label="Register for the Job Fair"><div className={`mx-auto grid max-w-[1320px] items-center gap-4 px-4 py-5 sm:px-6 lg:px-8 ${image ? 'md:grid-cols-[.85fr_1.15fr]' : ''}`}>
    {image && <img src={image} alt={heading} className="aspect-video mix-blend-multiply w-full rounded-2xl object-contain"/>}
    <div className={image ? 'py-2 md:pl-4' : 'mx-auto w-full max-w-3xl py-2 text-center'}><p className="text-[9px] font-bold uppercase tracking-[.2em] text-teal-800">{eyebrow}</p><h2 className="mt-1 max-w-xl text-xl font-extrabold leading-tight tracking-tight text-[#101b30] sm:text-2xl">{heading}</h2><RichTextBlock value={description} className="mt-2 max-w-xl text-[11px] leading-5 text-slate-600"/><button type="button" onClick={onRegister} className={REGISTER_BTN_BANNER}>{text(fair.content.cta_label) || 'Register Now'}<ArrowRight className="ml-1.5 h-3.5 w-3.5"/></button></div>
  </div></section>
}

function EventInfo({ fair, onRegister }: { fair: Fair; onRegister: () => void }) {
  const c = fair.content
  const info: Array<[typeof CalendarDays, string, string]> = [
    [CalendarDays, 'Date & time', displayDate(c.date_time, true)], [MapPin, 'Location', text(c.location)],
    [Globe2, 'Format', text(c.mode)], [Users, 'Organizer', text(c.organizer_name)],
    [CalendarDays, 'Registration deadline', displayDate(c.registration_end)],
  ] as const
  const available = info.filter(([, , value]) => value)
  if (!available.length) return null
  return <section aria-label="Event information" className="relative z-10 mx-auto -mt-4 grid max-w-[1320px] grid-cols-1 gap-2.5 px-4 sm:grid-cols-2 sm:px-6 lg:-mt-7 lg:grid-cols-3 lg:px-8 xl:grid-cols-5">{available.map(([icon, label, value]) => <InfoPill key={label} icon={icon} label={label} value={value}/>)}<button type="button" onClick={onRegister} className={REGISTER_BTN_LG}>Register Now<ArrowRight className="ml-2 h-4 w-4"/></button></section>
}

export function JobFairDetails({ slug }: { slug: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const previewId = params.get('preview') === '1' ? params.get('id') : null
  const [fair, setFair] = useState<Fair | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<'failed' | 'not-found' | null>(null)
  const [applying, setApplying] = useState<string | null>(null)
  const [registering, setRegistering] = useState(false)
  const [applied, setApplied] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [source, setSource] = useState<'all' | 'disha' | 'manual'>('all')
  const autoApplied = useRef(false)
  const autoRegistered = useRef(false)
  const load = useCallback(() => {
    setLoading(true); setLoadError(null)
    return apiClient.client.get(previewId ? `/job-fairs/admin/${encodeURIComponent(previewId)}` : `${API}/${encodeURIComponent(slug)}`)
      .then(({ data }) => setFair(data))
      .catch((error: { response?: { status?: number } }) => { setFair(null); setLoadError(error?.response?.status === 404 ? 'not-found' : 'failed') })
      .finally(() => setLoading(false))
  }, [slug, previewId])
  useEffect(() => { void load() }, [load])
  const applyManual = useCallback(async (jobId: string) => {
    setApplying(jobId)
    try { await apiClient.client.post(`${API}/${encodeURIComponent(slug)}/manual-jobs/${encodeURIComponent(jobId)}/apply`); setApplied(prev => new Set(prev).add(jobId)); toast.success('Application submitted'); const url = new URL(window.location.href); url.searchParams.delete('auto_apply_manual'); window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash) }
    catch (error: any) { if (error?.response?.status === 409) { setApplied(prev => new Set(prev).add(jobId)); toast.success('You have already applied for this job') } else toast.error(error?.response?.data?.detail || 'Application could not be submitted') }
    finally { setApplying(null) }
  }, [slug])
  useEffect(() => { const pendingId = params.get('auto_apply_manual'); if (!pendingId || authLoading || !isAuthenticated || autoApplied.current) return; autoApplied.current = true; void applyManual(pendingId) }, [params, authLoading, isAuthenticated, applyManual])
  const onApply = (job: Job) => {
    if (job.source === 'manual') {
      if (applied.has(job.id)) return
      if (typeof window === 'undefined' || !localStorage.getItem('access_token')) { const returnPath = `/job-fairs/${encodeURIComponent(slug)}?auto_apply_manual=${encodeURIComponent(job.id)}`; try { localStorage.setItem('pending_job_fair_application', JSON.stringify({ slug, jobId: job.id, createdAt: Date.now() })) } catch {} router.push(buildAuthPath('/auth/login', { type: 'student', redirect: returnPath })); return }
      void applyManual(job.id); return
    }
    const path = getJobDetailPath({ id: job.id, slug: job.slug, title: job.title, company_name: job.company_name })
    const returnPath = prepareGuestApplyForLogin(job.id, path)
    router.push(isAuthenticated ? returnPath : buildAuthPath('/auth/login', { type: 'student', redirect: returnPath }))
  }
  const onRegister = useCallback(async () => {
    if (typeof window === 'undefined' || !localStorage.getItem('access_token')) {
      const returnPath = `/job-fairs/${encodeURIComponent(slug)}?auto_register=1`
      router.push(buildAuthPath('/auth/login', { type: 'student', redirect: returnPath }))
      return
    }
    if (registering) return
    setRegistering(true)
    try {
      const { data } = await apiClient.client.post(`${API}/${encodeURIComponent(slug)}/register`)
      toast.success(data.already_registered ? 'You are already registered for this Job Fair' : 'You are registered for this Job Fair')
      const destination = safeHref(fair?.content.cta_url)
      if (destination) window.location.assign(destination)
    } catch (error: any) {
      if (error?.response?.status === 401) {
        const returnPath = `/job-fairs/${encodeURIComponent(slug)}?auto_register=1`
        router.push(buildAuthPath('/auth/login', { type: 'student', redirect: returnPath }))
      } else toast.error(error?.response?.data?.detail || 'Job Fair registration could not be completed')
    } finally { setRegistering(false) }
  }, [fair?.content.cta_url, registering, router, slug])
  useEffect(() => {
    if (params.get('auto_register') !== '1' || authLoading || !isAuthenticated || autoRegistered.current) return
    autoRegistered.current = true
    const url = new URL(window.location.href)
    url.searchParams.delete('auto_register')
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
    void onRegister()
  }, [params, authLoading, isAuthenticated, onRegister])
  const c = fair?.content || ({} as FairContent)
  const filteredJobs = useMemo(() => (fair?.jobs || []).filter(job => (source === 'all' || job.source === source) && `${job.title} ${job.company_name} ${job.location || ''}`.toLowerCase().includes(query.trim().toLowerCase())), [fair?.jobs, source, query])
  const highlights = items(c.highlights)
  const partners = items(c.partners)
  const testimonials = items(c.testimonials)
  const gallery = items(c.gallery)
  if (loading) return <Layout><main className="mx-auto max-w-7xl space-y-6 px-4 py-10"><div className="h-[420px] animate-pulse rounded-[2rem] bg-teal-50 motion-reduce:animate-none"/><div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2].map(index => <div key={index} className="h-24 animate-pulse rounded-2xl bg-white motion-reduce:animate-none"/>)}</div></main></Layout>
  if (!fair) return <Layout><main className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-4 text-center"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-teal-50 text-teal-800"><Briefcase className="h-8 w-8"/></div><h1 className="mt-5 text-3xl font-bold">{loadError === 'failed' ? 'Job Fair could not be loaded' : 'Job Fair not found'}</h1><p className="mt-2 text-slate-600">{loadError === 'failed' ? 'Check your connection and try again.' : 'This event may have ended or its page is unavailable.'}</p><div className="mt-6 flex gap-3">{loadError === 'failed' && <button type="button" onClick={() => void load()} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">Try again</button>}<Link className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:border-teal-600 hover:text-teal-800" href="/job-fairs">Browse Job Fairs</Link></div></main></Layout>
  const viewJob = fair.jobs?.find(job => job.source === 'manual' && job.id === params.get('view_job'))
  if (viewJob) return <ManualJobDetails fair={fair} job={viewJob} applying={applying === viewJob.id} applied={applied.has(viewJob.id)} onApply={() => onApply(viewJob)} onRegister={() => void onRegister()}/>
  const totalJobs = fair.jobs?.length || 0
  const dishaJobs = (fair.jobs || []).filter(job => job.source === 'disha').length
  const manualJobs = (fair.jobs || []).filter(job => job.source === 'manual').length
  const heroTitle = text(c.hero_heading) || 'HireKarma Mega'
  const heroHighlight = text(c.highlighted_text) || 'Career & Job Fair 2026'
  const stats = [
    ...(totalJobs ? [{ value: String(totalJobs), label: 'Job Opportunities', icon: Briefcase }] : []),
    ...(partners.length ? [{ value: String(partners.length), label: 'Hiring Partners', icon: Users }] : []),
    ...(dishaJobs ? [{ value: String(dishaJobs), label: 'Disha Jobs', icon: Globe2 }] : []),
    ...(manualJobs ? [{ value: String(manualJobs), label: 'Event Listings', icon: Sparkles }] : []),
  ]
  return <Layout fair={fair} onRegister={() => void onRegister()}>
    <main>
      <section id="home" className="relative scroll-mt-16 overflow-hidden bg-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_4%_20%,#e8faf1_0,transparent_32%),radial-gradient(ellipse_at_92%_10%,#fff6d7_0,transparent_26%)]"/>
        <div className="relative mx-auto grid max-w-[1320px] items-center gap-3 px-4 pb-8 pt-7 sm:px-6 sm:pb-10 lg:grid-cols-[.94fr_1.06fr] lg:gap-5 lg:px-8 lg:pb-8 lg:pt-5">
          <div className="relative z-10"><h1 className="mt-3 max-w-[570px] font-[var(--font-sora)] text-[2.45rem] font-extrabold leading-[1.02] tracking-[-.045em] text-[#101b30] sm:text-[3.2rem] lg:text-[3.35rem]">{heroTitle}<br/><span className="text-slate-950">{heroHighlight}</span></h1><p className="mt-2 text-sm font-semibold text-slate-800">{text(c.subtitle) || 'Your next opportunity is closer than you think.'}</p><RichTextBlock value={text(c.short_description) || 'Meet top employers, attend expert sessions, and take a big step toward your dream career.'} className="mt-1 max-w-[440px] text-[12px] leading-[1.45] text-slate-600"/>
            {stats.length > 0 && <div className="mt-4 grid max-w-[490px] grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">{stats.map(({ value, label, icon: Icon }) => <div key={label} className="flex min-w-0 items-center gap-2"><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${JF_META_ICON_BG}`}><Icon className="h-3.5 w-3.5"/></span><span className="min-w-0"><strong className="block text-[12px] leading-4 text-slate-900">{value}</strong><small className="block truncate text-[9px] leading-3 text-slate-500">{label}</small></span></div>)}</div>}
          </div><JobVisual fair={fair} jobsCount={totalJobs}/>
        </div>
      </section>
      <EventInfo fair={fair} onRegister={() => void onRegister()}/>
      <ChiefGuestSection content={c}/>
      <div className="mx-auto max-w-[1320px] space-y-8 px-4 pb-12 pt-7 sm:px-6 lg:space-y-9 lg:px-8">
        {c.description && <section aria-labelledby="about-event-heading" className="mx-auto w-full rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-sm"><h2 id="about-event-heading" className="text-base font-bold text-teal-900">About the event</h2><RichTextBlock value={c.description} className="mt-3 border-t border-slate-100 pt-3 text-sm leading-6 text-slate-700"/></section>}
        <section id="jobs" className="scroll-mt-20">
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary-700">Featured Jobs</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-[#101b30] sm:text-[30px]">Explore Job Opportunities</h2><p className="mt-1 max-w-2xl text-[11px] leading-5 text-slate-600">Discover exciting job openings from companies participating in the fair.</p></div>{fair.jobs?.length > 0 && <div className="flex flex-col gap-3 sm:flex-row"><label className="relative"><span className="sr-only">Search jobs</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search job title, company…" className="h-9 w-full rounded-full border border-slate-200 bg-white px-3.5 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:w-56"/></label><label className="relative"><span className="sr-only">Filter jobs by source</span><select value={source} onChange={event => setSource(event.target.value as 'all' | 'manual' | 'disha')} className="h-9 w-full appearance-none rounded-full border border-slate-200 bg-white pl-8 pr-7 text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:w-28"><option value="all">All Filters</option><option value="disha">Disha jobs</option><option value="manual">Event jobs</option></select><ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"/></label></div>}</div>
          {filteredJobs.length ? <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">{filteredJobs.map(job => <JobCard key={`${job.source}-${job.id}`} job={job} fairSlug={slug} onApply={onApply} applying={applying === job.id} applied={applied.has(job.id)}/>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#fff8df] text-amber-800"><Briefcase className="h-7 w-7"/></div><h3 className="mt-4 text-lg font-semibold">{fair.jobs?.length ? 'No jobs match your search' : 'Opportunities are on the way'}</h3><p className="mt-2 text-sm text-slate-500">{fair.jobs?.length ? 'Try a different search or filter.' : 'There are no associated jobs for this fair yet.'}</p></div>}
        </section>
        <Highlights fair={fair} highlights={highlights}/>
        <Partners partners={partners}/>
        <Testimonials testimonials={testimonials}/>
        <Gallery gallery={gallery} content={c}/>
      </div>
      <RegistrationBanner fair={fair} onRegister={() => void onRegister()}/>
    </main>
  </Layout>
}
