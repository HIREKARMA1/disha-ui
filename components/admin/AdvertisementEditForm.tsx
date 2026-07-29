"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { EventImageUpload } from '@/components/admin/EventImageUpload'
import { EventManagementSubNav } from '@/components/dashboard/admin/events/EventManagementNav'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { advertisementService } from '@/services/advertisementService'
import {
  ADVERTISEMENT_PLACEMENTS,
  type AdvertisementPlacement,
} from '@/types/advertisement'

interface AdvertisementEditFormProps {
  advertisementId?: string
}

export function AdvertisementEditForm({ advertisementId }: AdvertisementEditFormProps) {
  const router = useRouter()
  const isEdit = !!advertisementId
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    image_url: '',
    button_text: 'Learn More',
    redirect_url: '',
    placement: 'left_sidebar' as AdvertisementPlacement,
    display_order: 0,
    is_active: true,
    start_date: '',
    end_date: '',
  })

  useEffect(() => {
    if (!advertisementId) return
    advertisementService
      .getById(advertisementId)
      .then((ad) => {
        const placement: AdvertisementPlacement =
          ad.placement === 'right_sidebar' ? 'right_sidebar' : 'left_sidebar'
        setForm({
          title: ad.title,
          description: ad.description,
          image_url: ad.image_url,
          button_text: ad.button_text || 'Learn More',
          redirect_url: ad.redirect_url || '',
          placement,
          display_order: ad.display_order,
          is_active: ad.is_active,
          start_date: ad.start_date?.slice(0, 16) || '',
          end_date: ad.end_date?.slice(0, 16) || '',
        })
      })
      .catch(() => toast.error('Failed to load advertisement'))
      .finally(() => setLoading(false))
  }, [advertisementId])

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const result = await advertisementService.uploadImage(file)
      update('image_url', result.file_url)
      toast.success('Image uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim() || !form.image_url.trim()) {
      toast.error('Title, description, and image are required')
      return
    }
    setSaving(true)
    try {
      const emptyToNull = (v: string) => (v.trim() ? v.trim() : null)
      const body = {
        title: form.title.trim(),
        description: form.description.trim(),
        image_url: form.image_url,
        button_text: emptyToNull(form.button_text) || 'Learn More',
        redirect_url: emptyToNull(form.redirect_url),
        placement: form.placement,
        display_order: form.display_order || 0,
        page_type: 'events',
        is_active: form.is_active,
        start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
        event_id: null,
      }
      if (isEdit && advertisementId) {
        await advertisementService.update(advertisementId, body)
        toast.success('Advertisement updated')
      } else {
        await advertisementService.create(body)
        toast.success('Advertisement created')
      }
      router.push('/dashboard/admin/events/advertisements')
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { detail?: string } } })?.response?.data
      toast.error(typeof data?.detail === 'string' ? data.detail : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <EventManagementSubNav />
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Advertisement' : 'New Advertisement'}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Independent sidebar promotions for the Events page. Not linked to contests.
            </p>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Advertisement Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={3}
                required
              />
            </div>
            <EventImageUpload
              label="Image *"
              hint="JPG, PNG, or WEBP. Max 5MB."
              value={form.image_url}
              onChange={(url) => update('image_url', url)}
              onUpload={handleUpload}
              uploading={uploading}
              aspect="banner"
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">CTA Button Text</label>
                <Input
                  value={form.button_text}
                  onChange={(e) => update('button_text', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Redirect URL</label>
                <Input
                  value={form.redirect_url}
                  onChange={(e) => update('redirect_url', e.target.value)}
                  placeholder="https://…"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Placement *</label>
                <Select
                  value={form.placement}
                  onValueChange={(v) => update('placement', v as AdvertisementPlacement)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADVERTISEMENT_PLACEMENTS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Display Order</label>
                <Input
                  type="number"
                  min={0}
                  value={form.display_order}
                  onChange={(e) => update('display_order', parseInt(e.target.value || '0', 10))}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Lowest order wins when multiple ads share a placement.
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="datetime-local"
                  value={form.start_date}
                  onChange={(e) => update('start_date', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="datetime-local"
                  value={form.end_date}
                  onChange={(e) => update('end_date', e.target.value)}
                />
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={form.is_active}
                onChange={(e) => update('is_active', e.target.checked)}
              />
              Active
            </label>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
