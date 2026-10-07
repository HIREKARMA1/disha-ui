'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CampusDriveFieldSelect } from '@/components/admin/CampusDriveFieldSelect'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { EventImageUpload } from '@/components/admin/EventImageUpload'
import { CampusDriveJobPicker } from '@/components/admin/CampusDriveJobPicker'
import { campusDriveService, apiErrorMessage } from '@/services/campusDriveService'
import { EVENT_CATEGORIES } from '@/types/contestEvent'
import type { FAQItem, RewardItem, RoundItem, VisibilitySettings } from '@/types/contestEvent'
import type { CampusDriveJobSummary, CampusDriveListingStatus, CampusDriveMode, CampusDriveWritePayload } from '@/types/campusDrive'
import { normalizeRichTextHtml } from '@/lib/sanitizeHtml'
import { utcIsoToDatetimeLocal } from '@/lib/datetime'
import { toast } from 'react-hot-toast'
import { validatePhone } from '@/lib/utils'

interface FormState {
  title: string
  slug: string
  category: string
  subtitle: string
  short_description: string
  long_description: string
  banner_url: string
  organizer_logo_url: string
  organizer_name: string
  organizer_website: string
  organizer_email: string
  organizer_phone: string
  venue: string
  mode: CampusDriveMode
  event_link: string
  registration_start_date: string
  registration_end_date: string
  event_start_date: string
  event_end_date: string
  visibility: VisibilitySettings
  listing_status: CampusDriveListingStatus
  eligibility: string
  about_organizer: string
  support_email: string
  support_phone: string
  support_content: string
  faqs: FAQItem[]
  rounds: RoundItem[]
  rewards: RewardItem[]
  jobs: CampusDriveJobSummary[]
}

const emptyForm = (): FormState => ({
  title: '',
  slug: '',
  category: 'technology',
  subtitle: '',
  short_description: '',
  long_description: '',
  banner_url: '',
  organizer_logo_url: '',
  organizer_name: '',
  organizer_website: '',
  organizer_email: '',
  organizer_phone: '',
  venue: '',
  mode: 'online',
  event_link: '',
  registration_start_date: '',
  registration_end_date: '',
  event_start_date: '',
  event_end_date: '',
  visibility: { student: true, corporate: false, university: false, public: true },
  listing_status: 'active',
  eligibility: '',
  about_organizer: '',
  support_email: '',
  support_phone: '',
  support_content: '',
  faqs: [],
  rounds: [],
  rewards: [],
  jobs: [],
})

function parseLocal(value: string) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function currentDatetimeLocalMin() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
}

function laterDatetimeMin(floor: string, other?: string) {
  if (!other) return floor
  return other > floor ? other : floor
}

/** Digits, and one leading + — the characters validatePhone accepts. */
function sanitizePhoneInput(value: string) {
  let next = ''
  for (const char of value) {
    if (char >= '0' && char <= '9') next += char
    else if (char === '+' && next.length === 0) next += '+'
  }
  return next.slice(0, 16)
}

const EMPTY_DATES = {
  registration_start_date: '',
  registration_end_date: '',
  event_start_date: '',
  event_end_date: '',
}

