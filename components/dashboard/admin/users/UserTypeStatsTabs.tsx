"use client"

import { motion } from 'framer-motion'
import { Building2, GraduationCap, Users, UserRound } from 'lucide-react'
import {
    ADMIN_USER_TYPE_FILTERS,
    AdminUserTypeFilter,
    USER_TYPE_FILTER_LABELS,
} from '@/lib/userManagementConfig'

interface UserTypeStatsTabsProps {
    activeType: AdminUserTypeFilter
    counts: Record<'student' | 'university' | 'corporate', number>
    onTypeChange: (type: AdminUserTypeFilter) => void
}

const TAB_ICONS: Record<AdminUserTypeFilter, React.ComponentType<{ className?: string }>> = {
    all: UserRound,
    student: GraduationCap,
    university: Building2,
    corporate: Users,
}

const TAB_COLORS: Record<AdminUserTypeFilter, string> = {
    all: 'from-slate-500 to-slate-700',
    student: 'from-blue-500 to-cyan-600',
    university: 'from-purple-500 to-pink-600',
    corporate: 'from-orange-500 to-red-600',
}

export function UserTypeStatsTabs({
    activeType,
    counts,
    onTypeChange,
}: UserTypeStatsTabsProps) {
    const allCount = counts.student + counts.university + counts.corporate

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {ADMIN_USER_TYPE_FILTERS.map((type) => {
                const Icon = TAB_ICONS[type]
                const isActive = activeType === type
                const count =
                    type === 'all' ? allCount : counts[type]

                return (
                    <motion.button
                        key={type}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onTypeChange(type)}
                        className={`rounded-xl border p-5 text-left transition-all duration-200 ${
                            isActive
                                ? 'border-primary-500 bg-white dark:bg-gray-800 shadow-md ring-2 ring-primary-500/20'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-700'
                        }`}
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div
                                    className={`h-11 w-11 rounded-lg bg-gradient-to-br ${TAB_COLORS[type]} flex items-center justify-center shrink-0`}
                                >
                                    <Icon className="h-5 w-5 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Total {USER_TYPE_FILTER_LABELS[type]}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {count.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            {isActive && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                                    Active
                                </span>
                            )}
                        </div>
                    </motion.button>
                )
            })}
        </div>
    )
}
