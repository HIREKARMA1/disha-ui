"use client"

import { Briefcase, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { dashboardService, type DashboardStats } from '@/services/dashboardService'
import { StudentStatCard } from '@/components/student/ui/StudentStatCard'

interface DashboardStatsProps {
    className?: string
}

export function DashboardStats({ className = '' }: DashboardStatsProps) {
    const [stats, setStats] = useState<DashboardStats>({
        totalJobs: 0,
        appliedJobs: 0,
        selected: 0,
        rejected: 0,
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true)
                setError(null)
                const dashboardStats = await dashboardService.getDashboardStats()
                setStats(dashboardStats)
            } catch (error: any) {
                console.error('Failed to fetch dashboard stats:', error)
                if (
                    error.message?.includes('not authenticated') ||
                    error.message?.includes('Authentication failed')
                ) {
                    router.push('/auth/login')
                    return
                }
                setError(error.message || 'Unable to fetch data. Please try again later.')
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [router])

    const cards = [
        {
            label: 'Total Jobs',
            value: stats.totalJobs,
            icon: Briefcase,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50/90 dark:bg-blue-900/20',
        },
        {
            label: 'Applied',
            value: stats.appliedJobs,
            icon: FileText,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50/90 dark:bg-emerald-900/20',
        },
        {
            label: 'Selected',
            value: stats.selected,
            icon: CheckCircle,
            color: 'text-violet-600 dark:text-violet-400',
            bg: 'bg-violet-50/90 dark:bg-violet-900/20',
        },
        {
            label: 'Rejected',
            value: stats.rejected,
            icon: XCircle,
            color: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-50/90 dark:bg-red-900/20',
        },
    ]

    if (loading) {
        return (
            <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 ${className}`}>
                {[...Array(4)].map((_, index) => (
                    <div
                        key={index}
                        className="h-[88px] rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 animate-pulse"
                    />
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className={`rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 ${className}`}>
                <div className="text-center">
                    <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                        Unable to load stats
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Please refresh and try again.</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 ${className}`}>
            {cards.map((stat, index) => (
                <StudentStatCard
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                    icon={stat.icon}
                    colorClass={stat.color}
                    bgClass={stat.bg}
                    index={index}
                    compact
                />
            ))}
        </div>
    )
}
