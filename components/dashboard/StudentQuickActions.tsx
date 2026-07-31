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
    bg: 'bg-violet-500/15 text-violet-400 hover:bg-violet-500/25',
  },
  {
    label: 'Resume Builder',
    href: '/dashboard/student/resume-builder',
    icon: FileText,
    bg: 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25',
  },
  {
    label: 'Practice Tests',
    href: '/dashboard/student/practice',
    icon: Brain,
    bg: 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25',
  },
  {
    label: 'Explore Jobs',
    href: '/jobs',
    icon: Briefcase,
    bg: 'bg-orange-500/15 text-orange-400 hover:bg-orange-500/25',
  },
]

export function StudentQuickActions({ className = '' }: { className?: string }) {
  return (
    <StudentSectionCard padding="sm" className={cn('h-auto', className)}>
      <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2.5">
        Quick Actions
      </h2>
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex flex-col items-center gap-1 sm:gap-1.5 text-center min-w-0"
          >
            {/* Fixed size — avoid aspect-square which can explode height on mobile */}
            <div
              className={cn(
                'w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-200 shrink-0',
                action.bg,
                'group-hover:scale-[1.03] group-hover:shadow-md'
              )}
            >
              <action.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[9px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight line-clamp-2">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </StudentSectionCard>
  )
}
