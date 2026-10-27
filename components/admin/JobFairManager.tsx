'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BarChart3, Briefcase, Eye, Pencil, Plus, Save, Search, Trash2, Users } from 'lucide-react'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { EventImageUpload } from '@/components/admin/EventImageUpload'
import { JOB_FAIR_EDITOR_KEY, JobFairContentSections, type JobFairArrayField, type JobFairContentItem, type JobFairSectionState } from '@/components/admin/JobFairContentSections'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { apiClient } from '@/lib/api'
import { stripHtmlToPlainText } from '@/lib/sanitizeHtml'
import { toast } from 'react-hot-toast'

type ManualJob = { id?: string; title: string; company_name: string; company_logo?: string; description?: string; responsibilities?: string; requirements?: string; skills?: string[]; location?: string; job_type?: string; compensation?: string; experience_min?: number | null; experience_max?: number | null; vacancies?: number | null; application_deadline?: string | null }
type JobItem = { id: string; source: 'disha' | 'manual'; title: string; company_name: string; company_logo?: string; slug?: string; location?: string }
type Fair = { id: string; title: string; slug: string; content: Record<string, any>; published: boolean; jobs: JobItem[]; registration_count?: number; manual_application_count?: number }

const arrayFields: JobFairArrayField[] = ['highlights', 'partners', 'testimonials', 'gallery', 'additional_sections']
const textFields: Array<[string, string]> = [
  ['hero_heading', 'Hero heading'], ['highlighted_text', 'Highlighted heading text'], ['subtitle', 'Subtitle'], ['location', 'Location'],
  ['mode', 'Event mode'], ['organizer_name', 'Organizer'], ['contact_email', 'Contact email'], ['contact_phone', 'Contact phone'],
  ['cta_label', 'Primary action label'], ['cta_eyebrow', 'Registration banner eyebrow'], ['cta_heading', 'Registration banner heading'],
  ['cta_description', 'Registration banner description'], ['statistics', 'Statistics (e.g. vacancies)'],
]

type SplitDateTime = { date: string; time: string; zone: string; legacy: boolean }
function splitDateTime(value: unknown): SplitDateTime {
  if (typeof value !== 'string' || !value.trim()) return { date: '', time: '', zone: '', legacy: false }
  const match = value.trim().match(/^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2})(?::\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/)
  if (!match) return { date: '', time: '', zone: '', legacy: true }
  return { date: match[1], time: match[2] || '', zone: match[3] || '', legacy: false }
}

function joinDateTime(date: string, time: string, zone: string) {
  if (!date) return ''
  return `${date}${time ? `T${time}${zone}` : ''}`
}

function DateTimeField({ label, value, onChange }: { label: string; value: unknown; onChange: (value: string) => void }) {
  const parsed = splitDateTime(value)
  const rawValue = typeof value === 'string' ? value : ''
  return <fieldset className="space-y-2 rounded-lg border border-gray-200 p-3">
    <legend className="px-1 text-sm font-semibold text-gray-800">{label}</legend>
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="space-y-1 text-xs font-medium text-gray-700">Date<Input type="date" value={parsed.date} onChange={event => onChange(joinDateTime(event.target.value, parsed.time, parsed.zone))}/></label>
      <label className="space-y-1 text-xs font-medium text-gray-700">Time<Input type="time" value={parsed.time} disabled={!parsed.date} onChange={event => onChange(joinDateTime(parsed.date, event.target.value, parsed.zone))}/></label>
    </div>
    {parsed.legacy && <label className="block space-y-1 text-xs font-medium text-amber-800">Saved date/time text (kept as-is until you choose a date)<Input value={rawValue} onChange={event => onChange(event.target.value)} aria-label={`${label} saved text`}/></label>}
  </fieldset>
}

function datetimeValue(value: unknown) {
  const parsed = splitDateTime(value)
  if (!parsed.date) return null
  const timestamp = Date.parse(`${parsed.date}T${parsed.time || '00:00'}${parsed.zone}`)
  return Number.isNaN(timestamp) ? null : timestamp
}

function readItems(value: unknown, key: string): JobFairContentItem[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object' && !Array.isArray(item)))
    .map(item => ({ ...item, [JOB_FAIR_EDITOR_KEY]: `${key}-${crypto.randomUUID()}` }))
}

