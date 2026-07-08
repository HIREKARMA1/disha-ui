"use client"

import { useRef } from 'react'
import { Upload, Loader2, X, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024

interface EventImageUploadProps {
  label: string
  hint?: string
  value?: string
  onChange: (url: string) => void
  onUpload: (file: File) => Promise<void>
  uploading?: boolean
  aspect?: 'banner' | 'logo'
}

export function EventImageUpload({
  label,
  hint,
  value,
  onChange,
  onUpload,
  uploading = false,
  aspect = 'banner',
}: EventImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    const type = file.type.toLowerCase()
    if (!ACCEPTED.includes(type) && !file.name.match(/\.(jpe?g|png|webp)$/i)) {
      throw new Error('Only JPG, JPEG, PNG, and WEBP files are allowed')
    }
    if (file.size > MAX_SIZE) {
      throw new Error('File size must be less than 5MB')
    }
    await onUpload(file)
  }

  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium text-gray-900 dark:text-white">{label}</label>
        {hint && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{hint}</p>}
      </div>

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className={cn(
            'relative w-full overflow-hidden',
            aspect === 'banner' ? 'aspect-video' : 'aspect-square max-w-[140px]'
          )}>
            <img src={value} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
                Replace
              </Button>
              <Button type="button" variant="destructive" size="sm" onClick={() => onChange('')} disabled={uploading}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            'w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600',
            'hover:border-primary-400 dark:hover:border-primary-500 transition-colors',
            'flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400',
            aspect === 'banner' ? 'aspect-video' : 'aspect-square max-w-[140px] h-[140px]'
          )}
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          ) : (
            <>
              <ImageIcon className="w-8 h-8" />
              <span className="text-xs font-medium">Click to upload</span>
              <span className="text-[10px]">JPG, PNG, WEBP · Max 5MB</span>
            </>
          )}
        </button>
      )}

      <div className="flex gap-2">
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste image URL"
          className="text-sm"
        />
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleFile(file).catch((err: Error) => toast.error(err.message || 'Upload failed'))
          }
          e.target.value = ''
        }}
      />
    </div>
  )
}
