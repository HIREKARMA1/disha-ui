'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { buildStudentExamTakeUrl } from '@/lib/assessmentLinks'
import { Copy, Check, Link2 } from 'lucide-react'

interface StudentExamLinkSectionProps {
  assessmentId: string
  /** When false, hide the block (e.g. assessment not synced). */
  show: boolean
  compact?: boolean
}

export function StudentExamLinkSection({
  assessmentId,
  show,
  compact = false,
}: StudentExamLinkSectionProps) {
  const [copied, setCopied] = useState(false)

  if (!show) return null

  const url = buildStudentExamTakeUrl(assessmentId)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  if (compact) {
    return (
      <div className="rounded-lg border border-indigo-200 bg-indigo-50/80 dark:border-indigo-800 dark:bg-indigo-950/40 p-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-1">
            <Link2 className="h-3.5 w-3.5" />
            Student exam link
          </span>
          <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={copy}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <p className="text-[11px] text-indigo-800/90 dark:text-indigo-300/90 break-all font-mono leading-snug">
          {url}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/50 dark:to-gray-900 dark:border-indigo-800 p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <div className="rounded-lg bg-indigo-600 p-2 text-white">
          <Link2 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Student exam link</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            Share this link with candidates. They must sign in or register as a student, then they can start the test
            in Solviq.
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
          {url}
        </div>
        <Button type="button" onClick={copy} className="shrink-0 bg-indigo-600 hover:bg-indigo-700">
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy link
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
