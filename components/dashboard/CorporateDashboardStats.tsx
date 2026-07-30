'use client'

import { Briefcase, Users, FileText, Shield } from 'lucide-react'
import { CorporateStatCard } from '@/components/corporate/ui/CorporateStatCard'
import { STAT_ACCENTS } from '@/components/corporate/ui/corporate-theme'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface CorporateDashboardStatsProps {
    className?: string
    isLoading?: boolean
    dashboardData?: any
}

export function CorporateDashboardStats({
    className = '',
    isLoading = false,
    dashboardData,
}: CorporateDashboardStatsProps) {
    const jobStats = dashboardData?.job_statistics || {}
    const activeJobs = jobStats.active_jobs || 0
    const totalApplications = jobStats.total_applications || 0
    const shortlistedCandidates = jobStats.shortlisted_candidates || 0
    const totalJobsPosted = jobStats.total_jobs_posted || 0
    const activeBatches =
        jobStats.active_batches ??
        dashboardData?.active_batches ??
        jobStats.running_batches ??
        0

    const cards = [
        {
            label: 'Total Job Postings',
            shortLabel: 'Job Postings',
            value: totalJobsPosted,
            subtitle: `${activeJobs} Active jobs`,
            icon: Briefcase,
            accent: 'blue' as const,
        },
        {
            label: 'Total Applications',
            shortLabel: 'Applications',
            value: totalApplications,
            subtitle: 'Total received',
            icon: FileText,
            accent: 'green' as const,
        },
        {
            label: 'Shortlisted Candidates',
            shortLabel: 'Shortlisted',
            value: shortlistedCandidates,
            subtitle: 'Across all jobs',
            icon: Users,
            accent: 'purple' as const,
        },
        {
            label: 'Total Active Batches',
            shortLabel: 'Active Batches',
            value: activeBatches,
            subtitle: 'Running batches',
            icon: Shield,
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
