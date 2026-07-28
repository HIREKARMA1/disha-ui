"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { profileService } from '@/services/profileService'
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

    const size = 108
    const strokeWidth = 9
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (Math.min(completion, 100) / 100) * circumference

    const stroke =
        completion >= 80 ? '#098855' : completion >= 50 ? '#00a2e5' : '#f58020'

    return (
        <div
            className={cn(
                'rounded-2xl border border-gray-200/80 dark:border-gray-700/70 bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-5 shadow-sm h-full',
                className
            )}
        >
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                    <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Resume Strength</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Profile completion score</p>
                </div>
            </div>

            <div className="flex flex-col items-center">
                {loading ? (
                    <div className="h-[108px] w-[108px] rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
                ) : (
                    <div className="relative" style={{ width: size, height: size }}>
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
                            <span className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                                {completion}%
                            </span>
                        </div>
                    </div>
                )}
                <p className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400 max-w-[200px]">
                    Complete your profile to improve job match and application success.
                </p>
                <Link
                    href="/dashboard/student/profile"
                    className="mt-3 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                >
                    Improve profile
                </Link>
            </div>
        </div>
    )
}
