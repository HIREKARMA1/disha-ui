'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowDown, ArrowRight, ArrowUpRight, Briefcase, CalendarDays, Check, ChevronDown, Globe2, MapPin, Menu, Quote, Sparkles, Users, X } from 'lucide-react'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { DishaAuthActions } from '@/components/ui/DishaAuthActions'
import { apiClient } from '@/lib/api'
import { getJobDetailPath } from '@/lib/jobSlug'
import { prepareGuestApplyForLogin } from '@/lib/pendingJobApplication'
import { buildAuthPath } from '@/lib/authLinks'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'

type JsonItem = Record<string, unknown>
type Job = {
  id: string; source: 'manual' | 'disha'; title: string; company_name: string; company_logo?: string
  location?: string; job_type?: string; compensation?: string; salary_min?: string; salary_max?: string
  experience_min?: number; experience_max?: number; slug?: string; description?: string
  responsibilities?: string; requirements?: string; skills?: string[]; vacancies?: number; application_deadline?: string
}
type FairContent = Record<string, unknown> & {
  hero_heading?: string; highlighted_text?: string; subtitle?: string; short_description?: string; description?: string
  hero_image?: string; logo?: string; organizer_name?: string; date_time?: string; location?: string; mode?: string
  registration_start?: string; registration_end?: string; contact_email?: string; contact_phone?: string
  cta_label?: string; cta_url?: string; statistics?: string; highlights?: JsonItem[]; partners?: JsonItem[]
  testimonials?: JsonItem[]; gallery?: JsonItem[]; additional_sections?: JsonItem[]
}
type Fair = { id: string; slug: string; title: string; content: FairContent; jobs: Job[]; published?: boolean }
type ListingFair = { id: string; slug: string; title: string; short_description?: string; hero_image?: string }
const API = '/job-fairs/public'

function text(value: unknown): string { return typeof value === 'string' ? value : value == null ? '' : String(value) }
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
  if (src && !failed) return <img src={src} alt={`${name} logo`} onError={() => setFailed(true)} className="h-full w-full object-contain p-2"/>
  return textFallback ? <span aria-hidden="true">{initials(name)}</span> : <Briefcase className="h-6 w-6" aria-hidden="true"/>
}

