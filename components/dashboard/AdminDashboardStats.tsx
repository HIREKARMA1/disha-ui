"use client"

import { motion } from 'framer-motion'
import { Users, Building2, GraduationCap, Briefcase, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { AdminUserStats, AdminJobStats } from '@/types/admin'

interface AdminDashboardStatsProps {
    userStats: AdminUserStats
    jobStats: AdminJobStats
    isLoading: boolean
}

export function AdminDashboardStats({ userStats, jobStats, isLoading }: AdminDashboardStatsProps) {
    const stats = [
        {
            title: 'Total Users',
            value: userStats.total_users,
            icon: Users,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            iconColor: 'text-blue-600 dark:text-blue-400',
            change: '+12%',
            changeType: 'positive' as const
        },
        {
            title: 'Students',
            value: userStats.total_students,
            icon: GraduationCap,
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            iconColor: 'text-green-600 dark:text-green-400',
            change: '+8%',
            changeType: 'positive' as const
        },
        {
            title: 'Universities',
            value: userStats.total_universities,
            icon: Building2,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            iconColor: 'text-purple-600 dark:text-purple-400',
            change: '+5%',
            changeType: 'positive' as const
        },
        {
            title: 'Corporates',
            value: userStats.total_corporates,
            icon: Briefcase,
            color: 'from-orange-500 to-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
            iconColor: 'text-orange-600 dark:text-orange-400',
            change: '+15%',
            changeType: 'positive' as const
        },
        {
            title: 'Active Jobs',
            value: jobStats.active_jobs,
            icon: CheckCircle,
            color: 'from-emerald-500 to-emerald-600',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            change: '+22%',
            changeType: 'positive' as const
        },
        {
            title: 'Applications',
            value: jobStats.total_applications,
            icon: FileText,
            color: 'from-indigo-500 to-indigo-600',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
            iconColor: 'text-indigo-600 dark:text-indigo-400',
            change: '+18%',
            changeType: 'positive' as const
        },
        {
            title: 'Pending Approvals',
            value: jobStats.pending_approvals,
            icon: Clock,
            color: 'from-yellow-500 to-yellow-600',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
            iconColor: 'text-yellow-600 dark:text-yellow-400',
            change: '-3%',
            changeType: 'negative' as const
        },
        {
            title: 'System Alerts',
            value: 2,
            icon: AlertTriangle,
            color: 'from-red-500 to-red-600',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            iconColor: 'text-red-600 dark:text-red-400',
            change: '+1',
            changeType: 'negative' as const
        }
    ]

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                            <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${stat.changeType === 'positive'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                            {stat.change}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {stat.value.toLocaleString()}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {stat.title}
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
