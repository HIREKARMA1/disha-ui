'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Crown, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CAMPUS_DRIVE_NOT_FOR_UNIVERSITY_MESSAGE } from '@/lib/jobApplicationMessages'

interface CampusDriveInterestModalProps {
  isOpen: boolean
  onClose: () => void
  onStillInterested: () => void
  isSubmitting?: boolean
  /** Optional title — used by Premium Users layout; Campus Drive omits this. */
  title?: string
  message?: string
  /** Default keeps Campus Drive copy; Premium flow uses "I'm Still Interested". */
  confirmLabel?: string
}

/**
 * Shared interest modal for Campus Drive and Premium Users Job Requests.
 * Close → dismiss only. Still Interested → create admin Job Request.
 * Campus Drive: message-only body (unchanged).
 * Premium: title + description + subtle crown indicator.
 */
export function CampusDriveInterestModal({
  isOpen,
  onClose,
  onStillInterested,
  isSubmitting = false,
  title,
  message = CAMPUS_DRIVE_NOT_FOR_UNIVERSITY_MESSAGE,
  confirmLabel = "Still I'm Interested",
}: CampusDriveInterestModalProps) {
  if (!isOpen) return null

  const isPremiumLayout = Boolean(title)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 dark:bg-black/70"
          onClick={isSubmitting ? undefined : onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-700 dark:bg-[#151b2b] sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="job-interest-modal-title"
          aria-describedby={isPremiumLayout ? 'job-interest-modal-desc' : undefined}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-white/10 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {isPremiumLayout ? (
            <div className="pr-8">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                <Crown className="h-5 w-5" aria-hidden />
              </div>
              <h2
                id="job-interest-modal-title"
                className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white sm:text-xl"
              >
                {title}
              </h2>
              <p
                id="job-interest-modal-desc"
                className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300"
              >
                {message}
              </p>
            </div>
          ) : (
            <h2
              id="job-interest-modal-title"
              className="pr-8 text-base font-semibold leading-snug text-gray-900 dark:text-white sm:text-lg"
            >
              {message}
            </h2>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={onStillInterested}
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                confirmLabel
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
