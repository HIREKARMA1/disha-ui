'use client'

import { Users, Briefcase, FileText, Building2, GraduationCap } from 'lucide-react'
import { AdminUserStats, AdminJobStats } from '@/types/admin'
import { AdminGlassCard } from '@/components/admin/ui/AdminGlassCard'
import { cn } from '@/lib/utils'

interface AdminAnalyticsChartProps {
    userStats: AdminUserStats
    jobStats: AdminJobStats
}

export function AdminAnalyticsChart({ userStats, jobStats }: AdminAnalyticsChartProps) {
    const distribution = [
        {
            label: 'Students',
            value: userStats.total_students,
            icon: GraduationCap,
            color: 'bg-emerald-500',
            track: 'bg-emerald-100 dark:bg-emerald-500/20',
        },
        {
            label: 'Universities',
            value: userStats.total_universities,
            icon: Building2,
            color: 'bg-violet-500',
            track: 'bg-violet-100 dark:bg-violet-500/20',
        },
        {
            label: 'Corporates',
            value: userStats.total_corporates,
            icon: Briefcase,
            color: 'bg-orange-500',
            track: 'bg-orange-100 dark:bg-orange-500/20',
        },
    ]

    const maxUsers = Math.max(...distribution.map((d) => d.value), 1)

    const jobMetrics = [
        {
            label: 'Total Jobs',
            value: jobStats.total_jobs,
            icon: Briefcase,
            accent: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-500/15',
        },
        {
            label: 'Active Jobs',
            value: jobStats.active_jobs,
            icon: Briefcase,
            accent: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-500/15',
        },
        {
            label: 'Applications',
            value: jobStats.total_applications,
            icon: FileText,
            accent: 'text-violet-600 dark:text-violet-400',
            bg: 'bg-violet-50 dark:bg-violet-500/15',
        },
        {
            label: 'Total Users',
            value: userStats.total_users,
            icon: Users,
            accent: 'text-teal-600 dark:text-teal-400',
            bg: 'bg-teal-50 dark:bg-teal-500/15',
        },
    ]

    return (
        <AdminGlassCard
            title="Platform Overview"
            subtitle="Live distribution from current platform data"
        >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                {jobMetrics.map((metric) => (
                    <div
                        key={metric.label}
                        className={cn('rounded-xl p-3 md:p-4 border border-transparent', metric.bg)}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <metric.icon className={cn('w-4 h-4', metric.accent)} />
                            <span className="text-[11px] md:text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                                {metric.label}
                            </span>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                            {metric.value.toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    User distribution
                </h4>
                {distribution.map((item) => {
                    const pct = Math.round((item.value / maxUsers) * 100)
                    return (
                        <div key={item.label} className="space-y-2">
                            <div className="flex items-center justify-between gap-3 text-sm">
                                <div className="flex items-center gap-2 min-w-0">
                                    <item.icon className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                                        {item.label}
                                    </span>
                                </div>
                                <span className="text-gray-500 dark:text-gray-400 tabular-nums flex-shrink-0">
                                    {item.value.toLocaleString()}
                                </span>
                            </div>
                            <div className={cn('h-2.5 rounded-full overflow-hidden', item.track)}>
                                <div
                                    className={cn('h-full rounded-full transition-all duration-700', item.color)}
                                    style={{ width: `${pct}%` }}
                                    role="progressbar"
                                    aria-valuenow={item.value}
                                    aria-valuemin={0}
                                    aria-valuemax={maxUsers}
                                    aria-label={`${item.label}: ${item.value}`}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </AdminGlassCard>
    )
}