function EventHeader({ fair, sections = true }: { fair?: Fair; sections?: boolean }) {
  const [open, setOpen] = useState(false)
  const c = fair?.content
  const links = sections ? [
    ['Home', '#home'], ['Jobs', '#jobs'],
    ...(items(c?.highlights).length || items(c?.additional_sections).length ? [['Programs', '#programs']] : []),
    ...(items(c?.partners).length ? [['Partners', '#partners']] : []),
    ...(items(c?.testimonials).length ? [['Testimonials', '#testimonials']] : []),
    ...(items(c?.gallery).length ? [['Gallery', '#gallery']] : []),
  ] : [['Job Fairs', '/job-fairs']]
  const cta = safeHref(c?.cta_url) || (sections ? '#jobs' : '/job-fairs')
  const brand = safeExternalUrl(c?.logo)
  return <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
    <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">{brand ? <Link href="/job-fairs" aria-label="Job Fair home"><img src={brand} alt={fair?.title || 'Event logo'} className="h-10 max-w-36 object-contain"/></Link> : <BrandLogo href="/job-fairs" compact priority/>}{fair && <span className="hidden h-7 w-px bg-slate-200 sm:block"/>}<span className="hidden max-w-40 truncate text-sm font-semibold text-slate-700 sm:block">{fair?.title || 'Career events'}</span></div>
      <nav className="hidden items-center gap-7 lg:flex" aria-label="Event navigation">{links.map(([label, href]) => <a key={href} href={href} className="text-sm font-medium text-slate-600 transition-colors hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">{label}</a>)}</nav>
      <div className="flex items-center gap-2"><div className="hidden sm:block"><DishaAuthActions/></div><a href={cta} className="hidden rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 sm:inline-flex">{c?.cta_label || (sections ? 'Explore jobs' : 'Explore events')}<ArrowUpRight className="ml-2 h-4 w-4"/></a><button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 lg:hidden" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => setOpen(value => !value)}>{open ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}</button></div>
    </div>
    {open && <nav className="border-t border-slate-100 bg-white px-4 py-3 shadow-lg lg:hidden" aria-label="Mobile event navigation"><div className="mx-auto grid max-w-7xl gap-1">{links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">{label}</a>)}<a href={cta} onClick={() => setOpen(false)} className="mt-1 rounded-lg bg-slate-950 px-3 py-3 text-sm font-semibold text-white">{c?.cta_label || 'Explore jobs'}<ArrowUpRight className="ml-2 inline h-4 w-4"/></a><div className="mt-2 border-t border-slate-100 pt-2"><DishaAuthActions/></div></div></nav>}
  </header>
}

function PageFooter({ fair }: { fair?: Fair }) {
  const c = fair?.content
  const email = text(c?.contact_email)
  const phone = text(c?.contact_phone)
  const socials = c?.social_links && typeof c.social_links === 'object' ? c.social_links as Record<string, unknown> : {}
  const socialLinks = [['LinkedIn', socials.linkedin], ['Instagram', socials.instagram], ['Facebook', socials.facebook], ['X', socials.x]]
    .map(([label, value]) => [String(label), safeExternalUrl(value)] as const).filter(([, href]) => href)
  return <footer className="border-t border-slate-200 bg-white">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
      <div><BrandLogo href="/job-fairs" compact/><p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">{fair ? `Explore opportunities and meet the organizations participating in ${fair.title}.` : 'Discover career fairs and opportunities from participating organizations.'}</p></div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">{fair && <Link href={`/job-fairs/${fair.slug}#jobs`} className="text-slate-600 hover:text-teal-700">Open jobs</Link>}<Link href="/job-fairs" className="text-slate-600 hover:text-teal-700">All Job Fairs</Link>{email && <a href={`mailto:${email}`} className="text-slate-600 hover:text-teal-700">{email}</a>}{phone && <a href={`tel:${phone}`} className="text-slate-600 hover:text-teal-700">{phone}</a>}{socialLinks.map(([label, href]) => <a key={label} href={href!} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-teal-700">{label}</a>)}</div>
    </div>
    <div className="border-t border-slate-100"><p className="mx-auto max-w-7xl px-4 py-4 text-xs text-slate-400 sm:px-6 lg:px-8">© {new Date().getFullYear()} HireKarma · {fair?.title || 'Career events'}</p></div>
  </footer>
}

function Layout({ children, fair, sections = true }: { children: React.ReactNode; fair?: Fair; sections?: boolean }) {
  return <div className="min-h-screen bg-[#fbfbf8] text-slate-950 motion-safe:scroll-smooth"><EventHeader fair={fair} sections={sections}/>{children}<PageFooter fair={fair}/></div>
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return <div className="mx-auto mb-6 max-w-2xl text-center sm:mb-8"><div className="mx-auto mb-4 flex w-16 items-center gap-1.5" aria-hidden="true"><span className="h-1 flex-1 rounded-full bg-teal-400"/><span className="h-1 w-5 rounded-full bg-amber-300"/></div>{eyebrow && <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-700">{eyebrow}</p>}<h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h2>{subtitle && <p className="mt-3 text-base leading-7 text-slate-600">{subtitle}</p>}</div>
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
      {loading ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map(index => <div key={index} className="h-72 animate-pulse rounded-2xl bg-slate-200 motion-reduce:animate-none"/>)}</div> : loadFailed ? <div className="rounded-2xl border border-amber-200 bg-white px-6 py-14 text-center"><h3 className="text-lg font-semibold">Job Fairs could not be loaded</h3><p className="mt-2 text-sm text-slate-500">Check your connection and try again.</p><button type="button" onClick={() => void loadFairs()} className="mt-5 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">Try again</button></div> : fairs.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{fairs.map((fair, index) => { const image = safeExternalUrl(fair.hero_image); const tints = ['bg-[#f0faf3]', 'bg-[#fff9e8]', 'bg-[#f5f2ff]']; return <Link key={fair.id} href={`/job-fairs/${fair.slug}`} className={`group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${tints[index % tints.length]}`}><div className="relative h-48 overflow-hidden">{image ? <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/> : <div className="grid h-full place-items-center"><div className="grid h-24 w-24 place-items-center rounded-3xl bg-white/90 text-teal-700 shadow-sm"><Briefcase className="h-10 w-10"/></div></div>}<span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-teal-800">Career Expo</span></div><div className="p-5"><h3 className="text-xl font-bold group-hover:text-teal-800">{fair.title}</h3><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{fair.short_description || 'Explore participating organizations and open positions.'}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-800">Explore event<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1"/></span></div></Link>})}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Briefcase className="h-7 w-7"/></div><h3 className="mt-4 text-lg font-semibold">No published Job Fairs right now</h3><p className="mt-2 text-sm text-slate-500">Check back soon for new career events.</p></div>}
    </section>
  </main></Layout>
}

function JobVisual({ fair, jobsCount }: { fair: Fair; jobsCount: number }) {
  const image = safeExternalUrl(fair.content.hero_image)
  const [imageFailed, setImageFailed] = useState(false)
  if (image && !imageFailed) return <div className="relative mx-auto w-full max-w-xl"><div className="absolute -right-5 -top-5 h-24 w-24 rounded-full border-[14px] border-amber-200/70"/><div className="absolute -bottom-5 -left-4 h-16 w-16 rounded-full bg-teal-200/70"/><div className="relative overflow-hidden rounded-[2rem] border-[10px] border-white bg-white shadow-[0_28px_70px_-30px_rgba(15,23,42,.42)]"><img src={image} alt={fair.title} onError={() => setImageFailed(true)} className="max-h-[430px] min-h-[290px] w-full object-cover"/><div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur"><span className="text-sm font-semibold text-slate-800">{fair.title}</span><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">{jobsCount} open {jobsCount === 1 ? 'role' : 'roles'}</span></div></div></div>
  return <div className="relative mx-auto flex min-h-[330px] w-full max-w-xl items-center justify-center sm:min-h-[410px]" aria-hidden="true"><div className="absolute inset-5 rounded-[3rem] bg-gradient-to-br from-[#e3f8eb] via-[#fff8df] to-[#eeeaff]"/><div className="absolute right-[9%] top-[9%] h-16 w-16 rounded-full border-[10px] border-amber-300/80"/><div className="absolute bottom-[14%] left-[5%] h-9 w-9 rounded-full border-4 border-teal-300"/><div className="absolute left-[12%] top-[20%] h-4 w-24 rotate-[-28deg] rounded-full bg-rose-200"/><div className="relative grid w-[78%] grid-cols-3 gap-3 sm:gap-4"><div className="col-span-3 flex min-h-52 flex-col items-center justify-center rounded-[2rem] border border-white/80 bg-white/75 p-6 text-center shadow-xl backdrop-blur-sm"><div className="grid h-20 w-20 place-items-center rounded-[1.6rem] bg-teal-100 text-teal-800"><Briefcase className="h-10 w-10"/></div><p className="mt-4 text-xs font-bold uppercase tracking-[.22em] text-teal-800">Career Expo</p><p className="mt-1 max-w-xs text-xl font-bold text-slate-900">Discover your next opportunity</p></div><div className="flex h-20 items-center justify-center rounded-2xl bg-[#fff6d9] text-amber-700 shadow-sm"><Users className="h-8 w-8"/></div><div className="flex h-20 items-center justify-center rounded-2xl bg-[#e7f8ef] text-emerald-700 shadow-sm"><Sparkles className="h-8 w-8"/></div><div className="flex h-20 items-center justify-center rounded-2xl bg-[#eeeaff] text-violet-700 shadow-sm"><Briefcase className="h-8 w-8"/></div></div>{jobsCount > 0 && <div className="absolute bottom-[7%] right-[3%] rounded-2xl bg-slate-950 px-4 py-3 text-white shadow-xl"><span className="block text-xl font-bold">{jobsCount}</span><span className="text-xs text-slate-300">open {jobsCount === 1 ? 'role' : 'roles'}</span></div>}</div>
}

function InfoPill({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-800"><Icon className="h-5 w-5"/></span><span className="min-w-0"><span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</span><span className="block truncate text-sm font-semibold text-slate-800">{value}</span></span></div>
}

function MissingImage({ children }: { children: React.ReactNode }) {
  const [failed, setFailed] = useState(false)
  return failed ? <>{children}</> : null
}

function JobCard({ job, onApply, applying, applied }: { job: Job; onApply: (job: Job) => void; applying: boolean; applied: boolean }) {
  const logo = safeExternalUrl(job.company_logo)
  const detailPath = job.source === 'disha' ? getJobDetailPath({ id: job.id, slug: job.slug, title: job.title, company_name: job.company_name }) : null
  return <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg">
    <div className="flex items-start gap-3"><div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#f0faf3] text-teal-800"><LogoImage src={logo} name={job.company_name}/></div><div className="min-w-0"><p className="text-xs font-semibold text-teal-800">{job.company_name}</p><h3 className="mt-1 text-lg font-bold leading-snug text-slate-950">{job.title}</h3></div></div>
    <div className="mt-4 flex flex-wrap gap-2">{job.location && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{job.location}</span>}{job.job_type && <span className="rounded-full bg-[#fff8e4] px-3 py-1 text-xs text-amber-900">{job.job_type.replace(/_/g, ' ')}</span>}{job.experience_min != null && <span className="rounded-full bg-[#f3f0ff] px-3 py-1 text-xs text-violet-800">{job.experience_min}–{job.experience_max ?? job.experience_min} yrs</span>}</div>
    {(job.compensation || job.salary_min || job.application_deadline) && <div className="mt-4 space-y-1 text-sm text-slate-600">{(job.compensation || job.salary_min) && <p className="font-semibold text-slate-800">{job.compensation || `₹${job.salary_min}${job.salary_max ? ` – ₹${job.salary_max}` : '+'}`}</p>}{job.application_deadline && <p className="text-xs text-slate-500">Apply by {new Date(job.application_deadline).toLocaleDateString()}</p>}</div>}
    {job.source === 'manual' && (job.description || job.requirements || job.responsibilities || job.skills?.length) && <details className="mt-4 rounded-xl bg-slate-50 p-3 text-sm"><summary className="cursor-pointer font-semibold text-teal-800">View job details</summary><div className="mt-3 space-y-2 leading-6 text-slate-600">{job.description && <p className="whitespace-pre-wrap">{job.description}</p>}{job.responsibilities && <p><strong>Responsibilities:</strong> {job.responsibilities}</p>}{job.requirements && <p><strong>Requirements:</strong> {job.requirements}</p>}{job.skills?.length ? <p><strong>Skills:</strong> {job.skills.join(', ')}</p> : null}</div></details>}
    <div className="mt-auto flex gap-2 pt-5">{detailPath && <Link href={detailPath} className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-600 hover:text-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">View details</Link>}<button type="button" disabled={applying || applied} onClick={() => onApply(job)} className="inline-flex flex-1 items-center justify-center rounded-xl bg-slate-950 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">{applying ? 'Applying…' : applied ? <><Check className="mr-2 h-4 w-4"/>Applied</> : 'Apply now'}</button></div>
    <p className="mt-3 text-center text-[11px] text-slate-400">{job.source === 'manual' ? 'Job Fair application' : 'Disha job application'}</p>
  </article>
}

function Highlights({ fair, highlights }: { fair: Fair; highlights: JsonItem[] }) {
  const additions = items(fair.content.additional_sections)
  if (!highlights.length && !additions.length) return null
  const highlightsGrid = highlights.length === 1 ? 'mx-auto grid max-w-md grid-cols-1 gap-4' : highlights.length === 2 ? 'mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2' : 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'
  return <section id="programs" className="scroll-mt-24 rounded-[2rem] bg-[#fffdf5] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12"><SectionHeading eyebrow="Explore the experience" title={text(fair.content.hero_heading) ? `Programs at ${fair.title}` : 'Programs in the Job Fair'} subtitle={text(fair.content.description) || text(fair.content.subtitle)}/>{highlights.length > 0 && <div className={highlightsGrid}>{highlights.map((item, index) => { const colors = ['bg-[#fff8df]', 'bg-[#eaf9ef]', 'bg-[#f0edff]', 'bg-[#e8f8fb]']; const media = safeExternalUrl(item.image || item.image_url || item.icon_url); const website = safeExternalUrl(item.website); return <article key={text(item.id) || `${text(item.title)}-${index}`} className={`rounded-[1.5rem] border border-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md ${colors[index % colors.length]}`}>{media ? <img src={media} alt="" className="mb-5 h-28 w-full rounded-xl object-contain"/> : <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-white/80 text-teal-800"><Sparkles className="h-6 w-6"/></div>}<h3 className="text-lg font-bold">{text(item.title || item.name)}</h3>{Boolean(item.role || item.category) && <p className="mt-1 text-sm text-slate-500">{text(item.role || item.category)}</p>}{Boolean(item.description || item.feedback) && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{text(item.description || item.feedback)}</p>}{website && <a href={website} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-sm font-semibold text-teal-800 underline">Learn more</a>}</article>})}</div>}{additions.length > 0 && <div className={`${highlights.length ? 'mt-6 sm:mt-8' : ''} grid gap-4 md:grid-cols-2`}>{additions.map((item, index) => { const media = safeExternalUrl(item.image || item.image_url || item.logo || item.photo); const website = safeExternalUrl(item.website); return <article key={text(item.id) || `additional-${index}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">{media && <img src={media} alt={text(item.alt || item.caption || item.title)} className="mb-4 max-h-48 w-full rounded-xl object-cover"/>}<h3 className="text-xl font-bold">{text(item.title || item.name || item.company_name || item.person)}</h3>{Boolean(item.role || item.category) && <p className="mt-1 text-sm text-slate-500">{text(item.role || item.category)}</p>}{Boolean(item.description || item.feedback) && <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">{text(item.description || item.feedback)}</p>}{website && <a href={website} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-sm font-semibold text-teal-800 underline">Website</a>}</article>})}</div>}</section>
}

function Partners({ partners }: { partners: JsonItem[] }) {
  if (!partners.length) return null
  const gridClass = partners.length === 1 ? 'mx-auto grid max-w-sm grid-cols-1 gap-4' : partners.length === 2 ? 'mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2' : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
  return <section id="partners" className="scroll-mt-24"><SectionHeading eyebrow="Together we go further" title="Event Partners" subtitle="Meet the organizations supporting this career experience."/><div className={gridClass}>{partners.map((partner, index) => { const name = text(partner.name || partner.title || partner.company_name) || 'Event partner'; const logo = safeExternalUrl(partner.logo || partner.image || partner.image_url); const website = safeExternalUrl(partner.website); const content = <><div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-white text-xl font-bold text-teal-800 shadow-sm"><LogoImage src={logo} name={name} textFallback/></div><div className="mt-5 flex items-center justify-between gap-3"><h3 className="text-lg font-bold">{name}</h3>{website && <ArrowUpRight className="h-4 w-4 shrink-0 text-teal-700"/>}</div>{partner.category && <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-teal-800">{text(partner.category)}</span>}{partner.description && <p className="mt-2 text-sm leading-6 text-slate-600">{text(partner.description)}</p>}</>; return website ? <a key={text(partner.id) || `${name}-${index}`} href={website} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-slate-200 bg-[#f3fbf6] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">{content}</a> : <article key={text(partner.id) || `${name}-${index}`} className="rounded-2xl border border-slate-200 bg-[#f3fbf6] p-5 shadow-sm">{content}</article>})}</div></section>
}

function Testimonials({ testimonials }: { testimonials: JsonItem[] }) {
  if (!testimonials.length) return null
  const gridClass = testimonials.length === 1 ? 'mx-auto grid max-w-2xl grid-cols-1 gap-4' : testimonials.length === 2 ? 'mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2' : 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'
  return <section id="testimonials" className="relative isolate scroll-mt-24 px-5 py-8 before:pointer-events-none before:absolute before:inset-y-0 before:left-1/2 before:-z-10 before:w-screen before:-translate-x-1/2 before:bg-[#effaf3] sm:px-8 sm:py-10 lg:px-12 lg:py-12"><SectionHeading eyebrow="Attendee stories" title="What Past Attendees Say" subtitle="Experiences shared by people who have been part of the event."/><div className={gridClass}>{testimonials.map((item, index) => { const person = text(item.person || item.name || item.title); const photo = safeExternalUrl(item.photo || item.image || item.image_url); return <article key={text(item.id) || `${person}-${index}`} className="relative rounded-2xl border border-white bg-white p-5 shadow-sm sm:p-6"><Quote className="absolute right-5 top-5 h-8 w-8 text-teal-100"/><p className="relative pr-8 text-base leading-7 text-slate-700">{text(item.feedback || item.description)}</p><div className="mt-5 flex items-center gap-3">{photo ? <img src={photo} alt={person} className="h-11 w-11 rounded-full object-cover"/> : <div className="grid h-11 w-11 place-items-center rounded-full bg-[#fff4c8] text-sm font-bold text-amber-900">{initials(person)}</div>}<div><p className="font-bold text-slate-950">{person}</p><p className="text-sm text-slate-500">{[text(item.role || item.category), text(item.company_name)].filter(Boolean).join(' · ')}</p></div></div></article>})}</div></section>
}

function GalleryCard({ item, index }: { item: JsonItem; index: number }) {
  const [failed, setFailed] = useState(false)
  const image = safeExternalUrl(item.image || item.image_url || item.photo)
  const caption = text(item.caption || item.title || item.alt)
  if (!image || failed) return null
  return <figure className={`group relative overflow-hidden rounded-2xl bg-slate-100 ${index % 5 === 0 ? 'sm:row-span-2' : ''}`}><img src={image} alt={caption} loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/>{caption && <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent px-4 pb-4 pt-12 text-sm font-medium text-white">{caption}</figcaption>}</figure>
}

function Gallery({ gallery }: { gallery: JsonItem[] }) {
  if (!gallery.length) return null
  return <section id="gallery" className="scroll-mt-24"><SectionHeading eyebrow="The event experience" title="Moments from the Fair" subtitle="A glimpse of the people, ideas, and opportunities that bring this event together."/><div className="grid auto-rows-[190px] gap-4 sm:grid-cols-2 lg:auto-rows-[230px] lg:grid-cols-3">{gallery.map((item, index) => <GalleryCard key={text(item.id) || `${text(item.image || item.image_url)}-${index}`} item={item} index={index}/>)}</div></section>
}

function EventInfo({ fair, jobsCount }: { fair: Fair; jobsCount: number }) {
  const c = fair.content
  const info: Array<[typeof CalendarDays, string, string]> = [
    [CalendarDays, 'Date & time', text(c.date_time)], [MapPin, 'Location', text(c.location)],
    [Globe2, 'Format', text(c.mode)], [Users, 'Organizer', text(c.organizer_name)],
    [CalendarDays, 'Registration opens', text(c.registration_start)],
    [CalendarDays, 'Registration closes', text(c.registration_end)],
  ] as const
  const available = info.filter(([, , value]) => value)
  if (jobsCount > 0) available.push([Briefcase, 'Open roles', String(jobsCount)])
  if (!available.length) return null
  return <section aria-label="Event information" className="relative z-10 mx-auto -mt-5 grid max-w-7xl gap-3 px-4 sm:grid-cols-2 sm:px-6 lg:-mt-8 lg:grid-cols-3 lg:px-8 xl:grid-cols-4">{available.map(([icon, label, value]) => <InfoPill key={label} icon={icon} label={label} value={value}/>)}</section>
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
  const [applied, setApplied] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [source, setSource] = useState<'all' | 'disha' | 'manual'>('all')
  const autoApplied = useRef(false)
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
  const c = fair?.content || ({} as FairContent)
  const filteredJobs = useMemo(() => (fair?.jobs || []).filter(job => (source === 'all' || job.source === source) && `${job.title} ${job.company_name} ${job.location || ''}`.toLowerCase().includes(query.trim().toLowerCase())), [fair?.jobs, source, query])
  const highlights = items(c.highlights)
  const partners = items(c.partners)
  const testimonials = items(c.testimonials)
  const gallery = items(c.gallery)
  if (loading) return <Layout><main className="mx-auto max-w-7xl space-y-6 px-4 py-10"><div className="h-[420px] animate-pulse rounded-[2rem] bg-teal-50 motion-reduce:animate-none"/><div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2].map(index => <div key={index} className="h-24 animate-pulse rounded-2xl bg-white motion-reduce:animate-none"/>)}</div></main></Layout>
  if (!fair) return <Layout><main className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-4 text-center"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-teal-50 text-teal-800"><Briefcase className="h-8 w-8"/></div><h1 className="mt-5 text-3xl font-bold">{loadError === 'failed' ? 'Job Fair could not be loaded' : 'Job Fair not found'}</h1><p className="mt-2 text-slate-600">{loadError === 'failed' ? 'Check your connection and try again.' : 'This event may have ended or its page is unavailable.'}</p><div className="mt-6 flex gap-3">{loadError === 'failed' && <button type="button" onClick={() => void load()} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">Try again</button>}<Link className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:border-teal-600 hover:text-teal-800" href="/job-fairs">Browse Job Fairs</Link></div></main></Layout>
  return <Layout fair={fair}>
    <main>
      <section id="home" className="relative scroll-mt-20 overflow-hidden bg-[radial-gradient(circle_at_10%_5%,#e8f9ef_0,transparent_35%),radial-gradient(circle_at_95%_5%,#fff3ce_0,transparent_30%),#fbfbf8]">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:grid-cols-[1.02fr_.98fr] lg:gap-10 lg:px-8 lg:py-14">
          <div className="relative z-10"><span className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-teal-800 shadow-sm"><Sparkles className="h-4 w-4"/>Career Expo</span><h1 className="mt-6 max-w-3xl text-[2.7rem] font-extrabold leading-[1.08] tracking-[-.045em] text-slate-950 sm:text-6xl">{text(c.hero_heading) || fair.title}{text(c.highlighted_text) && <span className="text-rose-500"> {text(c.highlighted_text)}</span>}</h1>{c.subtitle && <p className="mt-5 max-w-xl text-xl font-semibold text-slate-700">{text(c.subtitle)}</p>}<p className="mt-3 max-w-xl whitespace-pre-wrap text-base leading-7 text-slate-600">{text(c.short_description) || 'Meet employers, explore open roles, and make your next career move.'}</p>
            <div className="mt-7 flex flex-wrap gap-3"><a href={safeHref(c.cta_url) || '#jobs'} className="inline-flex items-center rounded-full bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2">{text(c.cta_label) || 'Explore jobs'}<ArrowUpRight className="ml-2 h-4 w-4"/></a><a href="#jobs" className="inline-flex items-center rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 transition hover:border-teal-600 hover:text-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2">Browse opportunities<ArrowDown className="ml-2 h-4 w-4"/></a></div>
            {c.statistics && <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#e5f8e9] px-4 py-2 text-sm font-bold text-emerald-900"><Briefcase className="h-4 w-4"/>{text(c.statistics)}</p>}
          </div><JobVisual fair={fair} jobsCount={fair.jobs?.length || 0}/>
        </div>
      </section>
      <EventInfo fair={fair} jobsCount={fair.jobs?.length || 0}/>
      <div className="mx-auto max-w-[1320px] space-y-10 px-4 pb-16 pt-10 sm:px-6 lg:space-y-12 lg:px-8">
        {c.description && <section className="mx-auto max-w-4xl rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">About the event</p><p className="mt-3 whitespace-pre-wrap text-base leading-8 text-slate-700">{text(c.description)}</p></section>}
        <section id="jobs" className="scroll-mt-24">
          <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-teal-700">Make your next move</p><h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Explore open opportunities</h2><p className="mt-3 max-w-2xl leading-7 text-slate-600">Roles from participating employers, ready for you to explore.</p></div>{fair.jobs?.length > 0 && <div className="flex flex-col gap-3 sm:flex-row"><label className="relative"><span className="sr-only">Search jobs</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search title, company, location" className="h-11 w-full rounded-full border border-slate-200 bg-white px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 sm:w-72"/></label><label className="relative"><span className="sr-only">Filter jobs by source</span><select value={source} onChange={event => setSource(event.target.value as 'all' | 'manual' | 'disha')} className="h-11 w-full appearance-none rounded-full border border-slate-200 bg-white px-4 pr-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 sm:w-44"><option value="all">All opportunities</option><option value="disha">Disha jobs</option><option value="manual">Event jobs</option></select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"/></label></div>}</div>
          {filteredJobs.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filteredJobs.map(job => <JobCard key={`${job.source}-${job.id}`} job={job} onApply={onApply} applying={applying === job.id} applied={applied.has(job.id)}/>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#fff8df] text-amber-800"><Briefcase className="h-7 w-7"/></div><h3 className="mt-4 text-lg font-semibold">{fair.jobs?.length ? 'No jobs match your search' : 'Opportunities are on the way'}</h3><p className="mt-2 text-sm text-slate-500">{fair.jobs?.length ? 'Try a different search or filter.' : 'There are no associated jobs for this fair yet.'}</p></div>}
        </section>
        <Highlights fair={fair} highlights={highlights}/>
        <Partners partners={partners}/>
        <Testimonials testimonials={testimonials}/>
        <Gallery gallery={gallery}/>
      </div>
    </main>
  </Layout>
}
