"use client"

import { useState } from 'react'
import { CheckCircle, AlertCircle, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ProfileField {
    name: string
    completed: boolean
    required: boolean
    category: string
}

interface ProfileCompletionProps {
    completion: number
    fields?: ProfileField[]
    completionData?: {
        completed_fields: string[]
        missing_fields: string[]
        total_fields: number
        completed_count: number
    }
    className?: string
    /** Mobile: collapse checklist behind a button */
    compactMobile?: boolean
}

function formatFieldName(fieldName: string) {
    return fieldName
        .replace(/_/g, ' ')
        .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase())
}

export function ProfileCompletion({
    completion,
    fields,
    completionData,
    className,
    compactMobile = true,
}: ProfileCompletionProps) {
    const [showDetails, setShowDetails] = useState(false)

    const getRingColor = (percentage: number) => {
        if (percentage >= 80) return { stroke: '#098855', text: 'text-emerald-600 dark:text-emerald-400', track: 'stroke-emerald-500/20' }
        if (percentage >= 60) return { stroke: '#00a2e5', text: 'text-sky-600 dark:text-sky-400', track: 'stroke-sky-500/20' }
        if (percentage >= 40) return { stroke: '#f58020', text: 'text-orange-600 dark:text-orange-400', track: 'stroke-orange-500/20' }
        return { stroke: '#d64246', text: 'text-red-600 dark:text-red-400', track: 'stroke-red-500/20' }
    }

    const completedCount = completionData?.completed_count || (fields ? fields.filter((f) => f.completed).length : 0)
    const totalFields = completionData?.total_fields || (fields ? fields.length : 0)
    const completedFieldsList =
        completionData?.completed_fields ||
        (fields ? fields.filter((f) => f.completed).map((f) => f.name) : [])
    const missingFieldsList =
        completionData?.missing_fields ||
        (fields ? fields.filter((f) => !f.completed).map((f) => f.name) : [])

    const colors = getRingColor(completion)
    const size = 112
    const strokeWidth = 10
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (Math.min(completion, 100) / 100) * circumference
    const allDone = completion >= 100 || (missingFieldsList.length === 0 && completedFieldsList.length > 0)

    const checklist = (
        <div className="space-y-3">
            {completedFieldsList.length > 0 && (
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Completed ({completedFieldsList.length})
                    </div>
                    <ul className="space-y-1">
                        {completedFieldsList.slice(0, 8).map((name, i) => (
                            <li
                                key={i}
                                className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300"
                            >
                                <CheckCircle className="w-3 h-3 shrink-0 text-emerald-500" />
                                <span className="truncate">{formatFieldName(name)}</span>
                            </li>
                        ))}
                    </ul>
                    {allDone && (
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 pt-1">
                            All sections completed
                        </p>
                    )}
                </div>
            )}

            {missingFieldsList.length > 0 && (
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Missing ({missingFieldsList.length})
                    </div>
                    <ul className="space-y-1">
                        {missingFieldsList.slice(0, 6).map((name, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-red-600 dark:text-red-300">
                                <AlertCircle className="w-3 h-3 shrink-0" />
                                <span className="truncate">{formatFieldName(name)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )

    return (
        <div
            className={cn(
                'bg-white/95 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/80 dark:border-gray-700/60 p-4 sm:p-5',
                className
            )}
        >
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                    <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Profile Completion</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {completedCount} of {totalFields} fields
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-center mb-4">
                <div className="relative" style={{ width: size, height: size }}>
                    <svg width={size} height={size} className="-rotate-90" aria-hidden>
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            strokeWidth={strokeWidth}
                            className={cn('transition-colors', colors.track)}
                            stroke="currentColor"
                        />
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            strokeWidth={strokeWidth}
                            stroke={colors.stroke}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            className="transition-all duration-700 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={cn('text-2xl font-bold tabular-nums', colors.text)}>{completion}%</span>
                        <span className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Complete
                        </span>
                    </div>
                </div>
            </div>

            {/* Desktop: always show checklist */}
            <div className="hidden lg:block">{checklist}</div>

            {/* Mobile: View Completion Status toggle */}
            {compactMobile && (
                <div className="lg:hidden">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDetails((v) => !v)}
                        className="w-full h-9 rounded-xl text-xs font-semibold"
                    >
                        {showDetails ? (
                            <>
                                Hide Completion Status <ChevronUp className="w-3.5 h-3.5 ml-1" />
                            </>
                        ) : (
                            <>
                                View Completion Status <ChevronDown className="w-3.5 h-3.5 ml-1" />
                            </>
                        )}
                    </Button>
                    {showDetails && <div className="mt-3">{checklist}</div>}
                </div>
            )}
        </div>
    )
}
