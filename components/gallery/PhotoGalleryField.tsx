'use client'

import { useRef, useState } from 'react'
import { ImageIcon, Loader2, Plus, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GalleryItem } from '@/types/contestEvent'

const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE_MB = 5
const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024

interface PhotoGalleryFieldProps {
  photos: GalleryItem[]
  onChange: (photos: GalleryItem[]) => void
  uploadFile: (file: File) => Promise<string>
}

function validateImage(file: File) {
  const type = file.type.toLowerCase()
  if (!ACCEPTED.includes(type) && !file.name.match(/\.(jpe?g|png|webp)$/i)) {
    throw new Error('Only JPG, JPEG, PNG, and WEBP files are allowed')
  }
  if (file.size > MAX_BYTES) {
    throw new Error(`File size must be ${MAX_SIZE_MB}MB or less`)
  }
}

export function PhotoGalleryField({ photos, onChange, uploadFile }: PhotoGalleryFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const addFiles = async (files: File[]) => {
    if (!files.length) return
    setUploading(true)
    const next = [...photos]
    const seen = new Set(next.map((photo) => photo.image_url))
    try {
      for (const file of files) {
        try {
          validateImage(file)
          const imageUrl = (await uploadFile(file)).trim()
          if (!imageUrl || seen.has(imageUrl)) continue
          seen.add(imageUrl)
          next.push({ image_url: imageUrl, sort_order: next.length })
        } catch (err) {
          const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
          const message = typeof detail === 'string'
            ? detail
            : err instanceof Error
              ? err.message
              : 'Upload failed'
          toast.error(message || 'Upload failed')
        }
      }
      onChange(next.map((photo, index) => ({ ...photo, sort_order: index })))
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gallery</CardTitle>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Optional. Add photos if you want them on the public page. JPG, PNG, WEBP · Max {MAX_SIZE_MB}MB each.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo, index) => (
              <div
                key={`${photo.image_url}-${index}`}
                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50"
              >
                <div className="flex aspect-[4/3] items-center justify-center">
                  <img
                    src={photo.image_url}
                    alt={`Gallery photo ${index + 1}`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute right-2 top-2 h-8 w-8 p-0"
                  disabled={uploading}
                  onClick={() =>
                    onChange(
                      photos
                        .filter((_, item) => item !== index)
                        .map((item, order) => ({ ...item, sort_order: order }))
                    )
                  }
                  aria-label={`Remove photo ${index + 1}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : photos.length > 0 ? (
            <Plus className="mr-2 h-4 w-4" />
          ) : (
            <ImageIcon className="mr-2 h-4 w-4" />
          )}
          {photos.length > 0 ? 'Add More Photos' : 'Add Photos'}
        </Button>

        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(event) => {
            const files = Array.from(event.target.files || [])
            event.target.value = ''
            void addFiles(files)
          }}
        />
      </CardContent>
    </Card>
  )
}
