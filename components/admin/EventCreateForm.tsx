"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { contestEventService } from '@/services/contestEventService'
import type { ContestEventCreatePayload, ContestEventDetail, ContestEventUpdatePayload, FAQItem, RoundItem, RewardItem } from '@/types/contestEvent'
import { EVENT_CATEGORIES } from '@/types/contestEvent'
import { EventImageUpload } from '@/components/admin/EventImageUpload'
import { toast } from 'react-hot-toast'

interface EventFormProps {
  eventId?: string
}

const defaultForm: ContestEventCreatePayload = {
  title: '',
  short_description: '',
  subtitle: '',
  long_description: '',
  venue: 'Online',
  mode: 'online',
  category: 'technology',
  event_start_date: '',
  event_end_date: '',
  registration_start_date: '',
  registration_end_date: '',
  max_participants: 1000,
  prize_pool: '',
  prize_type: 'free',
  eligibility: '',
  about_organizer: '',
  organizer_name: '',
  organizer_email: '',
  organizer_website: '',
  organizer_phone: '',
  support_email: '',
  support_phone: '',
  support_content: '',
  registration_button_text: 'Register Now',
  publication_status: 'draft',
  registration_is_open: true,
  visibility: { student: true, corporate: false, university: false, public: true },
  faqs: [],
  rounds: [],
  rewards: [],
}