function publicUrlIsValid(value: unknown, allowLocalPath = false): boolean {
  if (typeof value !== 'string' || !value.trim()) return true
  if (allowLocalPath && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\')) return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch { return false }
}

export function JobFairList() {
  const [fairs, setFairs] = useState<Fair[]>([])
  const [busy, setBusy] = useState(true)
  const reload = useCallback(async () => {
    try { const { data } = await apiClient.client.get('/job-fairs/admin'); setFairs(data.job_fairs || []) }
    catch { toast.error('Could not load Job Fairs') } finally { setBusy(false) }
  }, [])
  useEffect(() => { void reload() }, [reload])
  const setPublished = async (fair: Fair, action: 'publish' | 'unpublish') => {
    try { await apiClient.client.post(`/job-fairs/admin/${fair.id}/${action}`); toast.success(action === 'publish' ? 'Job Fair published' : 'Job Fair unpublished'); void reload() }
    catch { toast.error('Could not update publication status') }
  }
  return <AdminDashboardLayout><div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-primary-600">Event management</p><h1 className="mt-1 text-2xl font-bold">Job Fairs</h1><p className="text-sm text-gray-500">Create and manage fairs, registrations, and job applications.</p></div><Link href="/dashboard/admin/job-fairs/new"><Button><Plus className="mr-2 h-4 w-4"/>Create Job Fair</Button></Link></header>
    {busy ? <p>Loading…</p> : fairs.length ? <div className="grid gap-4">{fairs.map(fair => { const banner = typeof fair.content?.hero_image === 'string' ? fair.content.hero_image : ''; return <article key={fair.id} className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm"><div className="grid lg:grid-cols-[38%_62%]"><div className="relative aspect-video self-start overflow-hidden bg-gray-100">{banner ? <img src={banner} alt="" className="h-full w-full object-contain"/> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-600 to-teal-500"><Briefcase className="h-10 w-10 text-white/70"/></div>}</div><div className="flex min-w-0 flex-col p-4 md:p-5"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${fair.published ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{fair.published ? 'Published' : 'Draft'}</span><span className="text-xs text-gray-500">/{fair.slug}</span></div><h2 className="mt-2 text-xl font-bold text-gray-900">{fair.title}</h2><p className="mt-1 line-clamp-2 text-sm text-gray-500">{stripHtmlToPlainText(fair.content?.short_description) || stripHtmlToPlainText(fair.content?.subtitle) || 'Manage the public event page and participating opportunities.'}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600"><span className="inline-flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-primary-600"/>{fair.jobs?.length || 0} jobs</span><span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-primary-600"/>{fair.registration_count || 0} registered</span><span className="inline-flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-primary-600"/>{fair.manual_application_count || 0} manual applications</span></div><div className="mt-auto flex flex-wrap gap-2 border-t border-gray-100 pt-4 mt-4"><Link href={`/job-fairs/${fair.slug}`} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm"><Eye className="mr-1.5 h-4 w-4"/>View</Button></Link><Link href={`/dashboard/admin/job-fairs/${fair.id}/edit`}><Button variant="outline" size="sm"><Pencil className="mr-1.5 h-4 w-4"/>Edit</Button></Link><Button variant="outline" size="sm" onClick={() => void setPublished(fair, fair.published ? 'unpublish' : 'publish')}>{fair.published ? 'Unpublish' : 'Publish'}</Button><Link href={`/dashboard/admin/job-fairs/${fair.id}/analytics`}><Button variant="outline" size="sm"><BarChart3 className="mr-1.5 h-4 w-4"/>Analytics</Button></Link></div></div></div></article>})}</div> : <p className="rounded-xl border bg-white p-8 text-gray-500">No Job Fairs yet.</p>}
  </div></AdminDashboardLayout>
}

export function JobFairEditor({ fairId }: { fairId?: string }) {
  const router = useRouter()
  const [id, setId] = useState(fairId)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState<Record<string, any>>({})
  const [sectionItems, setSectionItems] = useState<JobFairSectionState>({
    highlights: [], partners: [], testimonials: [], gallery: [], additional_sections: [],
  })
  const [selectedJobs, setSelectedJobs] = useState<JobItem[]>([])
  const [manualJobs, setManualJobs] = useState<ManualJob[]>([])
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<JobItem[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loaded, setLoaded] = useState(!fairId)

  const uploadImage = async (file: File): Promise<string> => {
    setUploading(true)
    try { const form = new FormData(); form.append('file', file); const { data } = await apiClient.client.post('/job-fairs/admin/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } }); return data.file_url }
    catch { throw new Error('Image upload failed') } finally { setUploading(false) }
  }
  const uploadHero = async (file: File) => updateContent('hero_image', await uploadImage(file))
  useEffect(() => { if (!fairId) return; apiClient.client.get(`/job-fairs/admin`).then(({ data }) => { const fair = (data.job_fairs || []).find((item: Fair) => item.id === fairId); if (!fair) throw new Error('missing'); setId(fair.id); setTitle(fair.title); setSlug(fair.slug); setContent(fair.content || {}); setSectionItems(Object.fromEntries(arrayFields.map(key => [key, readItems(fair.content?.[key], key)])) as JobFairSectionState); setSelectedJobs(fair.jobs.filter((job: JobItem) => job.source === 'disha')); setManualJobs(fair.jobs.filter((job: JobItem) => job.source === 'manual') as ManualJob[]); }).catch(() => toast.error('Could not load this Job Fair')).finally(() => setLoaded(true)) }, [fairId])
  useEffect(() => { let active = true; const timer = setTimeout(() => { apiClient.client.get('/job-fairs/admin/jobs', { params: { search } }).then(({ data }) => { if (active) setSearchResults(data.jobs || []) }).catch(() => {}); }, 250); return () => { active = false; clearTimeout(timer) } }, [search])
  const updateContent = (key: string, value: string) => setContent(current => ({ ...current, [key]: value }))
  const updateUploadedItemImage = async (key: JobFairArrayField, editorKey: string, field: string, file: File) => {
    const url = await uploadImage(file)
    updateSectionItem(key, editorKey, { [field]: url })
  }
  const updateManualJob = (index: number, patch: Partial<ManualJob>) => setManualJobs(rows => rows.map((row, i) => i === index ? { ...row, ...patch } : row))
  const updateSectionItem = (key: JobFairArrayField, editorKey: string, patch: Record<string, unknown>) => setSectionItems(current => ({ ...current, [key]: current[key].map(item => item[JOB_FAIR_EDITOR_KEY] === editorKey ? { ...item, ...patch } : item) }))
  const addSectionItem = (key: JobFairArrayField, fields: Record<string, unknown>) => setSectionItems(current => ({ ...current, [key]: [...current[key], { ...fields, [JOB_FAIR_EDITOR_KEY]: `${key}-${crypto.randomUUID()}` }] }))
  const removeSectionItem = (key: JobFairArrayField, editorKey: string) => setSectionItems(current => ({ ...current, [key]: current[key].filter(item => item[JOB_FAIR_EDITOR_KEY] !== editorKey) }))
  const save = async () => {
    for (const item of sectionItems.highlights) {
      if (!String(item.title || '').trim()) { toast.error('Each program needs a title.'); return }
      if (!publicUrlIsValid(item.image, true)) { toast.error('Program images must use a valid HTTP or HTTPS URL.'); return }
    }
    for (const item of sectionItems.partners) {
      if (!String(item.name || '').trim()) { toast.error('Each partner needs a name.'); return }
      if (!publicUrlIsValid(item.logo, true) || !publicUrlIsValid(item.website)) { toast.error('Partner logo and website must use a valid HTTP or HTTPS URL.'); return }
    }
    for (const item of sectionItems.testimonials) {
      if (!String(item.person || '').trim() || !String(item.feedback || '').trim()) { toast.error('Each testimonial needs a person name and message.'); return }
      if (!publicUrlIsValid(item.photo, true)) { toast.error('Testimonial photo must use a valid HTTP or HTTPS URL.'); return }
    }
    for (const item of sectionItems.gallery) {
      if (!String(item.image || '').trim()) { toast.error('Each gallery image needs an image URL or upload.'); return }
      if (!publicUrlIsValid(item.image, true)) { toast.error('Gallery images must use a valid HTTP or HTTPS URL.'); return }
    }
    for (const item of sectionItems.additional_sections) if (!String(item.title || '').trim()) { toast.error('Each additional section needs a heading.'); return }
    const registrationStart = datetimeValue(content.registration_start)
    const registrationEnd = datetimeValue(content.registration_end)
    if (registrationStart !== null && registrationEnd !== null && registrationEnd < registrationStart) { toast.error('Registration closes before it opens. Check the registration dates.'); return }
    if (!publicUrlIsValid(content.logo, true) || !publicUrlIsValid(content.hero_image, true) || !publicUrlIsValid(content.cta_image, true) || !publicUrlIsValid(content.cta_url, true)) { toast.error('Logo, banner images, and action destinations must use valid HTTP or HTTPS URLs.'); return }
    const contentArrays = Object.fromEntries(arrayFields.map(key => [key, sectionItems[key].map(item => Object.fromEntries(Object.entries(item)))]))
    setSaving(true)
    try {
      const payload = { title, slug, content: { ...content, ...contentArrays }, existing_job_ids: selectedJobs.map(job => job.id), manual_jobs: manualJobs }
      const { data } = id ? await apiClient.client.put(`/job-fairs/admin/${id}`, payload) : await apiClient.client.post('/job-fairs/admin', payload)
      setId(data.id); toast.success('Job Fair saved'); if (!id) router.replace(`/dashboard/admin/job-fairs/${data.id}/edit`)
    } catch (error: any) { toast.error(error?.response?.data?.detail || 'Could not save Job Fair') } finally { setSaving(false) }
  }
  if (!loaded) return <AdminDashboardLayout><div className="p-8">Loading Job Fair…</div></AdminDashboardLayout>
  return <AdminDashboardLayout><div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
    <Link href="/dashboard/admin/job-fairs" className="inline-flex items-center gap-2 text-sm text-gray-600"><ArrowLeft className="h-4 w-4"/>All Job Fairs</Link>
    <header className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">{id ? 'Edit Job Fair' : 'Create Job Fair'}</h1><p className="text-sm text-gray-500">Configure the public page and its jobs together.</p></div><div className="flex gap-2">{id && <Link href={`/job-fairs/${slug}?preview=1&id=${id}`} target="_blank"><Button variant="outline">Preview</Button></Link>}<Button onClick={() => void save()} disabled={saving}><Save className="mr-2 h-4 w-4"/>{saving ? 'Saving…' : 'Save draft'}</Button></div></header>
    <section className="grid gap-4 rounded-xl border bg-white p-5 md:grid-cols-2"><h2 className="md:col-span-2 text-lg font-semibold">Basic information and hero</h2><label className="space-y-1 text-sm font-semibold text-gray-800">Title<Input value={title} onChange={e => setTitle(e.target.value)} required/></label><label className="space-y-1 text-sm font-semibold text-gray-800">Public slug<Input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} placeholder="career-opportunities-fair" required/></label>
      <div className="space-y-1 text-sm font-semibold text-gray-800"><p>Short description</p><RichTextEditor value={content.short_description || ''} onChange={value => updateContent('short_description', value)} placeholder="A concise introduction to the Job Fair." minHeightClassName="min-h-[100px]"/></div>
      <div className="space-y-1 text-sm font-semibold text-gray-800"><p>Description</p><RichTextEditor value={content.description || ''} onChange={value => updateContent('description', value)} placeholder="More information about the event."/></div>
      <DateTimeField label="Event date and time" value={content.date_time} onChange={value => updateContent('date_time', value)}/>
      <DateTimeField label="Registration opens" value={content.registration_start} onChange={value => updateContent('registration_start', value)}/>
      <DateTimeField label="Registration closes" value={content.registration_end} onChange={value => updateContent('registration_end', value)}/>
      {textFields.map(([key, label]) => key === 'cta_description' ? <div key={key} className="space-y-1 text-sm font-semibold text-gray-800"><p>{label}</p><RichTextEditor value={content[key] || ''} onChange={value => updateContent(key, value)} placeholder="Connect with leading companies, explore career opportunities, and take the next step toward your dream job at the HireKarma Mega Career & Job Fair 2026." minHeightClassName="min-h-[120px]"/></div> : <label key={key} className="space-y-1 text-sm font-semibold text-gray-800">{label}<Input value={content[key] || ''} placeholder={key === 'cta_heading' ? 'Be Part of HireKarma Mega Career & Job Fair 2026' : ''} onChange={e => updateContent(key, e.target.value)} className="font-normal"/></label>)}
      <label className="space-y-1 text-sm font-semibold text-gray-800">Primary action URL<Input type="url" value={content.cta_url || ''} onChange={e => updateContent('cta_url', e.target.value)} placeholder="https://example.com/register" className="font-normal"/></label>
      <label className="space-y-1 text-sm font-semibold text-gray-800">Event logo URL<Input value={content.logo || ''} onChange={e => updateContent('logo', e.target.value)} placeholder="https://…" className="font-normal"/></label>
      <div className="md:col-span-2"><EventImageUpload label="Hero / banner image" aspect="wide" value={content.hero_image} onChange={value => updateContent('hero_image', value)} onUpload={uploadHero} uploading={uploading}/></div>
      <div className="md:col-span-2"><EventImageUpload label="Don't miss out registration banner image" aspect="wide" value={content.cta_image || ''} onChange={value => updateContent('cta_image', value)} onUpload={async file => updateContent('cta_image', await uploadImage(file))} uploading={uploading}/></div>
    </section>
    <JobFairContentSections items={sectionItems} uploading={uploading} onAdd={addSectionItem} onRemove={removeSectionItem} onUpdate={updateSectionItem} onUpload={updateUploadedItemImage}/>
    <section className="space-y-4 rounded-xl border bg-white p-5"><div><h2 className="text-lg font-semibold">Existing Disha jobs</h2><p className="text-sm text-gray-500">Selection keeps the original Disha record and application flow.</p></div><div className="flex gap-2"><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search active jobs"/><Button variant="outline" aria-label="Search"><Search className="h-4 w-4"/></Button></div><div className="max-h-52 space-y-1 overflow-auto">{searchResults.map(job => <label key={job.id} className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-gray-50"><input type="checkbox" checked={selectedJobs.some(row => row.id === job.id)} onChange={e => setSelectedJobs(current => e.target.checked ? [...current.filter(row => row.id !== job.id), job] : current.filter(row => row.id !== job.id))}/><span>{job.title} · {job.company_name}</span></label>)}</div><p className="text-sm">Selected: {selectedJobs.map(job => job.title).join(', ') || 'None'}</p></section>
    <section className="space-y-4 rounded-xl border bg-white p-5"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold">Manual Job Fair jobs</h2><p className="text-sm text-gray-500">These jobs have a separate application record and exemption policy.</p></div><Button variant="outline" onClick={() => setManualJobs(list => [...list, { title: '', company_name: '' }])}><Plus className="mr-2 h-4 w-4"/>Add job</Button></div>{manualJobs.map((job, index) => <div key={job.id || index} className="grid gap-3 rounded-lg border p-4 md:grid-cols-2"><label className="text-sm">Job title<Input value={job.title} onChange={e => updateManualJob(index, { title: e.target.value })}/></label><label className="text-sm">Company<Input value={job.company_name} onChange={e => updateManualJob(index, { company_name: e.target.value })}/></label><div><EventImageUpload label="Company logo" aspect="logo" value={job.company_logo || ''} onChange={value => updateManualJob(index, { company_logo: value })} onUpload={async file => updateManualJob(index, { company_logo: await uploadImage(file) })} uploading={uploading}/></div><label className="text-sm">Location<Input value={job.location || ''} onChange={e => updateManualJob(index, { location: e.target.value })}/></label><label className="text-sm">Job type<Input value={job.job_type || ''} onChange={e => updateManualJob(index, { job_type: e.target.value })}/></label><label className="text-sm">Compensation<Input value={job.compensation || ''} onChange={e => updateManualJob(index, { compensation: e.target.value })}/></label><label className="text-sm">Experience range (min–max)<div className="flex gap-2"><Input type="number" value={job.experience_min ?? ''} onChange={e => updateManualJob(index, { experience_min: e.target.value ? Number(e.target.value) : null })}/><Input type="number" value={job.experience_max ?? ''} onChange={e => updateManualJob(index, { experience_max: e.target.value ? Number(e.target.value) : null })}/></div></label><label className="text-sm">Vacancies<Input type="number" value={job.vacancies ?? ''} onChange={e => updateManualJob(index, { vacancies: e.target.value ? Number(e.target.value) : null })}/></label><label className="text-sm">Application deadline<Input type="date" value={job.application_deadline?.slice(0, 10) || ''} onChange={e => updateManualJob(index, { application_deadline: e.target.value || null })}/></label><label className="text-sm md:col-span-2">Skills (comma separated)<Input value={(job.skills || []).join(', ')} onChange={e => updateManualJob(index, { skills: e.target.value.split(',').map(skill => skill.trim()).filter(Boolean) })}/></label>{(['description', 'responsibilities', 'requirements'] as const).map(field => <div key={field} className="space-y-1 text-sm capitalize md:col-span-2"><p>{field === 'description' ? 'Job description' : field}</p><RichTextEditor value={job[field] || ''} onChange={value => updateManualJob(index, { [field]: value })} placeholder={`Add formatted ${field}.`} minHeightClassName="min-h-[120px]"/></div>)}<div className="md:col-span-2 flex justify-end"><Button variant="destructive" size="sm" onClick={() => setManualJobs(rows => rows.filter((_, i) => i !== index))}><Trash2 className="mr-2 h-4 w-4"/>Remove job</Button></div></div>)}</section>
    <div className="flex justify-end"><Button onClick={() => void save()} disabled={saving}><Save className="mr-2 h-4 w-4"/>{saving ? 'Saving…' : 'Save Job Fair'}</Button></div>
  </div></AdminDashboardLayout>
}
