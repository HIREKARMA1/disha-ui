'use client'

import Link from 'next/link'
import { Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { STUDENT_PROFILE_PATH } from '@/lib/profileCompletion'

interface PostQuickApplySkillsNudgeDialogProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * After Quick Apply success: nudge users to add skills so matching jobs rank first.
 * Non-blocking — user can stay on Jobs.
 */
export function PostQuickApplySkillsNudgeDialog({
  isOpen,
  onClose,
}: PostQuickApplySkillsNudgeDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[210] overflow-y-auto" role="presentation">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-[1px]"
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-apply-nudge-title"
          className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-2xl dark:border-white/10 dark:bg-[#151b2b] sm:my-8 sm:p-6"
        >
          <button
            type="button"
            className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-white/10 dark:hover:text-white"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Header: icon vertically centered with title */}
          <div className="flex items-center gap-3 pr-10">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            </div>
            <h3
              id="quick-apply-nudge-title"
              className="min-w-0 flex-1 text-lg font-semibold leading-snug text-gray-900 dark:text-white"
            >
              Add your skills — see the right jobs first
            </h3>
          </div>

          <p className="mt-4 pl-0 text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:pl-14">
            Application submitted. Next, add your{' '}
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              technical skills
            </span>
            ,{' '}
            <span className="font-semibold text-gray-800 dark:text-gray-100">soft skills</span>
            , and{' '}
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              preferred industry
            </span>{' '}
            in Profile. We&apos;ll put{' '}
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              jobs that match your skills at the top
            </span>{' '}
            of your feed — so you spend less time scrolling and more time applying to roles that
            fit you.
          </p>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full rounded-lg sm:w-auto"
              onClick={onClose}
            >
              Maybe later
            </Button>
            <Button
              type="button"
              className="h-10 w-full rounded-lg bg-blue-600 hover:bg-blue-500 sm:w-auto"
              asChild
            >
              <Link href={`${STUDENT_PROFILE_PATH}?section=skills`} onClick={onClose}>
                Add my skills
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
