"use client"

import { motion } from 'framer-motion'
import {
    Briefcase,
    FileText,
    CheckCircle,
    XCircle,
    TrendingUp,
    Calendar,
    MapPin,
    Building2,
    AlertCircle
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { dashboardService, type DashboardStats } from '@/services/dashboardService'

interface StatCard {
    label: string
    value: string
    icon: React.ComponentType<{ className?: string }>
    color: string
    bgColor: string
}

interface DashboardStatsProps {
    className?: string
}

export function DashboardStats({ className = '' }: DashboardStatsProps) {
    const [stats, setStats] = useState<DashboardStats>({
        totalJobs: 0,
        appliedJobs: 0,
        selected: 0,
        rejected: 0
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

                // Handle authentication errors
                if (error.message.includes('not authenticated') || error.message.includes('Authentication failed')) {
                    // Redirect to login
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

    const statCards: StatCard[] = [
        {
            label: 'Total Jobs',
            value: stats.totalJobs.toString(),
            icon: Briefcase,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        },
        {
            label: 'Applied Jobs',
            value: stats.appliedJobs.toString(),
            icon: FileText,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20'
        },
        {
            label: 'Selected',
            value: stats.selected.toString(),
            icon: CheckCircle,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
        },
        {
            label: 'Rejected',
            value: stats.rejected.toString(),
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50 dark:bg-red-900/20'
        }
    ]

    if (loading) {
        return (
            <div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full ${className}`}>
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 animate-pulse">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className={`w-full ${className}`}>
                <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div className="text-center">
                        <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Unable to Load Dashboard Data
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Please refresh the page to try again.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full ${className}`}>
            {statCards.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="w-full"
                >
                    <div className={`p-4 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 w-full ${stat.bgColor}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    {stat.label}
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stat.value}
                                </p>
                            </div>
                            <div className={`p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}