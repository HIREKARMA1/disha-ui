'use client'

import Link from 'next/link'
import { ArrowRight, Briefcase, CheckCircle2, Sparkles, UserRound, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { STUDENT_PROFILE_PATH } from '@/lib/profileCompletion'

interface PostQuickApplySkillsNudgeDialogProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * After Quick Apply success: clear next-step nudge to Profile → Skills,
 * with a plain benefit: skills unlock ranked job suggestions on Live Jobs.
 * Mobile: bottom sheet + scrollable body; desktop: centered modal.
 */
export function PostQuickApplySkillsNudgeDialog({
  isOpen,
  onClose,
}: PostQuickApplySkillsNudgeDialogProps) {
  if (!isOpen) return null

  const profileSkillsHref = `${STUDENT_PROFILE_PATH}?section=skills`

  return (
    <div className="fixed inset-0 z-[210] overflow-y-auto" role="presentation">
      <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-[1px]"
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-apply-nudge-title"
          aria-describedby="quick-apply-nudge-desc"
          className="relative flex w-full max-w-md max-h-[min(92dvh,40rem)] transform flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#151b2b] sm:my-8 sm:max-h-[min(90vh,40rem)] sm:rounded-2xl"
        >
          <button
            type="button"
            className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-white/10 dark:hover:text-white"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="shrink-0 border-b border-gray-100 px-4 pb-3 pt-4 pr-12 dark:border-white/10 sm:px-5 sm:pt-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 sm:h-11 sm:w-11">
                <Sparkles
                  className="h-4 w-4 text-emerald-600 dark:text-emerald-400 sm:h-5 sm:w-5"
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 sm:text-[11px]">
                  Application submitted
                </p>
                <h3
                  id="quick-apply-nudge-title"
                  className="mt-0.5 text-base font-semibold leading-snug text-gray-900 dark:text-white sm:text-lg"
                >
                  You&apos;re at ~75% — add skills next
                </h3>
              </div>
            </div>
          </div>

          <div
            id="quick-apply-nudge-desc"
            className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5"
          >
            <p className="rounded-xl border border-sky-200/80 bg-sky-50/90 px-3 py-2.5 text-sm font-medium leading-relaxed text-sky-950 dark:border-sky-500/30 dark:bg-sky-950/40 dark:text-sky-100">
              Add skills once → on{' '}
              <span className="font-semibold">Live Jobs</span> we&apos;ll show job suggestions
              that match you, with better-fit roles first.
            </p>

            <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <li className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50/80 px-2.5 py-2 dark:border-white/10 dark:bg-white/[0.03]">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  1
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-xs font-semibold text-gray-900 dark:text-white">
                    <UserRound className="h-3 w-3 shrink-0" aria-hidden="true" />
                    Add skills
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                    In Profile → Skills
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50/80 px-2.5 py-2 dark:border-white/10 dark:bg-white/[0.03]">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  2
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-xs font-semibold text-gray-900 dark:text-white">
                    <Briefcase className="h-3 w-3 shrink-0" aria-hidden="true" />
                    See matches
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                    On Live Jobs
                  </p>
                </div>
              </li>
            </ol>

            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              Next: open your{' '}
              <span className="font-semibold text-gray-900 dark:text-white">Profile</span>, go to
              the{' '}
              <span className="font-semibold text-gray-900 dark:text-white">Skills</span> tab, and
              add these three:
            </p>

            <ul className="space-y-2 rounded-xl border border-gray-200 bg-gray-50/90 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.04]">
              {['Technical skills', 'Soft skills', 'Preferred industry'].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-100"
                >
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 text-sky-500 dark:text-sky-400"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="shrink-0 space-y-2.5 border-t border-gray-100 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-white/10 sm:space-y-3 sm:px-5 sm:pb-4">
            <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              One tap below opens Profile → Skills for you.
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full flex-1 rounded-lg sm:h-10"
                onClick={onClose}
              >
                Maybe later
              </Button>
              <Button
                type="button"
                className="h-11 w-full flex-1 rounded-lg bg-blue-600 hover:bg-blue-500 sm:h-10"
                asChild
              >
                <Link
                  href={profileSkillsHref}
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-1.5 whitespace-normal text-center text-sm leading-tight"
                >
                  <span className="sm:hidden">Open Profile → Skills</span>
                  <span className="hidden sm:inline">Go to Profile → Skills</span>
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