export function CampusDriveCreateForm({ driveId }: { driveId?: string }) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [published, setPublished] = useState(false)
  const [loading, setLoading] = useState(!!driveId)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const savedDates = useRef(EMPTY_DATES)
  const [nowMin, setNowMin] = useState(currentDatetimeLocalMin)

  useEffect(() => {
    const timer = window.setInterval(() => setNowMin(currentDatetimeLocalMin()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!driveId) return
    campusDriveService
      .getAdmin(driveId)
      .then((drive) => {
        setPublished((drive.publication_status || 'draft') === 'published')
        const dates = {
          registration_start_date: drive.registration_start_date
            ? utcIsoToDatetimeLocal(drive.registration_start_date)
            : '',
          registration_end_date: drive.registration_end_date
            ? utcIsoToDatetimeLocal(drive.registration_end_date)
            : '',
          event_start_date: drive.event_start_date ? utcIsoToDatetimeLocal(drive.event_start_date) : '',
          event_end_date: drive.event_end_date ? utcIsoToDatetimeLocal(drive.event_end_date) : '',
        }
        savedDates.current = dates
        setForm({
          title: drive.title || '',
          slug: drive.slug || '',
          category: drive.category || 'technology',
          subtitle: drive.subtitle || '',
          short_description: drive.short_description || '',
          long_description: drive.long_description || '',
          banner_url: drive.banner_url || '',
          organizer_logo_url: drive.organizer_logo_url || '',
          organizer_name: drive.organizer_name || '',
          organizer_website: drive.organizer_website || '',
          organizer_email: drive.organizer_email || '',
          organizer_phone: sanitizePhoneInput(drive.organizer_phone || ''),
          venue: drive.venue || '',
          mode: drive.mode === 'offline' ? 'offline' : 'online',
          event_link: drive.event_link || '',
          ...dates,
          visibility: drive.visibility,
          listing_status:
            drive.listing_status === 'inactive' || drive.listing_status === 'hidden'
              ? drive.listing_status
              : 'active',
          eligibility: drive.eligibility || '',
          about_organizer: drive.about_organizer || '',
          support_email: drive.support_email || '',
          support_phone: sanitizePhoneInput(drive.support_phone || ''),
          support_content: drive.support_content || '',
          faqs: drive.faqs || [],
          rounds: drive.rounds || [],
          rewards: drive.rewards || [],
          jobs: (drive.jobs || []).map((job) => ({
            id: job.id,
            title: job.title,
            company_name: job.company_name || job.corporate_name || null,
            location: Array.isArray(job.location) ? job.location.filter(Boolean).join(', ') : job.location || null,
            job_type: job.job_type,
            status: job.status,
            salary_min: job.salary_min ?? null,
            salary_max: job.salary_max ?? null,
            salary_currency: job.salary_currency,
            slug: job.slug,
          })),
        })
      })
      .catch(() => toast.error('Failed to load campus drive'))
      .finally(() => setLoading(false))
  }, [driveId])

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const commitDate = (key: keyof typeof EMPTY_DATES, value: string) => {
    if (value && value < nowMin && value !== savedDates.current[key]) {
      toast.error(
        key.startsWith('registration')
          ? `${key === 'registration_start_date' ? 'Registration Start' : 'Registration End'} cannot be in the past`
          : `${key === 'event_start_date' ? 'Campus Drive Start' : 'Campus Drive End'} cannot be in the past`
      )
      return
    }
    update(key, value)
  }

  const handleUpload = async (file: File, type: 'banner' | 'logo', field: 'banner_url' | 'organizer_logo_url') => {
    setUploading(field)
    try {
      const result = await campusDriveService.uploadFile(file, type)
      update(field, result.file_url)
      toast.success('Image uploaded')
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Upload failed'))
    } finally {
      setUploading(null)
    }
  }

  const validate = () => {
    if (!form.title.trim() || !form.event_start_date) {
      toast.error('Event title and Campus Drive start are required')
      return false
    }
    const start = parseLocal(form.event_start_date)
    const end = parseLocal(form.event_end_date)
    const regStart = parseLocal(form.registration_start_date)
    const regEnd = parseLocal(form.registration_end_date)
    if (end && start && end < start) {
      toast.error('Campus Drive end cannot be earlier than Campus Drive start')
      return false
    }
    if (regEnd && regStart && regEnd < regStart) {
      toast.error('Registration end cannot be earlier than registration start')
      return false
    }
    if (form.mode === 'online' && !form.event_link.trim()) {
      toast.error('Online campus drives need a meeting link before they can be saved')
      return false
    }
    if (form.event_link.trim() && !/^https?:\/\/.+/i.test(form.event_link.trim())) {
      toast.error('Event link must be a valid http or https URL')
      return false
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (form.organizer_email.trim() && !emailPattern.test(form.organizer_email.trim())) {
      toast.error('Organizer Email must be a valid email address, including an @ sign')
      return false
    }
    if (form.support_email.trim() && !emailPattern.test(form.support_email.trim())) {
      toast.error('Support Email must be a valid email address, including an @ sign')
      return false
    }
    const dates = [
      ['registration_start_date', 'Registration Start'],
      ['registration_end_date', 'Registration End'],
      ['event_start_date', 'Campus Drive Start'],
      ['event_end_date', 'Campus Drive End'],
    ] as const
    for (const [key, label] of dates) {
      const value = form[key]
      if (!value) continue
      if (value < nowMin && value !== savedDates.current[key]) {
        toast.error(`${label} cannot be in the past`)
        return false
      }
    }
    if (form.organizer_phone.trim() && !validatePhone(form.organizer_phone.trim())) {
      toast.error('Organizer Phone: Please enter a valid phone number.')
      return false
    }
    if (form.support_phone.trim() && !validatePhone(form.support_phone.trim())) {
      toast.error('Support Phone: Please enter a valid phone number.')
      return false
    }
    return true
  }

  const buildPayload = (): CampusDriveWritePayload => {
    const textOrNull = (value: string) => value.trim() || null
    const ids = form.jobs.map((job) => job.id).filter((id, index, all) => all.indexOf(id) === index)
    return {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      category: form.category as CampusDriveWritePayload['category'],
      subtitle: form.subtitle,
      short_description: normalizeRichTextHtml(form.short_description) || null,
      long_description: normalizeRichTextHtml(form.long_description) || null,
      banner_url: form.banner_url || null,
      organizer_logo_url: form.organizer_logo_url || null,
      organizer_name: form.organizer_name,
      organizer_website: form.organizer_website,
      organizer_email: textOrNull(form.organizer_email),
      organizer_phone: form.organizer_phone,
      venue: form.venue,
      mode: form.mode,
      event_link: form.event_link.trim() || null,
      registration_start_date: form.registration_start_date
        ? new Date(form.registration_start_date).toISOString()
        : null,
      registration_end_date: form.registration_end_date
        ? new Date(form.registration_end_date).toISOString()
        : null,
      event_start_date: new Date(form.event_start_date).toISOString(),
      event_end_date: form.event_end_date ? new Date(form.event_end_date).toISOString() : null,
      visibility: form.visibility,
      listing_status: form.listing_status,
      eligibility: normalizeRichTextHtml(form.eligibility) || null,
      about_organizer: normalizeRichTextHtml(form.about_organizer) || null,
      support_email: textOrNull(form.support_email),
      support_phone: form.support_phone,
      support_content: normalizeRichTextHtml(form.support_content) || null,
      faqs: form.faqs.map((faq, index) => ({
        ...faq,
        answer: normalizeRichTextHtml(faq.answer),
        sort_order: index,
      })),
      rounds: form.rounds.map((round, index) => ({
        ...round,
        description: normalizeRichTextHtml(round.description) || undefined,
        sort_order: index,
      })),
      rewards: form.rewards.map((reward, index) => ({
        ...reward,
        description: normalizeRichTextHtml(reward.description) || undefined,
        sort_order: index,
      })),
      job_ids: ids,
    }
  }

  const persist = async (publishAfter: boolean) => {
    if (!validate()) return
    setSaving(true)
    try {
      const payload = buildPayload()
      const saved = driveId
        ? await campusDriveService.update(driveId, payload)
        : await campusDriveService.create(payload)
      if (publishAfter) {
        await campusDriveService.publish(saved.id)
        toast.success('Campus Drive published')
      } else {
        toast.success(driveId ? 'Campus Drive updated' : 'Campus Drive saved as draft')
      }
      router.push('/dashboard/admin/campus-drives')
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to save campus drive'))
    } finally {
      setSaving(false)
    }
  }

  const noneVisibility =
    !form.visibility.student &&
    !form.visibility.corporate &&
    !form.visibility.university &&
    !form.visibility.public

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void persist(false)
      }}
      className="mx-auto w-full max-w-5xl space-y-6 pb-36 lg:pb-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {driveId ? 'Edit Campus Drive' : 'Create Campus Drive'}
        </h1>
        <p className="text-sm text-gray-500">{published ? 'Published' : 'Draft'}</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <p className="text-sm font-medium text-gray-900 dark:text-white">Student access</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              ['active', 'Active'],
              ['inactive', 'Inactive'],
              ['hidden', 'Hide'],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={form.listing_status === value ? 'default' : 'outline'}
              onClick={() =>
                update(
                  'listing_status',
                  form.listing_status === value ? (value === 'active' ? 'inactive' : 'active') : value,
                )
              }
            >
              {label}
            </Button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {form.listing_status === 'inactive'
            ? 'Hidden from students, the same way an inactive job is hidden.'
            : form.listing_status === 'hidden'
              ? 'Students can open the details. The register button is hidden, so they cannot apply.'
              : 'Students can view this campus drive and register.'}
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Campus Drive Images</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <EventImageUpload
            label="Background Banner Image"
            hint="Used on the campus drive details hero. Recommended ratio 16:9."
            value={form.banner_url}
            onChange={(url) => update('banner_url', url)}
            onUpload={async (file) => handleUpload(file, 'banner', 'banner_url')}
            uploading={uploading === 'banner_url'}
            aspect="banner"
          />
          <EventImageUpload
            label="Profile / Logo Image"
            hint="Shown in listings and on the campus drive details page."
            value={form.organizer_logo_url}
            onChange={(url) => update('organizer_logo_url', url)}
            onUpload={async (file) => handleUpload(file, 'logo', 'organizer_logo_url')}
            uploading={uploading === 'organizer_logo_url'}
            aspect="logo"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Event Title *</label>
            <Input value={form.title} onChange={(e) => update('title', e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Slug (auto-generated if empty)</label>
              <Input value={form.slug} onChange={(e) => update('slug', e.target.value)} placeholder="autumn-campus-drive" />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <CampusDriveFieldSelect
                value={form.category}
                onValueChange={(value) => update('category', value)}
                options={EVENT_CATEGORIES}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Subtitle</label>
            <Input value={form.subtitle} onChange={(e) => update('subtitle', e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Short Description</label>
            <RichTextEditor
              value={form.short_description}
              onChange={(html) => update('short_description', html)}
              placeholder="Brief summary shown on cards…"
              minHeightClassName="min-h-[120px]"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <RichTextEditor
              value={form.long_description}
              onChange={(html) => update('long_description', html)}
              placeholder="Write the full campus drive description…"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Organizer & Venue</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div><label className="text-sm font-medium">Organizer Name</label><Input value={form.organizer_name} onChange={(e) => update('organizer_name', e.target.value)} /></div>
          <div><label className="text-sm font-medium">Organizer Website</label><Input value={form.organizer_website} onChange={(e) => update('organizer_website', e.target.value)} /></div>
          <div><label className="text-sm font-medium">Organizer Email</label><Input type="email" value={form.organizer_email} onChange={(e) => update('organizer_email', e.target.value)} /></div>
          <div><label className="text-sm font-medium">Organizer Phone</label><Input inputMode="tel" autoComplete="tel" value={form.organizer_phone} onChange={(e) => update('organizer_phone', sanitizePhoneInput(e.target.value))} /></div>
          <div><label className="text-sm font-medium">Venue</label><Input value={form.venue} onChange={(e) => update('venue', e.target.value)} /></div>
          <div>
            <label className="text-sm font-medium">Mode</label>
            <CampusDriveFieldSelect
              value={form.mode}
              onValueChange={(value) => update('mode', value as CampusDriveMode)}
              options={[
                { value: 'online', label: 'Online' },
                { value: 'offline', label: 'Offline' },
              ]}
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Event Link{form.mode === 'online' ? ' *' : ''}</label>
            <Input
              type="url"
              value={form.event_link}
              onChange={(e) => update('event_link', e.target.value)}
              placeholder="https://meet.google.com/..."
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              For online campus drives, add the Google Meet, Microsoft Teams, Zoom, or other meeting link before saving.
              The link is optional for offline campus drives.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Dates & Registration</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div><label className="text-sm font-medium">Registration Start</label><Input type="datetime-local" min={nowMin} step={60} value={form.registration_start_date} onChange={(e) => commitDate('registration_start_date', e.target.value)} /></div>
          <div><label className="text-sm font-medium">Registration End</label><Input type="datetime-local" min={laterDatetimeMin(nowMin, form.registration_start_date)} step={60} value={form.registration_end_date} onChange={(e) => commitDate('registration_end_date', e.target.value)} /></div>
          <div><label className="text-sm font-medium">Campus Drive Start *</label><Input type="datetime-local" min={nowMin} step={60} value={form.event_start_date} onChange={(e) => commitDate('event_start_date', e.target.value)} required /></div>
          <div><label className="text-sm font-medium">Campus Drive End</label><Input type="datetime-local" min={laterDatetimeMin(nowMin, form.event_start_date)} step={60} value={form.event_end_date} onChange={(e) => commitDate('event_end_date', e.target.value)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Visibility & Eligibility</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            {(['student', 'corporate', 'university', 'public'] as const).map((key) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 text-sm capitalize">
                <Checkbox
                  checked={form.visibility[key]}
                  onChange={(e) => update('visibility', { ...form.visibility, [key]: e.target.checked })}
                />
                {key === 'public' ? 'Everyone (Public)' : key}
              </label>
            ))}
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={noneVisibility}
                onChange={(e) => {
                  update(
                    'visibility',
                    e.target.checked
                      ? { student: false, corporate: false, university: false, public: false }
                      : { student: true, corporate: false, university: false, public: true }
                  )
                }}
              />
              None
            </label>
          </div>
          {noneVisibility && (
            <p className="text-xs text-gray-500">This campus drive will not appear in public listings.</p>
          )}
          <div>
            <label className="text-sm font-medium">Eligibility</label>
            <RichTextEditor value={form.eligibility} onChange={(html) => update('eligibility', html)} minHeightClassName="min-h-[140px]" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>About Organizer & Support</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">About Organizer</label>
            <RichTextEditor value={form.about_organizer} onChange={(html) => update('about_organizer', html)} minHeightClassName="min-h-[140px]" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div><label className="text-sm font-medium">Support Email</label><Input value={form.support_email} onChange={(e) => update('support_email', e.target.value)} /></div>
            <div><label className="text-sm font-medium">Support Phone</label><Input inputMode="tel" autoComplete="tel" value={form.support_phone} onChange={(e) => update('support_phone', sanitizePhoneInput(e.target.value))} /></div>
          </div>
          <div>
            <label className="text-sm font-medium">Support Content</label>
            <RichTextEditor value={form.support_content} onChange={(html) => update('support_content', html)} minHeightClassName="min-h-[120px]" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>FAQs</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => update('faqs', [...form.faqs, { question: '', answer: '', sort_order: form.faqs.length }])}>
            <Plus className="mr-1 h-4 w-4" /> Add FAQ
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.faqs.map((faq, index) => (
            <div key={index} className="space-y-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <Input
                placeholder="Question"
                value={faq.question}
                onChange={(e) => {
                  const faqs = [...form.faqs]
                  faqs[index] = { ...faq, question: e.target.value }
                  update('faqs', faqs)
                }}
              />
              <RichTextEditor
                value={faq.answer || ''}
                onChange={(html) => {
                  const faqs = [...form.faqs]
                  faqs[index] = { ...faq, answer: html }
                  update('faqs', faqs)
                }}
                placeholder="Answer"
                minHeightClassName="min-h-[120px]"
              />
              <Button type="button" variant="ghost" size="sm" className="text-red-500" onClick={() => update('faqs', form.faqs.filter((_, item) => item !== index))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Rounds</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => update('rounds', [...form.rounds, { title: '', description: '', sort_order: form.rounds.length }])}>
            <Plus className="mr-1 h-4 w-4" /> Add Round
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.rounds.map((round, index) => (
            <div key={index} className="space-y-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <Input
                placeholder="Round title"
                value={round.title}
                onChange={(e) => {
                  const rounds = [...form.rounds]
                  rounds[index] = { ...round, title: e.target.value }
                  update('rounds', rounds)
                }}
              />
              <RichTextEditor
                value={round.description || ''}
                onChange={(html) => {
                  const rounds = [...form.rounds]
                  rounds[index] = { ...round, description: html }
                  update('rounds', rounds)
                }}
                placeholder="Description"
                minHeightClassName="min-h-[120px]"
              />
              <Button type="button" variant="ghost" size="sm" className="text-red-500" onClick={() => update('rounds', form.rounds.filter((_, item) => item !== index))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Rewards</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => update('rewards', [...form.rewards, { title: '', description: '', value: '', sort_order: form.rewards.length }])}>
            <Plus className="mr-1 h-4 w-4" /> Add Reward
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.rewards.map((reward, index) => (
            <div key={index} className="space-y-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input
                  placeholder="Title"
                  value={reward.title}
                  onChange={(e) => {
                    const rewards = [...form.rewards]
                    rewards[index] = { ...reward, title: e.target.value }
                    update('rewards', rewards)
                  }}
                />
                <Input
                  placeholder="Value"
                  value={reward.value || ''}
                  onChange={(e) => {
                    const rewards = [...form.rewards]
                    rewards[index] = { ...reward, value: e.target.value }
                    update('rewards', rewards)
                  }}
                />
              </div>
              <RichTextEditor
                value={reward.description || ''}
                onChange={(html) => {
                  const rewards = [...form.rewards]
                  rewards[index] = { ...reward, description: html }
                  update('rewards', rewards)
                }}
                placeholder="Description"
                minHeightClassName="min-h-[120px]"
              />
              <Button type="button" variant="ghost" size="sm" className="text-red-500" onClick={() => update('rewards', form.rewards.filter((_, item) => item !== index))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Selected Jobs</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Add Jobs
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.jobs.length === 0 ? (
            <p className="text-sm text-gray-500">No jobs selected yet.</p>
          ) : (
            form.jobs.map((job, index) => (
              <div key={job.id} className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white">{index + 1}. {job.title}</p>
                  <p className="text-sm text-gray-500">Company: {job.company_name || '—'}</p>
                  <p className="text-sm text-gray-500">Location: {job.location || '—'}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  onClick={() => update('jobs', form.jobs.filter((item) => item.id !== job.id))}
                >
                  Remove
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="sticky bottom-24 z-30 flex flex-wrap items-center justify-end gap-2 rounded-xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 lg:bottom-0">
        <Button type="button" variant="outline" onClick={() => router.push('/dashboard/admin/campus-drives')} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {driveId ? 'Save' : 'Create'}
        </Button>
        {!published && (
          <Button type="button" disabled={saving} onClick={() => void persist(true)}>
            Publish
          </Button>
        )}
        {published && driveId && (
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={async () => {
              setSaving(true)
              try {
                await campusDriveService.unpublish(driveId)
                setPublished(false)
                toast.success('Campus Drive moved to draft')
              } catch (err) {
                toast.error(apiErrorMessage(err, 'Failed to unpublish'))
              } finally {
                setSaving(false)
              }
            }}
          >
            Unpublish
          </Button>
        )}
      </div>

      <CampusDriveJobPicker
        open={pickerOpen}
        selected={form.jobs}
        onClose={() => setPickerOpen(false)}
        onSave={(jobs) => {
          const byId = new Map<string, CampusDriveJobSummary>()
          jobs.forEach((job) => byId.set(job.id, job))
          update('jobs', Array.from(byId.values()))
          setPickerOpen(false)
        }}
      />
    </form>
  )
}
