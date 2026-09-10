'use client'

import Link from 'next/link'
import { Briefcase, FileText, User, Brain } from 'lucide-react'
import { StudentSectionCard } from '@/components/student/ui/StudentSectionCard'
import { cn } from '@/lib/utils'

const actions = [
  {
    label: 'Update Profile',
    href: '/dashboard/student/profile',
    icon: User,
    iconWrap: 'bg-violet-50 text-violet-600 ring-1 ring-violet-100 dark:bg-violet-950/40 dark:text-violet-400 dark:ring-violet-900',
  },
  {
    label: 'Resume Builder',
    href: '/dashboard/student/resume-builder',
    icon: FileText,
    iconWrap: 'bg-primary-50 text-primary-600 ring-1 ring-primary-100 dark:bg-primary-950/40 dark:text-primary-400 dark:ring-primary-900',
  },
  {
    label: 'Practice Tests',
    href: '/dashboard/student/practice',
    icon: Brain,
    iconWrap: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-900',
  },
  {
    label: 'Explore Jobs',
    href: '/jobs',
    icon: Briefcase,
    iconWrap: 'bg-orange-50 text-orange-600 ring-1 ring-orange-100 dark:bg-orange-950/40 dark:text-orange-400 dark:ring-orange-900',
  },
]

export function StudentQuickActions({ className = '' }: { className?: string }) {
  return (
    <StudentSectionCard padding="sm" className={cn('h-auto', className)}>
      <h2 className="mb-3 flex items-center gap-2 text-base font-bold tracking-tight text-gray-900 dark:text-white sm:text-lg">
        <span className="h-4 w-1 shrink-0 rounded-sm bg-primary-500 sm:h-5" aria-hidden />
        Quick Actions
      </h2>
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex min-w-0 flex-col items-center gap-1.5 text-center"
          >
            <div
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-200 sm:h-14 sm:w-14',
                action.iconWrap,
                'group-hover:scale-[1.03] group-hover:shadow-md'
              )}
            >
              <action.icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="line-clamp-2 text-[9px] font-medium leading-tight text-gray-700 dark:text-gray-300 sm:text-xs">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </StudentSectionCard>
  )
}
