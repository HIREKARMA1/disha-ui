'use client'

import { useEffect, useState } from 'react'
import {
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  FileText,
  Download,
  Trash2,
  Eye,
} from 'lucide-react'
import { SiX } from 'react-icons/si'
import { Button } from '@/components/ui/button'
import { LookupSelect } from '@/components/ui/lookup-select'
import { FileUpload } from '@/components/ui/file-upload'
import { useIndustries } from '@/hooks/useLookup'
import { corporateProfileService } from '@/services/corporateProfileService'
import type { CorporateProfile } from '@/types/corporate'
import {
  formatFileSize,
  isValidHttpUrl,
  mergeCorpExtMeta,
  normalizeUrl,
  parseCorpExtMeta,
  type CorporateDocumentMeta,
  type CorporateSocialLinks,
} from '@/lib/corporateProfileMeta'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

function XIcon({ className }: { className?: string }) {
  return <SiX className={className} aria-hidden />
}

const inputClass =
  'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1520] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/40'

interface SectionEditorProps {
  profile: CorporateProfile
  onSaved: (profile: CorporateProfile) => void
  onCancel: () => void
}

export function AboutCompanyEditor({ profile, onSaved, onCancel }: SectionEditorProps) {
  const { data: industries, loading: loadingIndustries, error: industriesError } = useIndustries({ limit: 1000 })
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    description: profile.description || '',
    industry: profile.industry || '',
    company_size: profile.company_size || '',
    founded_year: profile.founded_year?.toString() || '',
    company_type: profile.company_type || '',
  })

  const handleSave = async () => {
    try {
      setSaving(true)
      const updated = await corporateProfileService.updateProfile({
        description: form.description || undefined,
        industry: form.industry || undefined,
        company_size: form.company_size || undefined,
        company_type: form.company_type || undefined,
        founded_year: form.founded_year ? parseInt(form.founded_year, 10) : undefined,
      })
      onSaved(updated)
      toast.success('About Company updated successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className={inputClass}
          placeholder="Tell candidates about your company"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Industry</label>
          <LookupSelect
            value={form.industry}
            onChange={(v) => setForm((f) => ({ ...f, industry: v }))}
            data={industries}
            loading={loadingIndustries}
            placeholder="Select industry"
            error={industriesError || undefined}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company Size</label>
          <select
            value={form.company_size}
            onChange={(e) => setForm((f) => ({ ...f, company_size: e.target.value }))}
            className={inputClass}
          >
            <option value="">Select company size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="501-1000">501-1000 employees</option>
            <option value="1000+">1000+ employees</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Founded</label>
          <input
            type="number"
            min={1800}
            max={new Date().getFullYear()}
            value={form.founded_year}
            onChange={(e) => setForm((f) => ({ ...f, founded_year: e.target.value }))}
            className={inputClass}
            placeholder="e.g. 2010"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company Type</label>
          <select
            value={form.company_type}
            onChange={(e) => setForm((f) => ({ ...f, company_type: e.target.value }))}
            className={inputClass}
          >
            <option value="">Select company type</option>
            <option value="startup">Startup</option>
            <option value="mnc">MNC</option>
            <option value="sme">SME</option>
            <option value="enterprise">Enterprise</option>
            <option value="government">Government</option>
            <option value="ngo">NGO</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>
      <EditorActions saving={saving} onCancel={onCancel} onSave={handleSave} />
    </div>
  )
}

export function ContactInfoEditor({ profile, onSaved, onCancel }: SectionEditorProps) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    phone: profile.phone || '',
    website_url: profile.website_url || '',
    address: profile.address || '',
    contact_person: profile.contact_person || '',
    contact_designation: profile.contact_designation || '',
  })

  const handleSave = async () => {
    if (form.phone && form.phone.replace(/\D/g, '').length !== 10) {
      toast.error('Phone number must be exactly 10 digits')
      return
    }
    if (form.website_url && !isValidHttpUrl(form.website_url)) {
      toast.error('Please enter a valid website URL')
      return
    }
    try {
      setSaving(true)
      const updated = await corporateProfileService.updateProfile({
        phone: form.phone || undefined,
        website_url: form.website_url ? normalizeUrl(form.website_url) : undefined,
        address: form.address || undefined,
        contact_person: form.contact_person || undefined,
        contact_designation: form.contact_designation || undefined,
      })
      onSaved(updated)
      toast.success('Contact Information updated successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
        <input value={profile.email} disabled className={cn(inputClass, 'opacity-60 cursor-not-allowed')} />
        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
          <input
            value={form.phone}
            onChange={(e) =>
              setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))
            }
            className={inputClass}
            placeholder="10-digit mobile number"
            maxLength={10}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Website</label>
          <input
            value={form.website_url}
            onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))}
            className={inputClass}
            placeholder="https://www.company.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contact Person</label>
          <input
            value={form.contact_person}
            onChange={(e) => setForm((f) => ({ ...f, contact_person: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Designation</label>
          <input
            value={form.contact_designation}
            onChange={(e) => setForm((f) => ({ ...f, contact_designation: e.target.value }))}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Head Office</label>
        <textarea
          rows={2}
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          className={inputClass}
          placeholder="Company head office address"
        />
      </div>
      <EditorActions saving={saving} onCancel={onCancel} onSave={handleSave} />
    </div>
  )
}

export function BusinessDetailsEditor({ profile, onSaved, onCancel }: SectionEditorProps) {
  const { data: industries, loading: loadingIndustries, error: industriesError } = useIndustries({ limit: 1000 })
  const meta = parseCorpExtMeta(profile.bio)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    gst_number: meta.gst_number || '',
    pan_number: meta.pan_number || '',
    registration_number: meta.registration_number || '',
    date_of_incorporation: meta.date_of_incorporation || (profile.founded_year ? `${profile.founded_year}-01-01` : ''),
    company_type: profile.company_type || '',
    industry: profile.industry || '',
    company_size: profile.company_size || '',
  })

  const handleSave = async () => {
    if (!form.company_type && !form.industry && !form.company_size) {
      toast.error('Please fill at least Company Type, Industry, or Company Size')
      return
    }
    try {
      setSaving(true)
      const foundedYear = form.date_of_incorporation
        ? parseInt(form.date_of_incorporation.slice(0, 4), 10)
        : undefined
      const bio = mergeCorpExtMeta(profile.bio, {
        gst_number: form.gst_number.trim() || undefined,
        pan_number: form.pan_number.trim().toUpperCase() || undefined,
        registration_number: form.registration_number.trim() || undefined,
        date_of_incorporation: form.date_of_incorporation || undefined,
      })
      const updated = await corporateProfileService.updateProfile({
        bio,
        company_type: form.company_type || undefined,
        industry: form.industry || undefined,
        company_size: form.company_size || undefined,
        founded_year: foundedYear && !Number.isNaN(foundedYear) ? foundedYear : undefined,
      })
      onSaved(updated)
      toast.success('Business Details updated successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">GST Number</label>
          <input
            value={form.gst_number}
            onChange={(e) => setForm((f) => ({ ...f, gst_number: e.target.value.toUpperCase() }))}
            className={inputClass}
            placeholder="e.g. 22AAAAA0000A1Z5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">PAN Number</label>
          <input
            value={form.pan_number}
            onChange={(e) => setForm((f) => ({ ...f, pan_number: e.target.value.toUpperCase().slice(0, 10) }))}
            className={inputClass}
            placeholder="e.g. ABCDE1234F"
            maxLength={10}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Registration Number
          </label>
          <input
            value={form.registration_number}
            onChange={(e) => setForm((f) => ({ ...f, registration_number: e.target.value }))}
            className={inputClass}
            placeholder="Company registration number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Date of Incorporation
          </label>
          <input
            type="date"
            value={form.date_of_incorporation}
            onChange={(e) => setForm((f) => ({ ...f, date_of_incorporation: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company Type</label>
          <select
            value={form.company_type}
            onChange={(e) => setForm((f) => ({ ...f, company_type: e.target.value }))}
            className={inputClass}
          >
            <option value="">Select company type</option>
            <option value="startup">Startup</option>
            <option value="mnc">MNC</option>
            <option value="sme">SME</option>
            <option value="enterprise">Enterprise</option>
            <option value="government">Government</option>
            <option value="ngo">NGO</option>
            <option value="private">Private</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Industry</label>
          <LookupSelect
            value={form.industry}
            onChange={(v) => setForm((f) => ({ ...f, industry: v }))}
            data={industries}
            loading={loadingIndustries}
            placeholder="Select industry"
            error={industriesError || undefined}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company Size</label>
          <select
            value={form.company_size}
            onChange={(e) => setForm((f) => ({ ...f, company_size: e.target.value }))}
            className={inputClass}
          >
            <option value="">Select company size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="501-1000">501-1000 employees</option>
            <option value="1000+">1000+ employees</option>
          </select>
        </div>
      </div>
      <EditorActions saving={saving} onCancel={onCancel} onSave={handleSave} />
    </div>
  )
}

export function SocialLinksEditor({ profile, onSaved, onCancel }: SectionEditorProps) {
  const meta = parseCorpExtMeta(profile.bio)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<CorporateSocialLinks>({
    linkedin: meta.social_links?.linkedin || '',
    x: meta.social_links?.x || meta.social_links?.threads || '',
    facebook: meta.social_links?.facebook || '',
    instagram: meta.social_links?.instagram || '',
    youtube: meta.social_links?.youtube || '',
  })

  const handleSave = async () => {
    const fields: (keyof CorporateSocialLinks)[] = [
      'linkedin',
      'x',
      'facebook',
      'instagram',
      'youtube',
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
      // Preserve any previously saved website social link if present
      if (meta.social_links?.website) {
        normalized.website = meta.social_links.website
      }
      const bio = mergeCorpExtMeta(profile.bio, { social_links: normalized })
      const updated = await corporateProfileService.updateProfile({ bio } as any)
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
      <EditorActions saving={saving} onCancel={onCancel} onSave={handleSave} />
    </div>
  )
}

export function DocumentsEditor({ profile, onSaved, onCancel }: SectionEditorProps) {
  const meta = parseCorpExtMeta(profile.bio)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [docs, setDocs] = useState<CorporateDocumentMeta[]>(() => buildDocumentList(profile, meta.documents))

  useEffect(() => {
    setDocs(buildDocumentList(profile, parseCorpExtMeta(profile.bio).documents))
  }, [profile])

  const persistDocs = async (nextDocs: CorporateDocumentMeta[], certificateUrl?: string | null) => {
    setSaving(true)
    try {
      const bio = mergeCorpExtMeta(profile.bio, { documents: nextDocs.filter((d) => d.id !== 'mca_gst' && d.id !== 'logo') })
      const payload: Record<string, unknown> = { bio }
      if (certificateUrl !== undefined) {
        payload.mca_gst_certificate = certificateUrl || ''
      }
      const updated = await corporateProfileService.updateProfile(payload as any)
      onSaved(updated)
      toast.success('Documents updated successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save documents')
    } finally {
      setSaving(false)
    }
  }

  const handleCertificateUpload = async (file: File) => {
    try {
      setUploading(true)
      const res = await corporateProfileService.uploadCertificate(file)
      const url = res.file_url
      const doc: CorporateDocumentMeta = {
        id: 'mca_gst',
        name: file.name || 'Company Certificate.pdf',
        url,
        type: 'MCA / GST Certificate',
        size: formatFileSize(file.size),
        uploaded_at: new Date().toISOString(),
      }
      const next = [...docs.filter((d) => d.id !== 'mca_gst'), doc]
      setDocs(next)
      const bio = mergeCorpExtMeta(profile.bio, {
        documents: next.filter((d) => d.id !== 'mca_gst' && d.id !== 'logo'),
      })
      const updated = await corporateProfileService.updateProfile({
        bio,
        mca_gst_certificate: url,
      })
      onSaved(updated)
      toast.success('Certificate uploaded successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async (id: string) => {
    if (id === 'mca_gst') {
      const next = docs.filter((d) => d.id !== 'mca_gst')
      setDocs(next)
      await persistDocs(next, '')
      return
    }
    const next = docs.filter((d) => d.id !== id)
    setDocs(next)
    await persistDocs(next)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Upload / Replace MCA-GST Certificate
        </label>
        <FileUpload
          type="document"
          onFileSelect={handleCertificateUpload}
          onFileRemove={() => handleRemove('mca_gst')}
          currentFile={profile.mca_gst_certificate || ''}
          placeholder="Upload MCA/GST certificate (PDF)"
          disabled={uploading || saving}
        />
        {uploading && <p className="text-sm text-blue-500 mt-2">Uploading...</p>}
      </div>

      <div className="space-y-2">
        {docs.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No documents uploaded</p>
        ) : (
          docs.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} onRemove={() => handleRemove(doc.id)} disabled={saving} />
          ))
        )}
      </div>

      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl">
          Close
        </Button>
      </div>
    </div>
  )
}

export function SocialLinksDisplay({
  links,
}: {
  links?: CorporateSocialLinks
  websiteUrl?: string
}) {
  const items = [
    { key: 'linkedin', href: links?.linkedin, icon: Linkedin, color: 'bg-[#0A66C2] text-white', label: 'LinkedIn' },
    { key: 'x', href: links?.x || links?.threads, icon: XIcon, color: 'bg-black text-white', label: 'X' },
    { key: 'facebook', href: links?.facebook, icon: Facebook, color: 'bg-[#1877F2] text-white', label: 'Facebook' },
    { key: 'instagram', href: links?.instagram, icon: Instagram, color: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white', label: 'Instagram' },
    { key: 'youtube', href: links?.youtube, icon: Youtube, color: 'bg-[#FF0000] text-white', label: 'YouTube' },
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

export function DocumentRow({
  doc,
  onRemove,
  disabled,
}: {
  doc: CorporateDocumentMeta
  onRemove?: () => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/80 dark:bg-white/[0.03]">
      <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
        <FileText className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{doc.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {doc.type}
          {doc.uploaded_at
            ? ` · ${new Date(doc.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
            : ''}
          {doc.size ? ` · ${doc.size}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"
          title="Preview / Download"
        >
          <Eye className="w-4 h-4" />
        </a>
        <a
          href={doc.url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"
          title="Download"
        >
          <Download className="w-4 h-4" />
        </a>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 disabled:opacity-50"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

function buildDocumentList(
  profile: CorporateProfile,
  extra?: CorporateDocumentMeta[]
): CorporateDocumentMeta[] {
  const list: CorporateDocumentMeta[] = []
  if (profile.mca_gst_certificate) {
    const metaDoc = extra?.find((d) => d.id === 'mca_gst' || d.url === profile.mca_gst_certificate)
    list.push({
      id: 'mca_gst',
      name: metaDoc?.name || 'Company Certificate.pdf',
      url: profile.mca_gst_certificate,
      type: metaDoc?.type || 'MCA / GST Certificate',
      size: metaDoc?.size,
      uploaded_at: metaDoc?.uploaded_at || profile.updated_at || profile.created_at,
    })
  }
  if (extra) {
    extra.forEach((doc) => {
      if (doc.id === 'mca_gst' || doc.id === 'logo') return
      if (!doc.url) return
      list.push(doc)
    })
  }
  return list
}

function EditorActions({
  saving,
  onCancel,
  onSave,
}: {
  saving: boolean
  onCancel: () => void
  onSave: () => void
}) {
  return (
    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-white/[0.06]">
      <Button type="button" variant="outline" onClick={onCancel} disabled={saving} className="rounded-xl">
        Cancel
      </Button>
      <Button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  )
}

export { XIcon, buildDocumentList }
