'use client'

import { Brain, Clock } from 'lucide-react'
import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'

export default function StudentPracticePage() {
  return (
    <StudentDashboardLayout>
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/40">
            <Brain className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
            <Clock className="h-3.5 w-3.5" />
            Coming Soon
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Practice Module
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-base">
            Practice assessments and mock exams are under development. We&apos;re preparing a better
            experience to help you test your skills — stay tuned for updates.
          </p>
        </div>
      </div>
    </StudentDashboardLayout>
  )
}
