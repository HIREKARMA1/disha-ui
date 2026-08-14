'use client'

import { useState } from 'react'
import { Linkedin, Facebook, Instagram, Youtube, Globe } from 'lucide-react'
import { SiX } from 'react-icons/si'
import { Button } from '@/components/ui/button'
import { universityProfileService, type UniversityProfile } from '@/services/universityProfileService'
import {
  isValidHttpUrl,
  mergeCorpExtMeta,
  normalizeUrl,
  parseCorpExtMeta,
  type CorporateSocialLinks,
} from '@/lib/corporateProfileMeta'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

function XIcon({ className }: { className?: string }) {
  return <SiX className={className} aria-hidden />
}

const inputClass =
  'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1520] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/40'

interface UniversitySocialLinksEditorProps {
  profile: UniversityProfile
  onSaved: (updated: UniversityProfile) => void
  onCancel: () => void
}

export function UniversitySocialLinksEditor({
  profile,
  onSaved,
  onCancel,
}: UniversitySocialLinksEditorProps) {
  const meta = parseCorpExtMeta(profile.bio)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<CorporateSocialLinks>({
    linkedin: meta.social_links?.linkedin || '',
    x: meta.social_links?.x || meta.social_links?.threads || '',
    facebook: meta.social_links?.facebook || '',
    instagram: meta.social_links?.instagram || '',
    youtube: meta.social_links?.youtube || '',
    website: meta.social_links?.website || profile.website_url || '',
  })

  const handleSave = async () => {
    const fields: (keyof CorporateSocialLinks)[] = [
      'linkedin',
      'x',
      'facebook',
      'instagram',
      'youtube',
      'website',
    ]
    for (const key of fields) {
      const value = form[key]
      if (value && !isValidHttpUrl(value)) {
        toast.error(`Invalid URL for ${key}`)
        return
      }
    }
    try {
      setSaving(true)
      const normalized: CorporateSocialLinks = {}
      fields.forEach((key) => {
        const value = form[key]
        if (value?.trim()) normalized[key] = normalizeUrl(value)
      })
      const bio = mergeCorpExtMeta(profile.bio, { social_links: normalized })
      const updated = await universityProfileService.updateProfile({ bio })
      onSaved(updated)
      toast.success('Social Links updated successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const fields: { key: keyof CorporateSocialLinks; label: string }[] = [
    { key: 'linkedin', label: 'LinkedIn URL' },
    { key: 'x', label: 'X URL' },
    { key: 'facebook', label: 'Facebook URL' },
    { key: 'instagram', label: 'Instagram URL' },
    { key: 'youtube', label: 'YouTube URL' },
    { key: 'website', label: 'Website / Portfolio URL' },
  ]

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {field.label}
          </label>
          <input
            value={form[field.key] || ''}
            onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
            className={inputClass}
            placeholder="https://..."
          />
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-white/[0.06]">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving} className="rounded-xl">
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}

export function UniversitySocialLinksDisplay({
  links,
  websiteUrl,
}: {
  links?: CorporateSocialLinks
  websiteUrl?: string
}) {
  const website = links?.website || websiteUrl
  const items = [
    { key: 'linkedin', href: links?.linkedin, icon: Linkedin, color: 'bg-[#0A66C2] text-white', label: 'LinkedIn' },
    { key: 'website', href: website, icon: Globe, color: 'bg-white text-gray-900 border border-gray-200 dark:border-white/20', label: 'Website' },
    { key: 'facebook', href: links?.facebook, icon: Facebook, color: 'bg-[#1877F2] text-white', label: 'Facebook' },
    { key: 'instagram', href: links?.instagram, icon: Instagram, color: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white', label: 'Instagram' },
    { key: 'youtube', href: links?.youtube, icon: Youtube, color: 'bg-[#FF0000] text-white', label: 'YouTube' },
    { key: 'x', href: links?.x || links?.threads, icon: XIcon, color: 'bg-black text-white', label: 'X' },
  ].filter((item) => !!item.href?.trim())

  if (items.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No social links configured yet.</p>
  }

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((social) => {
        const Icon = social.icon
        const href = normalizeUrl(social.href!)
        return (
          <a
            key={social.key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={social.label}
            className={cn(
              'w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md',
              social.color
            )}
          >
            <Icon className="w-5 h-5" />
          </a>
        )
      })}
    </div>
  )
}
