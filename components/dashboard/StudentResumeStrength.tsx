'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { profileService } from '@/services/profileService'
import { StudentSectionCard } from '@/components/student/ui/StudentSectionCard'
import { cn } from '@/lib/utils'

export function StudentResumeStrength({ className = '' }: { className?: string }) {
  const [completion, setCompletion] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadCompletion = useCallback(async () => {
    try {
      const data = await profileService.getProfileCompletion()
      const pct = Math.round(Math.min(100, Math.max(0, Number(data?.completion_percentage) || 0)))
      setCompletion(pct)
    } catch {
      setCompletion(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCompletion()
    const onProfileUpdated = () => {
      setLoading(true)
      void loadCompletion()
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('profile-updated', onProfileUpdated)
      return () => window.removeEventListener('profile-updated', onProfileUpdated)
    }
  }, [loadCompletion])

  const size = 88
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (completion / 100) * circumference
  const stroke = completion >= 80 ? '#10B981' : completion >= 50 ? '#1b52a4' : '#F59E0B'

  const tips =
    completion >= 80
      ? ['Profile looks strong', 'Keep skills updated']
      : ['Add more skills', 'Complete projects section']

  return (
    <StudentSectionCard padding="sm" className={cn(className)}>
      <h3 className="mb-3 flex items-center gap-2 text-base font-bold tracking-tight text-gray-900 dark:text-white sm:text-lg">
        <span className="h-4 w-1 shrink-0 rounded-sm bg-primary-500 sm:h-5" aria-hidden />
        Resume Strength
      </h3>

      <div className="flex items-center gap-3">
        {loading ? (
          <div className="h-[88px] w-[88px] shrink-0 animate-pulse rounded-full bg-gray-100 dark:bg-gray-800" />
        ) : (
          <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                strokeWidth={strokeWidth}
                className="stroke-gray-200 dark:stroke-gray-700"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                strokeWidth={strokeWidth}
                stroke={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold leading-none tabular-nums text-gray-900 dark:text-white">
                {completion}%
              </span>
              <span
                className={cn(
                  'mt-0.5 text-[9px] font-semibold',
                  completion >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary-600 dark:text-primary-400'
                )}
              >
                {completion >= 80 ? 'Strong' : 'Growing'}
              </span>
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-xs leading-snug text-gray-600 dark:text-gray-300 sm:text-sm">
            {completion >= 80
              ? 'Your resume looks competitive for campus roles.'
              : 'Complete more profile sections to improve your score.'}
          </p>
          <ul className="mt-2 space-y-1">
            {tips.map((tip) => (
              <li key={tip} className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
                {tip}
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard/student/profile"
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Improve profile
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </StudentSectionCard>
  )
}
