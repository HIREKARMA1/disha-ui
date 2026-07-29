'use client'

import { Calendar, TrendingUp, Sparkles } from 'lucide-react'
import { StudentChip } from '@/components/student/ui/StudentChip'
import { cn } from '@/lib/utils'

interface WelcomeMessageProps {
  className?: string
  studentName?: string
}

export function WelcomeMessage({ className = '', studentName = 'Student' }: WelcomeMessageProps) {
  const currentHour = new Date().getHours()
  let greeting = 'Good morning'
  let message = 'Ready to explore new opportunities today?'

  if (currentHour >= 12 && currentHour < 17) {
    greeting = 'Good afternoon'
    message = 'Keep up the great work! New opportunities await you.'
  } else if (currentHour >= 17) {
    greeting = 'Good evening'
    message = 'Review applications and plan tomorrow’s career moves.'
  }

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const dateShort = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className={cn('relative', className)}>
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        {greeting}, {studentName}{' '}
        <span className="inline-block" aria-hidden>
          
        </span>
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-2xl">{message}</p>
      <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
        <StudentChip icon={Calendar} label={dateShort} tone="blue" className="sm:hidden" />
        <StudentChip icon={Calendar} label={dateLabel} tone="blue" className="hidden sm:inline-flex" />
        <StudentChip icon={TrendingUp} label="Career Growth" tone="green" />
        <StudentChip icon={Sparkles} label="New Opportunities" tone="purple" />
      </div>
    </div>
  )
}
