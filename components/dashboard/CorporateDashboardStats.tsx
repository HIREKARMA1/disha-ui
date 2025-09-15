"use client"

import { motion } from 'framer-motion'
import {
    Briefcase,
    Users,
    FileText,
    Calendar,
    TrendingUp,
    Target,
    Building2,
    AlertCircle
} from 'lucide-react'

interface StatCard {
    label: string
    value: string
    icon: React.ComponentType<{ className?: string }>
    color: string
    bgColor: string
}

interface CorporateDashboardStatsProps {
    className?: string
    isLoading?: boolean
}

export function CorporateDashboardStats({
    className = '',
    isLoading = false
}: CorporateDashboardStatsProps) {
    // Mock data for now - will be replaced with actual API data
    const mockStats = {
        activeJobs: 12,
        totalCandidates: 245,
        interviewsScheduled: 8,
        hireRate: 78
    }

    const statCards: StatCard[] = [
        {
            label: 'Active Jobs',
            value: mockStats.activeJobs.toString(),
            icon: Briefcase,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        },
        {
            label: 'Total Candidates',
            value: mockStats.totalCandidates.toString(),
            icon: Users,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20'
        },
        {
            label: 'Interviews Scheduled',
            value: mockStats.interviewsScheduled.toString(),
            icon: Calendar,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20'
        },
        {
            label: 'Hire Rate',
            value: `${mockStats.hireRate}%`,
            icon: TrendingUp,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20'
        }
    ]

    if (isLoading) {
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
                    <div className="block group w-full">
                        <div className={`p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md w-full ${stat.bgColor}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        {stat.label}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-200">
                                        {isLoading ? (
                                            <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-16 rounded"></div>
                                        ) : (
                                            stat.value
                                        )}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}


