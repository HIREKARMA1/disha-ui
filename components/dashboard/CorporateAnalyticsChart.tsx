'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Briefcase, Users } from 'lucide-react'
import { useRoleAnalytics } from '@/hooks/useRoleAnalytics'
import type { CorporateAnalyticsData } from '@/types/analytics'

interface CorporateAnalyticsChartProps {
    className?: string
}

export function CorporateAnalyticsChart({ className = '' }: CorporateAnalyticsChartProps) {
    const { data, loading, error } = useRoleAnalytics<CorporateAnalyticsData>('corporate')

    if (loading) {
        return (
            <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse h-64 ${className}`} />
        )
    }

    if (error || !data) {
        return (
            <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
                <p className="text-sm text-gray-500 dark:text-gray-400">Analytics unavailable</p>
            </div>
        )
    }

    const { summary, applications_over_time } = data
    const maxApplications = Math.max(...applications_over_time.map((d) => d.count), 1)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Hiring Analytics
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Live data from your job postings
                        </p>
                    </div>
                </div>
                <Link
                    href="/dashboard/corporate/analytics"
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                    View full report
                </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Briefcase className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{summary.total_applications}</p>
                    <p className="text-xs text-gray-500">Applications</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Users className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{summary.shortlisted_candidates}</p>
                    <p className="text-xs text-gray-500">Shortlisted</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <TrendingUp className="w-5 h-5 mx-auto text-green-500 mb-1" />
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{summary.shortlist_rate}%</p>
                    <p className="text-xs text-gray-500">Shortlist rate</p>
                </div>
            </div>

            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Applications Over Time
            </h4>
            <div className="space-y-2">
                {applications_over_time.map((item) => (
                    <div key={item.month} className="flex items-center space-x-3">
                        <div className="w-16 text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                            {item.month}
                        </div>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(item.count / maxApplications) * 100}%` }}
                            />
                        </div>
                        <div className="w-8 text-xs font-bold text-gray-900 dark:text-white text-right">
                            {item.count}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}
