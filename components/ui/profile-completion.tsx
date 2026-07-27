"use client"

import { CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

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
}

function formatFieldName(fieldName: string) {
    return fieldName
        .replace(/_/g, ' ')
        .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase())
}

export function ProfileCompletion({ completion, fields, completionData, className }: ProfileCompletionProps) {
    const getRingColor = (percentage: number) => {
        if (percentage >= 80) return { stroke: '#098855', text: 'text-emerald-600 dark:text-emerald-400', track: 'stroke-emerald-500/20' }
        if (percentage >= 60) return { stroke: '#fec40d', text: 'text-amber-600 dark:text-amber-400', track: 'stroke-amber-500/20' }
        if (percentage >= 40) return { stroke: '#f58020', text: 'text-orange-600 dark:text-orange-400', track: 'stroke-orange-500/20' }
        return { stroke: '#d64246', text: 'text-red-600 dark:text-red-400', track: 'stroke-red-500/20' }
    }

    const getProgressColor = (percentage: number) => {
        if (percentage >= 80) return 'bg-emerald-500'
        if (percentage >= 60) return 'bg-amber-500'
        if (percentage >= 40) return 'bg-orange-500'
        return 'bg-red-500'
    }

    const completedCount = completionData?.completed_count || (fields ? fields.filter(field => field.completed).length : 0)
    const totalFields = completionData?.total_fields || (fields ? fields.length : 0)
    const completedFieldsList = completionData?.completed_fields || (fields ? fields.filter(field => field.completed).map(f => f.name) : [])
    const missingFieldsList = completionData?.missing_fields || (fields ? fields.filter(field => !field.completed).map(f => f.name) : [])

    const categories = fields ? Array.from(new Set(fields.map(field => field.category))) : []
    const categoryStats = fields ? categories.map(category => {
        const categoryFields = fields.filter(field => field.category === category)
        const completed = categoryFields.filter(field => field.completed).length
        const total = categoryFields.length
        return { category, completed, total, percentage: (completed / total) * 100 }
    }) : []

    const colors = getRingColor(completion)
    const size = 120
    const strokeWidth = 10
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (Math.min(completion, 100) / 100) * circumference

    return (
        <div className={cn(
            "bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/80 dark:border-gray-700/60 p-5 sm:p-6",
            className
        )}>
            <div className="flex flex-col sm:flex-row items-center gap-5 mb-6">
                {/* Circular progress */}
                <div className="relative shrink-0" style={{ width: size, height: size }}>
                    <svg width={size} height={size} className="-rotate-90" aria-hidden>
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            strokeWidth={strokeWidth}
                            className={cn("transition-colors", colors.track)}
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
                        <span className={cn("text-2xl font-bold tabular-nums", colors.text)}>
                            {completion}%
                        </span>
                        <span className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">
                            Complete
                        </span>
                    </div>
                </div>

                <div className="flex-1 text-center sm:text-left min-w-0">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                        <ShieldCheck className="w-5 h-5 text-primary-500 shrink-0" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Profile Completion
                        </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        Complete your profile to unlock job applications
                    </p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {completedCount} of {totalFields} fields completed
                    </p>
                </div>
            </div>

            {fields && fields.length > 0 && (
                <div className="space-y-3 mb-5">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Category Progress
                    </h4>
                    {categoryStats.map(({ category, completed, total, percentage }) => (
                        <div key={category} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700 dark:text-gray-200 capitalize">
                                    {category}
                                </span>
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {completed}/{total}
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700/80 rounded-full h-2 overflow-hidden">
                                <div
                                    className={cn("h-2 rounded-full transition-all duration-300", getProgressColor(percentage))}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Completion Status
                </h4>

                {completedFieldsList.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle className="w-4 h-4 shrink-0" />
                            <span>Completed ({completedFieldsList.length})</span>
                        </div>
                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                            {completedFieldsList.slice(0, 6).map((fieldName, index) => (
                                <div
                                    key={index}
                                    className="text-xs text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/40 px-2.5 py-1.5 rounded-lg truncate"
                                >
                                    {formatFieldName(fieldName)}
                                </div>
                            ))}
                            {completedFieldsList.length > 6 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1.5">
                                    +{completedFieldsList.length - 6} more
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {missingFieldsList.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>Missing ({missingFieldsList.length})</span>
                        </div>
                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                            {missingFieldsList.slice(0, 6).map((fieldName, index) => (
                                <div
                                    key={index}
                                    className="text-xs text-red-800 dark:text-red-200 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800/40 px-2.5 py-1.5 rounded-lg truncate"
                                >
                                    {formatFieldName(fieldName)}
                                </div>
                            ))}
                            {missingFieldsList.length > 6 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1.5">
                                    +{missingFieldsList.length - 6} more
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {completion < 100 && (
                <div className="mt-5 p-4 bg-gradient-to-br from-primary-50 to-sky-50 dark:from-primary-900/25 dark:to-sky-900/15 border border-primary-200/70 dark:border-primary-700/40 rounded-xl">
                    <h5 className="text-sm font-semibold text-primary-800 dark:text-primary-200 mb-2">
                        Tips to complete your profile
                    </h5>
                    <ul className="text-xs text-primary-700 dark:text-primary-300 space-y-1.5 leading-relaxed">
                        <li>• Complete all Basic Info fields (name, contact, location, resume)</li>
                        <li>• Upload your latest resume in Basic Info</li>
                        <li>• Fill in your academic details</li>
                        <li>• Add your technical skills</li>
                        <li>• Profile picture is optional (Social tab)</li>
                    </ul>
                </div>
            )}
        </div>
    )
}
