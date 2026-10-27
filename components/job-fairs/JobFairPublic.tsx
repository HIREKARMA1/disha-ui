'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowUpRight, Briefcase, CalendarDays, Loader2, MapPin } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { getJobDetailPath } from '@/lib/jobSlug'
import { prepareGuestApplyForLogin } from '@/lib/pendingJobApplication'
import { buildAuthPath } from '@/lib/authLinks'
import { useAuth } from '@/hooks/useAuth'
import { DishaTopBar } from '@/components/ui/DishaTopBar'
import { Footer } from '@/components/ui/footer'
import { toast } from 'react-hot-toast'

type Job = { id: string; source: 'manual' | 'disha'; title: string; company_name: string; company_logo?: string; location?: string; job_type?: string; compensation?: string; salary_min?: string; salary_max?: string; experience_min?: number; experience_max?: number; slug?: string; description?: string; responsibilities?: string; requirements?: string; skills?: string[]; vacancies?: number; application_deadline?: string }
type Fair = { id: string; slug: string; title: string; content: Record<string, any>; jobs: Job[] }
const API = '/job-fairs/public'

function safeExternalUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null } catch { return null }
}

function safeHref(value: unknown): string | null {
  if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\')) return value
  return safeExternalUrl(value)
}

function FairSection({ sectionKey, items }: { sectionKey: string; items: any }) {
  if (!Array.isArray(items) || items.length === 0) return null
  const title = sectionKey.replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())
  return <section className="rounded-2xl bg-white p-6 shadow-sm">
    <h2 className="mb-5 text-2xl font-bold">{title}</h2>
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item: any, index: number) => {
        const media = safeExternalUrl(item.image || item.image_url || item.logo || item.photo)
        const website = safeExternalUrl(item.website)
        return <article key={item.id || item.name || item.title || index} className="rounded-xl border p-4">
          {media && <img className="mb-3 max-h-48 w-full rounded-lg object-contain" src={media} alt={item.alt || item.caption || item.title || item.name || ''}/>}
          <h3 className="font-semibold">{item.title || item.name || item.company_name || item.person || ''}</h3>
          {(item.role || item.category) && <p className="text-sm text-gray-500">{item.role || item.category}</p>}
          {item.company_name && item.person && <p className="text-sm text-gray-500">{item.company_name}</p>}
          {(item.description || item.feedback) && <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">{item.description || item.feedback}</p>}
          {website && <a className="mt-2 inline-block text-sm text-indigo-700 underline" href={website} target="_blank" rel="noreferrer">Website</a>}
        </article>
      })}
    </div>
  </section>
}

function Shell({ children }: { children: React.ReactNode }) { return <div className="min-h-screen bg-slate-50"><DishaTopBar showSearch={false}/>{children}<Footer/></div> }

export function JobFairListing() {
  const [fairs, setFairs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { apiClient.client.get(API).then(({ data }) => setFairs(data.job_fairs || [])).catch(() => toast.error('Could not load Job Fairs')).finally(() => setLoading(false)) }, [])
  return <Shell><main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-12"><p className="font-semibold uppercase tracking-widest text-indigo-600">Disha by HireKarma</p><h1 className="mt-2 text-4xl font-bold">Job Fairs</h1><p className="mt-3 max-w-2xl text-gray-600">Explore career events and opportunities from participating organizations.</p>{loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin"/></div> : fairs.length ? <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{fairs.map(fair => { const image = safeExternalUrl(fair.hero_image); return <Link key={fair.id} href={`/job-fairs/${fair.slug}`} className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">{image && <img src={image} alt="" className="h-48 w-full object-cover"/>}<div className="p-5"><h2 className="text-xl font-semibold group-hover:text-indigo-700">{fair.title}</h2><p className="mt-2 line-clamp-3 text-sm text-gray-600">{fair.short_description || 'Explore participating organizations and open positions.'}</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-indigo-700">View Job Fair <ArrowUpRight className="h-4 w-4"/></span></div></Link>})}</div> : <p className="mt-8 rounded-xl border bg-white p-8 text-center text-gray-500">No published Job Fairs right now.</p>}</main></Shell>
}