export function EventCreateForm({ eventId }: EventFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<ContestEventCreatePayload>(defaultForm)
  const [loading, setLoading] = useState(!!eventId)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => {
    if (eventId) {
      contestEventService.getAdminEvent(eventId)
        .then((event) => {
          setForm({
            title: event.title,
            slug: event.slug,
            short_description: event.short_description,
            subtitle: event.subtitle,
            long_description: event.long_description,
            banner_url: event.banner_url,
            organizer_logo_url: event.organizer_logo_url,
            organizer_name: event.organizer_name,
            organizer_website: event.organizer_website,
            organizer_email: event.organizer_email,
            organizer_phone: event.organizer_phone,
            venue: event.venue,
            mode: event.mode,
            category: event.category,
            registration_start_date: event.registration_start_date?.slice(0, 16),
            registration_end_date: event.registration_end_date?.slice(0, 16),
            event_start_date: event.event_start_date?.slice(0, 16),
            event_end_date: event.event_end_date?.slice(0, 16),
            max_participants: event.max_participants,
            registration_limit: event.registration_limit,
            prize_pool: event.prize_pool,
            prize_type: event.prize_type,
            eligibility: event.eligibility,
            about_organizer: event.about_organizer,
            support_email: event.support_email,
            support_phone: event.support_phone,
            support_content: event.support_content,
            registration_button_text: event.registration_button_text,
            registration_external_url: event.registration_external_url,
            publication_status: event.publication_status,
            registration_is_open: event.registration_is_open,
            visibility: event.visibility,
            faqs: event.faqs,
            rounds: event.rounds,
            rewards: event.rewards,
          })
        })
        .catch(() => toast.error('Failed to load event'))
        .finally(() => setLoading(false))
    }
  }, [eventId])

  const update = (key: string, value: unknown) => setForm(f => ({ ...f, [key]: value }))

  const handleUpload = async (file: File, type: 'banner' | 'logo' | 'document', field: string) => {
    const maxSize = type === 'document' ? 10 * 1024 * 1024 : 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error(type === 'document' ? 'File must be less than 10MB' : 'Image must be less than 5MB')
      return
    }
    setUploading(field)
    try {
      const result = await contestEventService.uploadFile(file, type === 'document' ? 'document' : type)
      update(field, result.file_url)
      toast.success('File uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(null)
    }
  }

  const buildPayload = (): ContestEventCreatePayload => {
    const emptyToUndef = (v: string | undefined) => (v === '' || v === undefined ? undefined : v)
    return {
      ...form,
      organizer_email: emptyToUndef(form.organizer_email),
      support_email: emptyToUndef(form.support_email),
      slug: emptyToUndef(form.slug),
      registration_external_url: emptyToUndef(form.registration_external_url),
      banner_url: emptyToUndef(form.banner_url),
      organizer_logo_url: emptyToUndef(form.organizer_logo_url),
      event_start_date: new Date(form.event_start_date).toISOString(),
      event_end_date: form.event_end_date ? new Date(form.event_end_date).toISOString() : undefined,
      registration_start_date: form.registration_start_date ? new Date(form.registration_start_date).toISOString() : undefined,
      registration_end_date: form.registration_end_date ? new Date(form.registration_end_date).toISOString() : undefined,
    }
  }

  const buildUpdatePayload = (): ContestEventUpdatePayload => ({
    ...buildPayload(),
    banner_url: form.banner_url || null,
    organizer_logo_url: form.organizer_logo_url || null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.event_start_date) {
      toast.error('Title and event start date are required')
      return
    }
    setSaving(true)
    try {
      const payload = buildPayload()
      if (eventId) {
        await contestEventService.updateEvent(eventId, buildUpdatePayload())
        toast.success('Event updated')
      } else {
        await contestEventService.createEvent(payload)
        toast.success('Event created')
      }
      router.push('/dashboard/admin/events')
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { detail?: string; error?: string } } })?.response?.data
      const msg = typeof data?.detail === 'string' ? data.detail : typeof data?.error === 'string' ? data.error : 'Failed to save event'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const addFaq = () => update('faqs', [...(form.faqs || []), { question: '', answer: '', sort_order: (form.faqs?.length || 0) }])
  const addRound = () => update('rounds', [...(form.rounds || []), { title: '', description: '', sort_order: (form.rounds?.length || 0) }])
  const addReward = () => update('rewards', [...(form.rewards || []), { title: '', description: '', value: '', sort_order: (form.rewards?.length || 0) }])

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {eventId ? 'Edit Event' : 'Create Event'}
        </h1>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {eventId ? 'Update' : 'Create'}
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Event Images</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EventImageUpload
            label="Background Banner Image"
            hint="Used on event details hero. Recommended ratio 16:9."
            value={form.banner_url}
            onChange={(url) => update('banner_url', url)}
            onUpload={async (file) => handleUpload(file, 'banner', 'banner_url')}
            uploading={uploading === 'banner_url'}
            aspect="banner"
          />
          <EventImageUpload
            label="Event Profile / Logo Image"
            hint="Shown in listings, dashboards, and event details."
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Slug (auto-generated if empty)</label>
              <Input value={form.slug || ''} onChange={(e) => update('slug', e.target.value)} placeholder="tech-fest-2026" />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={form.category} onValueChange={(v) => update('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EVENT_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Subtitle</label>
            <Input value={form.subtitle || ''} onChange={(e) => update('subtitle', e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Short Description</label>
            <Textarea value={form.short_description || ''} onChange={(e) => update('short_description', e.target.value)} rows={2} />
          </div>
          <div>
            <label className="text-sm font-medium">Long Description</label>
            <Textarea value={form.long_description || ''} onChange={(e) => update('long_description', e.target.value)} rows={5} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Organizer & Venue</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Organizer Name</label><Input value={form.organizer_name || ''} onChange={(e) => update('organizer_name', e.target.value)} /></div>
          <div><label className="text-sm font-medium">Organizer Website</label><Input value={form.organizer_website || ''} onChange={(e) => update('organizer_website', e.target.value)} /></div>
          <div><label className="text-sm font-medium">Organizer Email</label><Input type="email" value={form.organizer_email || ''} onChange={(e) => update('organizer_email', e.target.value)} /></div>
          <div><label className="text-sm font-medium">Organizer Phone</label><Input value={form.organizer_phone || ''} onChange={(e) => update('organizer_phone', e.target.value)} /></div>
          <div><label className="text-sm font-medium">Venue</label><Input value={form.venue || ''} onChange={(e) => update('venue', e.target.value)} /></div>
          <div>
            <label className="text-sm font-medium">Mode</label>
            <Select value={form.mode} onValueChange={(v) => update('mode', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Dates & Registration</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Registration Start</label><Input type="datetime-local" value={form.registration_start_date || ''} onChange={(e) => update('registration_start_date', e.target.value)} /></div>
          <div><label className="text-sm font-medium">Registration End</label><Input type="datetime-local" value={form.registration_end_date || ''} onChange={(e) => update('registration_end_date', e.target.value)} /></div>
          <div><label className="text-sm font-medium">Event Start *</label><Input type="datetime-local" value={form.event_start_date} onChange={(e) => update('event_start_date', e.target.value)} required /></div>
          <div><label className="text-sm font-medium">Event End</label><Input type="datetime-local" value={form.event_end_date || ''} onChange={(e) => update('event_end_date', e.target.value)} /></div>
          <div><label className="text-sm font-medium">Max Participants</label><Input type="number" value={form.max_participants || ''} onChange={(e) => update('max_participants', parseInt(e.target.value))} /></div>
          <div><label className="text-sm font-medium">Registration Limit</label><Input type="number" value={form.registration_limit || ''} onChange={(e) => update('registration_limit', parseInt(e.target.value))} /></div>
          <div><label className="text-sm font-medium">Prize Pool</label><Input value={form.prize_pool || ''} onChange={(e) => update('prize_pool', e.target.value)} placeholder="₹5,00,000" /></div>
          <div>
            <label className="text-sm font-medium">Prize Type</label>
            <Select value={form.prize_type} onValueChange={(v) => update('prize_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><label className="text-sm font-medium">Registration Button Text</label><Input value={form.registration_button_text || ''} onChange={(e) => update('registration_button_text', e.target.value)} /></div>
          <div><label className="text-sm font-medium">Registration URL (optional)</label><Input value={form.registration_external_url || ''} onChange={(e) => update('registration_external_url', e.target.value)} /></div>
          <div>
            <label className="text-sm font-medium">Publication Status</label>
            <Select value={form.publication_status} onValueChange={(v) => update('publication_status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Visibility & Eligibility</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            {(['student', 'corporate', 'university', 'public'] as const).map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm capitalize cursor-pointer">
                <Checkbox
                  checked={form.visibility?.[key] ?? false}
                  onChange={(e) => update('visibility', { ...form.visibility, [key]: e.target.checked })}
                />
                {key === 'public' ? 'Everyone (Public)' : key}
              </label>
            ))}
          </div>
          <div><label className="text-sm font-medium">Eligibility</label><Textarea value={form.eligibility || ''} onChange={(e) => update('eligibility', e.target.value)} rows={3} /></div>
          <div><label className="text-sm font-medium">About Organizer</label><Textarea value={form.about_organizer || ''} onChange={(e) => update('about_organizer', e.target.value)} rows={3} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Support Email</label><Input value={form.support_email || ''} onChange={(e) => update('support_email', e.target.value)} /></div>
            <div><label className="text-sm font-medium">Support Phone</label><Input value={form.support_phone || ''} onChange={(e) => update('support_phone', e.target.value)} /></div>
          </div>
          <div><label className="text-sm font-medium">Support Content</label><Textarea value={form.support_content || ''} onChange={(e) => update('support_content', e.target.value)} rows={2} /></div>
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>FAQs</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addFaq}><Plus className="w-4 h-4 mr-1" /> Add FAQ</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {(form.faqs || []).map((faq, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
              <Input placeholder="Question" value={faq.question} onChange={(e) => {
                const faqs = [...(form.faqs || [])]; faqs[i] = { ...faq, question: e.target.value }; update('faqs', faqs)
              }} />
              <Textarea placeholder="Answer" value={faq.answer} rows={2} onChange={(e) => {
                const faqs = [...(form.faqs || [])]; faqs[i] = { ...faq, answer: e.target.value }; update('faqs', faqs)
              }} />
              <Button type="button" variant="ghost" size="sm" className="text-red-500" onClick={() => update('faqs', (form.faqs || []).filter((_, j) => j !== i))}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Rounds */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Rounds</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addRound}><Plus className="w-4 h-4 mr-1" /> Add Round</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {(form.rounds || []).map((round, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
              <Input placeholder="Round Title" value={round.title} onChange={(e) => {
                const rounds = [...(form.rounds || [])]; rounds[i] = { ...round, title: e.target.value }; update('rounds', rounds)
              }} />
              <Textarea placeholder="Description" value={round.description || ''} rows={2} onChange={(e) => {
                const rounds = [...(form.rounds || [])]; rounds[i] = { ...round, description: e.target.value }; update('rounds', rounds)
              }} />
              <Button type="button" variant="ghost" size="sm" className="text-red-500" onClick={() => update('rounds', (form.rounds || []).filter((_, j) => j !== i))}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Rewards */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Rewards</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addReward}><Plus className="w-4 h-4 mr-1" /> Add Reward</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {(form.rewards || []).map((reward, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Title" value={reward.title} onChange={(e) => {
                  const rewards = [...(form.rewards || [])]; rewards[i] = { ...reward, title: e.target.value }; update('rewards', rewards)
                }} />
                <Input placeholder="Value (e.g. ₹50,000)" value={reward.value || ''} onChange={(e) => {
                  const rewards = [...(form.rewards || [])]; rewards[i] = { ...reward, value: e.target.value }; update('rewards', rewards)
                }} />
              </div>
              <Textarea placeholder="Description" value={reward.description || ''} rows={2} onChange={(e) => {
                const rewards = [...(form.rewards || [])]; rewards[i] = { ...reward, description: e.target.value }; update('rewards', rewards)
              }} />
              <Button type="button" variant="ghost" size="sm" className="text-red-500" onClick={() => update('rewards', (form.rewards || []).filter((_, j) => j !== i))}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving} size="lg">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {eventId ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  )
}
