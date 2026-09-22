'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CAMPUS_DRIVE_NOT_FOR_UNIVERSITY_MESSAGE } from '@/lib/jobApplicationMessages'

interface CampusDriveInterestModalProps {
  isOpen: boolean
  onClose: () => void
  onStillInterested: () => void
  isSubmitting?: boolean
  message?: string
}

/**
 * Shown when a student is blocked by campus-drive university eligibility.
 * Close → dismiss only. Still I'm Interested → create admin request.
 */
export function CampusDriveInterestModal({
  isOpen,
  onClose,
  onStillInterested,
  isSubmitting = false,
  message = CAMPUS_DRIVE_NOT_FOR_UNIVERSITY_MESSAGE,
}: CampusDriveInterestModalProps) {
  if (!isOpen) return null

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
          aria-labelledby="campus-drive-interest-title"
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

          <h2
            id="campus-drive-interest-title"
            className="pr-8 text-base font-semibold leading-snug text-gray-900 dark:text-white sm:text-lg"
          >
            {message}
          </h2>

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
                "Still I'm Interested"
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
