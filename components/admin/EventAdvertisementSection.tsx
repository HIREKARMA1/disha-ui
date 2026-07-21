"use client"

import { EventImageUpload } from '@/components/admin/EventImageUpload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { advertisementService } from '@/services/advertisementService'
import type { Advertisement, AdvertisementPlacement } from '@/types/advertisement'
import { toast } from 'react-hot-toast'

export interface EventAdFormState {
  enabled: boolean
  id?: string
  title: string
  description: string
  image_url: string
  button_text: string
  redirect_url: string
  display_order: number
  is_active: boolean
  start_date: string
  end_date: string
}

export function defaultEventAdForm(overrides?: Partial<EventAdFormState>): EventAdFormState {
  return {
    enabled: false,
    title: '',
    description: '',
    image_url: '',
    button_text: 'Learn More',
    redirect_url: '',
    display_order: 0,
    is_active: true,
    start_date: '',
    end_date: '',
    ...overrides,
  }
}

export function adFromApi(ad: Advertisement): EventAdFormState {
  return {
    enabled: true,
    id: ad.id,
    title: ad.title,
    description: ad.description,
    image_url: ad.image_url,
    button_text: ad.button_text || 'Learn More',
    redirect_url: ad.redirect_url || '',
    display_order: ad.display_order,
    is_active: ad.is_active,
    start_date: ad.start_date?.slice(0, 16) || '',
    end_date: ad.end_date?.slice(0, 16) || '',
  }
}

export function validateEventAd(form: EventAdFormState, label: string): string | null {
  if (!form.enabled) return null
  if (!form.title.trim()) return `${label}: title is required`
  if (!form.description.trim()) return `${label}: description is required`
  if (!form.image_url.trim()) return `${label}: image is required`
  if (Number.isNaN(form.display_order)) return `${label}: display order must be numeric`
  return null
}

export async function saveEventAd(params: {
  form: EventAdFormState
  placement: AdvertisementPlacement
  eventId: string
}): Promise<void> {
  const { form, placement, eventId } = params
  if (!form.enabled) return

  const emptyToNull = (v: string) => (v.trim() ? v.trim() : null)
  const body = {
    title: form.title.trim(),
    description: form.description.trim(),
    image_url: form.image_url,
    button_text: emptyToNull(form.button_text) || 'Learn More',
    redirect_url: emptyToNull(form.redirect_url),
    placement,
    display_order: form.display_order || 0,
    page_type: 'events',
    is_active: form.is_active,
    start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
    end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
    event_id: eventId,
  }

  if (form.id) {
    await advertisementService.update(form.id, body)
  } else {
    await advertisementService.create(body)
  }
}

interface EventAdvertisementSectionProps {
  title: string
  description?: string
  placementLabel: string
  value: EventAdFormState
  onChange: (next: EventAdFormState) => void
  uploading: boolean
  onUploadingChange: (busy: boolean) => void
}

export function EventAdvertisementSection({
  title,
  description,
  placementLabel,
  value,
  onChange,
  uploading,
  onUploadingChange,
}: EventAdvertisementSectionProps) {
  const update = <K extends keyof EventAdFormState>(key: K, next: EventAdFormState[K]) => {
    onChange({ ...value, [key]: next })
  }

  const handleUpload = async (file: File) => {
    onUploadingChange(true)
    try {
      const result = await advertisementService.uploadImage(file)
      update('image_url', result.file_url)
      toast.success(`${placementLabel} image uploaded`)
    } catch {
      toast.error(`${placementLabel} image upload failed`)
    } finally {
      onUploadingChange(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={value.enabled}
            onChange={(e) => update('enabled', e.target.checked)}
          />
          Create Advertisement
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Placement is fixed to <span className="font-medium text-gray-700 dark:text-gray-300">{placementLabel}</span>.
        </p>

        {value.enabled ? (
          <div className="space-y-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            <div>
              <label className="text-sm font-medium">Advertisement Title *</label>
              <Input
                value={value.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="Upcoming Hackathon"
                required={value.enabled}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Advertisement Description *</label>
              <Textarea
                value={value.description}
                onChange={(e) => update('description', e.target.value)}
                rows={3}
                required={value.enabled}
              />
            </div>

            <EventImageUpload
              label="Advertisement Image *"
              hint="JPG, PNG, or WEBP. Max 5MB."
              value={value.image_url}
              onChange={(url) => update('image_url', url)}
              onUpload={handleUpload}
              uploading={uploading}
              aspect="banner"
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">CTA Button Text</label>
                <Input
                  value={value.button_text}
                  onChange={(e) => update('button_text', e.target.value)}
                  placeholder="Learn More"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Redirect URL</label>
                <Input
                  value={value.redirect_url}
                  onChange={(e) => update('redirect_url', e.target.value)}
                  placeholder="https://…"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Display Order</label>
                <Input
                  type="number"
                  min={0}
                  value={value.display_order}
                  onChange={(e) => update('display_order', parseInt(e.target.value || '0', 10))}
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={value.is_active}
                    onChange={(e) => update('is_active', e.target.checked)}
                  />
                  Active Status
                </label>
              </div>
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="datetime-local"
                  value={value.start_date}
                  onChange={(e) => update('start_date', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="datetime-local"
                  value={value.end_date}
                  onChange={(e) => update('end_date', e.target.value)}
                />
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
