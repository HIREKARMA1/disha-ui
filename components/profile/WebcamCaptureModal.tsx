'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Camera, RotateCcw, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const MAX_FILE_SIZE_MB = 5

interface WebcamCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (file: File) => void
}

export function WebcamCaptureModal({ isOpen, onClose, onCapture }: WebcamCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const startCamera = useCallback(async () => {
    setError(null)
    setIsStarting(true)
    setCapturedDataUrl(null)

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera is not supported on this device or browser.')
      }

      stopCamera()
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access and try again.'
          : err instanceof Error
            ? err.message
            : 'Unable to access the camera.'
      setError(message)
    } finally {
      setIsStarting(false)
    }
  }, [stopCamera])

  useEffect(() => {
    if (isOpen) {
      void startCamera()
    } else {
      stopCamera()
      setCapturedDataUrl(null)
      setError(null)
    }

    return () => {
      stopCamera()
    }
  }, [isOpen, startCamera, stopCamera])

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow || 'auto'
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, isSaving, onClose])

  const handleCapture = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !video.videoWidth) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    if (!context) return

    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    setCapturedDataUrl(canvas.toDataURL('image/jpeg', 0.92))
    stopCamera()
  }

  const handleRetake = () => {
    setCapturedDataUrl(null)
    void startCamera()
  }

  const handleSave = async () => {
    if (!capturedDataUrl) return

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(capturedDataUrl)
      const blob = await response.blob()

      if (blob.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        throw new Error(`Captured image must be less than ${MAX_FILE_SIZE_MB}MB.`)
      }

      const file = new File([blob], `profile-${Date.now()}.jpg`, { type: 'image/jpeg' })
      onCapture(file)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save captured image.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!mounted) {
    return null
  }

  const modalContent = (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[9999]" role="dialog" aria-modal="true" aria-labelledby="webcam-modal-title">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isSaving && onClose()}
            aria-hidden="true"
          />

          <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto relative flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <h2 id="webcam-modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                  Capture Profile Picture
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  disabled={isSaving}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
                {error && (
                  <div className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                    {error}
                  </div>
                )}

                <div className="relative flex min-h-[200px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-950 dark:border-gray-700">
                  {capturedDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={capturedDataUrl}
                      alt="Captured preview"
                      className="max-h-[min(50vh,420px)] w-full object-contain"
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="max-h-[min(50vh,420px)] w-full object-contain"
                    />
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                  <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>

                  {capturedDataUrl ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRetake}
                        disabled={isSaving || isStarting}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Retake
                      </Button>
                      <Button type="button" onClick={handleSave} loading={isSaving}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Image
                      </Button>
                    </>
                  ) : (
                    <Button type="button" onClick={handleCapture} disabled={isStarting || !!error}>
                      <Camera className="mr-2 h-4 w-4" />
                      Capture Image
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      ) : null}
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}
