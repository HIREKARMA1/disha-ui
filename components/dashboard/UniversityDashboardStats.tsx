'use client'

import { Users, Briefcase, Building, CheckCircle } from 'lucide-react'
import { CorporateStatCard } from '@/components/corporate/ui/CorporateStatCard'
import { STAT_ACCENTS } from '@/components/corporate/ui/corporate-theme'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { StudentStatistics, JobStatistics } from '@/types/university'

interface UniversityDashboardStatsProps {
    studentStats?: StudentStatistics
    jobStats?: JobStatistics
    className?: string
    isLoading?: boolean
}

export function UniversityDashboardStats({
    studentStats,
    jobStats,
    className = '',
    isLoading = false,
}: UniversityDashboardStatsProps) {
    const totalStudents = studentStats?.total_students || 0
    const placedStudents = studentStats?.placed_students || 0
    const activeJobs = jobStats?.total_jobs_approved || 0
    const totalJobs = (jobStats?.total_jobs_approved || 0) + (jobStats?.pending_approvals || 0)

    const cards = [
        {
            label: 'Total Students',
            shortLabel: 'Students',
            value: totalStudents,
            subtitle: 'Active enrolled',
            icon: Users,
            accent: 'blue' as const,
        },
        {
            label: 'Selected Students',
            shortLabel: 'Selected',
            value: placedStudents,
            subtitle: 'Successfully placed',
            icon: CheckCircle,
            accent: 'green' as const,
        },
        {
            label: 'Active Jobs',
            shortLabel: 'Active Jobs',
            value: activeJobs,
            subtitle: 'Approved listings',
            icon: Briefcase,
            accent: 'purple' as const,
        },
        {
            label: 'Total Jobs',
            shortLabel: 'Total Jobs',
            value: totalJobs,
            subtitle: 'Approved + pending',
            icon: Building,
            accent: 'orange' as const,
        },
    ]

    return (
        <div className={className}>
            {/* Mobile: all 4 in one row */}
            <div className="md:hidden grid grid-cols-4 gap-1.5">
                {cards.map((stat, index) => {
                    const tones = STAT_ACCENTS[stat.accent]
                    const Icon = stat.icon
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className={cn('rounded-xl border p-2 min-w-0', tones.card)}
                        >
                            <div
                                className={cn(
                                    'w-6 h-6 rounded-md flex items-center justify-center mb-1.5',
                                    tones.icon
                                )}
                            >
                                <Icon className="w-3 h-3" />
                            </div>
                            <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 leading-tight line-clamp-2 mb-1">
                                {stat.shortLabel}
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white leading-none tabular-nums">
                                {isLoading ? '—' : stat.value}
                            </p>
                            <p className="text-[8px] text-gray-500 dark:text-gray-400 mt-1 truncate">
                                {stat.subtitle}
                            </p>
                        </motion.div>
                    )
                })}
            </div>

            {/* Desktop grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full items-stretch">
                {cards.map((stat, index) => (
                    <CorporateStatCard
                        key={stat.label}
                        label={stat.label}
                        value={isLoading ? '—' : stat.value}
                        subtitle={stat.subtitle}
                        icon={stat.icon}
                        accent={stat.accent}
                        index={index}
                        isLoading={isLoading}
                    />
                ))}
            </div>
        </div>
    )
}
