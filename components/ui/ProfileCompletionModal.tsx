'use client'

import Link from 'next/link'
import { Pencil, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  PROFILE_COMPLETION_MESSAGE,
  STUDENT_PROFILE_PATH,
} from '@/lib/profileCompletion'

interface ProfileCompletionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileCompletionModal({ isOpen, onClose }: ProfileCompletionModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto" role="presentation">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-[1px] transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-completion-title"
          aria-describedby="profile-completion-desc"
          className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-4 pt-5 text-left shadow-2xl transition-all dark:border-white/10 dark:bg-[#151b2b] sm:my-8 sm:p-6"
        >
          <button
            type="button"
            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-white/10 dark:hover:text-white"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 sm:mx-0">
              <Pencil className="h-6 w-6 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3
                id="profile-completion-title"
                className="text-lg font-semibold leading-6 text-gray-900 dark:text-white"
              >
                Complete your profile
              </h3>
              <div className="mt-2 space-y-2">
                <p
                  id="profile-completion-desc"
                  className="text-sm leading-relaxed text-gray-600 dark:text-gray-300"
                >
                  {PROFILE_COMPLETION_MESSAGE}
                </p>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  Finish required Basic Info fields and upload your resume to reach 75% and apply
                  for jobs.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full rounded-lg sm:w-auto"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              type="button"
              asChild
              className="h-10 w-full rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 sm:w-auto"
            >
              <Link href={STUDENT_PROFILE_PATH} onClick={onClose}>
                Update Profile
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
