"use client"

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function PracticeTestSubpageLayout({
  title,
  subtitle,
  icon,
  backHref = '/dashboard/student/mock-tests',
  backLabel = 'Back to Practice Tests',
  actions,
  children,
}: {
  title: string
  subtitle?: string
  icon?: ReactNode
  backHref?: string
  backLabel?: string
  actions?: ReactNode
  children: ReactNode
}) {
  const router = useRouter()

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => router.push(backHref)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {backLabel}
        </Button>
        {actions}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-white to-primary-50/30 p-6 shadow-sm dark:border-[#1A2233] dark:from-[#141A29] dark:via-[#141A29] dark:to-primary-950/20 sm:p-8">
        <div className="flex items-start gap-4">
          {icon ? (
            <div className="rounded-xl bg-primary-50 p-3 shadow-sm ring-1 ring-primary-100 dark:bg-primary-900/30 dark:ring-primary-800/50">
              {icon}
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {children}
    </div>
  )
}

export function PracticeTestErrorState({
  title,
  message,
  backHref = '/dashboard/student/mock-tests',
  backLabel = 'Return to Practice Tests',
}: {
  title: string
  message: string
  backHref?: string
  backLabel?: string
}) {
  return (
    <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50 to-white p-6 dark:border-amber-800/50 dark:from-amber-950/30 dark:to-[#141A29]">
      <p className="font-semibold text-amber-950 dark:text-amber-100">{title}</p>
      <p className="mt-1 text-sm text-amber-900/90 dark:text-amber-200/90">{message}</p>
      <Button asChild className="mt-4 rounded-xl" variant="outline">
        <Link href={backHref}>{backLabel}</Link>
      </Button>
    </div>
  )
}