export function JobFairDetails({ slug }: { slug: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const previewId = params.get('preview') === '1' ? params.get('id') : null
  const [fair, setFair] = useState<Fair | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState<string | null>(null)
  const [applied, setApplied] = useState<Set<string>>(new Set())
  const autoApplied = useRef(false)
  const load = useCallback(() => apiClient.client.get(previewId ? `/job-fairs/admin/${encodeURIComponent(previewId)}` : `${API}/${encodeURIComponent(slug)}`).then(({ data }) => setFair(data)).catch(() => setFair(null)).finally(() => setLoading(false)), [slug, previewId])
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
  const c = fair?.content || {}
  const sectionKeys = ['highlights', 'partners', 'testimonials', 'gallery', 'additional_sections']
  if (loading) return <Shell><div className="flex min-h-[70vh] justify-center py-24"><Loader2 className="h-8 w-8 animate-spin"/></div></Shell>
  if (!fair) return <Shell><div className="mx-auto min-h-[65vh] max-w-3xl p-12 text-center"><h1 className="text-2xl font-bold">Job Fair not found</h1><Link className="mt-4 inline-block text-indigo-700 underline" href="/job-fairs">Browse Job Fairs</Link></div></Shell>
  return <Shell><main className="mx-auto max-w-7xl px-4 py-8"><div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]"><div className="min-w-0 space-y-8">
    {safeExternalUrl(c.hero_image) && <img src={safeExternalUrl(c.hero_image)!} alt="" className="max-h-[460px] w-full rounded-3xl object-cover"/>}
    <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-700 p-8 text-white md:p-12">{safeExternalUrl(c.logo) && <img src={safeExternalUrl(c.logo)!} alt="" className="mb-5 h-14 max-w-48 rounded bg-white p-2 object-contain"/>}<p className="text-sm font-semibold uppercase tracking-[.2em] text-indigo-200">{c.organizer_name || 'Disha Job Fair'}</p><h1 className="mt-4 max-w-3xl text-4xl font-bold md:text-5xl">{c.hero_heading || fair.title} {c.highlighted_text && <span className="text-cyan-300">{c.highlighted_text}</span>}</h1>{c.subtitle && <p className="mt-4 text-xl text-indigo-100">{c.subtitle}</p>}<p className="mt-4 max-w-3xl whitespace-pre-wrap text-indigo-100">{c.short_description}</p><div className="mt-6 flex flex-wrap gap-4 text-sm text-indigo-100">{c.date_time && <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4"/>{c.date_time}</span>}{c.location && <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4"/>{c.location}</span>}</div>{(c.registration_start || c.registration_end) && <p className="mt-3 text-sm text-indigo-100">Registration: {c.registration_start || 'Open'} – {c.registration_end || 'Event day'}</p>}{c.statistics && <p className="mt-3 text-sm font-semibold text-cyan-200">{c.statistics}</p>}{safeHref(c.cta_url) && <a className="mt-7 inline-flex rounded-lg bg-white px-5 py-3 font-semibold text-indigo-900" href={safeHref(c.cta_url)!}>{c.cta_label || 'Learn more'}</a>}</section>
    {c.description && <section className="rounded-2xl bg-white p-6 shadow-sm"><h2 className="mb-3 text-2xl font-bold">About this Job Fair</h2><p className="whitespace-pre-wrap text-gray-700">{c.description}</p></section>}
    {sectionKeys.map(key => <FairSection key={key} sectionKey={key} items={c[key]} />)}
    </div><aside className="sticky top-24 rounded-2xl border bg-white p-5 shadow-lg"><h2 className="text-xl font-bold">Open opportunities</h2><p className="mt-1 text-sm text-gray-500">{fair.jobs?.length || 0} associated jobs</p><div className="mt-4 max-h-[75vh] space-y-3 overflow-y-auto">{fair.jobs?.map(job => { const logo = safeExternalUrl(job.company_logo); return <article key={`${job.source}-${job.id}`} className="rounded-xl border p-4"><div className="flex items-start gap-3">{logo ? <img src={logo} alt="" className="h-10 w-10 rounded-lg object-contain"/> : <div className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-50 text-indigo-700"><Briefcase className="h-5 w-5"/></div>}<div><h3 className="font-semibold">{job.title}</h3><p className="text-sm text-gray-600">{job.company_name}</p></div></div><div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">{job.location && <span>{job.location}</span>}{job.job_type && <span>· {job.job_type}</span>}{job.experience_min != null && <span>· {job.experience_min}-{job.experience_max ?? job.experience_min} yrs</span>}{job.compensation && <span>· {job.compensation}</span>}{job.salary_min && <span>· Salary {job.salary_min}{job.salary_max && `–${job.salary_max}`}</span>}{job.vacancies != null && <span>· {job.vacancies} vacancies</span>}{job.application_deadline && <span>· Apply by {new Date(job.application_deadline).toLocaleDateString()}</span>}</div>{job.source === 'manual' && (job.description || job.requirements || job.responsibilities || job.skills?.length) && <details className="mt-3 text-sm"><summary className="cursor-pointer font-medium text-indigo-700">Job details</summary><div className="mt-2 space-y-2 text-gray-600">{job.description && <p className="whitespace-pre-wrap">{job.description}</p>}{job.responsibilities && <p><strong>Responsibilities:</strong> {job.responsibilities}</p>}{job.requirements && <p><strong>Requirements:</strong> {job.requirements}</p>}{job.skills?.length ? <p><strong>Skills:</strong> {job.skills.join(', ')}</p> : null}</div></details>}<button type="button" disabled={applying === job.id || applied.has(job.id)} onClick={() => onApply(job)} className="mt-4 w-full rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55">{applying === job.id ? 'Applying…' : applied.has(job.id) ? 'Applied' : 'Apply'}</button><span className="mt-2 block text-[11px] text-gray-400">{job.source === 'manual' ? 'Job Fair application' : 'Disha job application'}</span></article>})}</div></aside></div></main></Shell>
}
