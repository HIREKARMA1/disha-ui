'use client'

import { useEffect, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EventImageUpload } from '@/components/admin/EventImageUpload'
import { campusDriveService, apiErrorMessage } from '@/services/campusDriveService'
import { corporateManagementService } from '@/services/corporateManagementService'
import type { CampusDriveCorporateSummary } from '@/types/campusDrive'
import { getErrorMessage } from '@/lib/error-handler'

interface CampusDriveNewCorporateModalProps {
  open: boolean
  onClose: () => void
  onCreated: (corporate: CampusDriveCorporateSummary) => void
}

export function CampusDriveNewCorporateModal({ open, onClose, onCreated }: CampusDriveNewCorporateModalProps) {
  const [companyName, setCompanyName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setCompanyName('')
    setLogoUrl('')
    setError(null)
  }, [open])

  if (!open) return null

  const handleSave = async () => {
    setError(null)
    if (!companyName.trim()) {
      setError('Corporate name is required')
      return
    }
    if (!logoUrl.trim()) {
      setError('Corporate logo is required')
      return
    }
    setSaving(true)
    try {
      const created = await corporateManagementService.createCorporateWithLogo(companyName, logoUrl)
      onCreated({
        id: created.id,
        company_name: created.company_name,
        company_logo: created.company_logo || logoUrl,
      })
      onClose()
    } catch (err) {
      setError(getErrorMessage(err as Error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-700 dark:bg-gray-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-corporate-title"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="new-corporate-title" className="text-lg font-semibold text-gray-900 dark:text-white">
            New Corporate
          </h2>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={saving}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-white">Corporate Name</label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Company name"
              className="mt-1"
            />
          </div>
          <EventImageUpload
            label="Corporate Logo"
            hint="JPG, PNG, or WEBP up to 5MB."
            value={logoUrl}
            onChange={setLogoUrl}
            uploading={uploading}
            aspect="logo"
            onUpload={async (file) => {
              setUploading(true)
              try {
                const result = await campusDriveService.uploadFile(file, 'logo')
                setLogoUrl(result.file_url)
              } catch (err) {
                throw new Error(apiErrorMessage(err, 'Logo upload failed'))
              } finally {
                setUploading(false)
              }
            }}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <p className="text-xs text-gray-500">
            An onboarding account is created using the admin corporate API. Email and phone are auto-generated; you can
            update them later from Corporate Management.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSave()} disabled={saving || uploading}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Add Corporate
          </Button>
        </div>
      </div>
    </div>
  )
}
