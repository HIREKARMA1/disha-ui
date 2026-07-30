'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { profileService } from '@/services/profileService'
import { StudentSectionCard } from '@/components/student/ui/StudentSectionCard'
import { cn } from '@/lib/utils'

export function StudentResumeStrength({ className = '' }: { className?: string }) {
  const [completion, setCompletion] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    profileService
      .getProfileCompletion()
      .then((data) => setCompletion(data?.completion_percentage || 0))
      .catch(() => setCompletion(0))
      .finally(() => setLoading(false))
  }, [])

  const size = 88
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(completion, 100) / 100) * circumference
  const stroke = completion >= 80 ? '#10B981' : completion >= 50 ? '#3B82F6' : '#F59E0B'

  const tips =
    completion >= 80
      ? ['Profile looks strong', 'Keep skills updated']
      : ['Add more skills', 'Complete projects section']

  return (
    <StudentSectionCard padding="sm" className={cn(className)}>
      <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">
        Resume Strength
      </h3>

      <div className="flex items-center gap-3">
        {loading ? (
          <div className="h-[88px] w-[88px] rounded-full bg-gray-100 dark:bg-white/5 animate-pulse shrink-0" />
        ) : (
          <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                strokeWidth={strokeWidth}
                className="stroke-gray-200 dark:stroke-white/10"
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
              <span className="text-xl font-bold text-gray-900 dark:text-white tabular-nums leading-none">
                {completion}%
              </span>
              <span className="text-[9px] text-emerald-500 font-semibold mt-0.5">
                {completion >= 80 ? 'Strong' : 'Growing'}
              </span>
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-snug">
            {completion >= 80
              ? 'Great job! Your resume is strong and ready for applications.'
              : 'Complete your profile to improve job match and success rate.'}
          </p>
          <ul className="mt-1.5 space-y-0.5">
            {tips.map((tip) => (
              <li
                key={tip}
                className="flex items-center gap-1.5 text-[11px] sm:text-xs text-emerald-500"
              >
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard/student/profile"
            className="inline-block mt-1.5 text-xs sm:text-sm font-semibold text-blue-500 hover:text-blue-400"
          >
            Improve profile →
          </Link>
        </div>
      </div>
    </StudentSectionCard>
  )
}
