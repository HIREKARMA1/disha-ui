"use client"

import { motion } from 'framer-motion'
import { TrendingUp, Users, Briefcase, Activity } from 'lucide-react'
import { AdminUserStats, AdminJobStats } from '@/types/admin'

interface AdminAnalyticsChartProps {
    userStats: AdminUserStats
    jobStats: AdminJobStats
}

export function AdminAnalyticsChart({ userStats, jobStats }: AdminAnalyticsChartProps) {
    // Mock data for the chart - in real implementation, this would come from API
    const chartData = [
        { month: 'Jan', users: 800, jobs: 120, applications: 450 },
        { month: 'Feb', users: 950, jobs: 150, applications: 520 },
        { month: 'Mar', users: 1100, jobs: 180, applications: 680 },
        { month: 'Apr', users: 1250, jobs: 220, applications: 750 },
        { month: 'May', users: 1400, jobs: 280, applications: 920 },
        { month: 'Jun', users: 1600, jobs: 320, applications: 1100 }
    ]

    const maxValue = Math.max(
        ...chartData.map(d => Math.max(d.users, d.jobs, d.applications))
    )

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Platform Analytics
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Growth trends over the last 6 months
                    </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>+18.5% growth</span>
                </div>
            </div>

            {/* Chart Legend */}
            <div className="flex items-center justify-center space-x-6 mb-6">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Users</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Jobs</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Applications</span>
                </div>
            </div>

            {/* Simple Bar Chart */}
            <div className="space-y-4">
                {chartData.map((data, index) => (
                    <div key={data.month} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400 font-medium">
                                {data.month}
                            </span>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                <span>{data.users} users</span>
                                <span>{data.jobs} jobs</span>
                                <span>{data.applications} apps</span>
                            </div>
                        </div>

                        <div className="flex items-end space-x-1 h-8">
                            {/* Users bar */}
                            <div
                                className="bg-blue-500 rounded-t-sm transition-all duration-500 hover:bg-blue-600"
                                style={{
                                    width: '30%',
                                    height: `${(data.users / maxValue) * 100}%`,
                                    minHeight: '4px'
                                }}
                                title={`${data.users} users`}
                            ></div>

                            {/* Jobs bar */}
                            <div
                                className="bg-green-500 rounded-t-sm transition-all duration-500 hover:bg-green-600"
                                style={{
                                    width: '30%',
                                    height: `${(data.jobs / maxValue) * 100}%`,
                                    minHeight: '4px'
                                }}
                                title={`${data.jobs} jobs`}
                            ></div>

                            {/* Applications bar */}
                            <div
                                className="bg-purple-500 rounded-t-sm transition-all duration-500 hover:bg-purple-600"
                                style={{
                                    width: '30%',
                                    height: `${(data.applications / maxValue) * 100}%`,
                                    minHeight: '4px'
                                }}
                                title={`${data.applications} applications`}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Users
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {userStats.total_users.toLocaleString()}
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                            <Briefcase className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Active Jobs
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {jobStats.active_jobs.toLocaleString()}
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                            <Activity className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Applications
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {jobStats.total_applications.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
