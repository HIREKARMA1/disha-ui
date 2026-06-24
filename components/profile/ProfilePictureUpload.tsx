'use client'

import { useRef, useState } from 'react'
import { Camera, Upload, User, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WebcamCaptureModal } from '@/components/profile/WebcamCaptureModal'
import { cn } from '@/lib/utils'

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
const MAX_SIZE_MB = 5

interface ProfilePictureUploadProps {
  currentFile?: string | null
  onFileSelect: (file: File) => void
  onFileRemove?: () => void
  disabled?: boolean
  uploading?: boolean
  className?: string
}

export function ProfilePictureUpload({
  currentFile,
  onFileSelect,
  onFileRemove,
  disabled = false,
  uploading = false,
  className,
}: ProfilePictureUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [showWebcam, setShowWebcam] = useState(false)

  const validateAndSelect = (file: File) => {
    setError(null)

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please upload a JPG or PNG image only.')
      return
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image must be less than ${MAX_SIZE_MB}MB.`)
      return
    }

    onFileSelect(file)
  }

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      validateAndSelect(file)
    }
    event.target.value = ''
  }

  return (
    <div className={cn('space-y-4', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        disabled={disabled || uploading}
        onChange={handleFileInput}
      />

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg dark:border-gray-700">
          {currentFile ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentFile} alt="Profile preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white">
              <User className="h-10 w-10" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Profile Picture</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Upload from your device or capture using your webcam. JPG or PNG up to {MAX_SIZE_MB}MB.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={disabled || uploading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={disabled || uploading}
              onClick={() => setShowWebcam(true)}
              className="w-full sm:w-auto"
            >
              <Camera className="mr-2 h-4 w-4" />
              Capture Using Camera
            </Button>
          </div>

          {currentFile && onFileRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || uploading}
              onClick={onFileRemove}
              className="text-red-600 hover:text-red-700 dark:text-red-400"
            >
              Remove Image
            </Button>
          )}
        </div>
      </div>

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span>Uploading profile picture...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <WebcamCaptureModal
        isOpen={showWebcam}
        onClose={() => setShowWebcam(false)}
        onCapture={validateAndSelect}
      />
    </div>
  )
}
