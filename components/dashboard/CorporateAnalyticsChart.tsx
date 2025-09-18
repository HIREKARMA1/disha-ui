"use client"

import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Users, Briefcase } from 'lucide-react'

interface CorporateAnalyticsChartProps {
    className?: string
}

export function CorporateAnalyticsChart({ className = '' }: CorporateAnalyticsChartProps) {
    // Mock data for now - will be replaced with actual API data
    const mockData = {
        applicationsOverTime: [
            { month: 'Jan', applications: 45 },
            { month: 'Feb', applications: 52 },
            { month: 'Mar', applications: 38 },
            { month: 'Apr', applications: 67 },
            { month: 'May', applications: 43 },
            { month: 'Jun', applications: 58 }
        ],
        topPositions: [
            { position: 'Software Engineer', applications: 89 },
            { position: 'Data Scientist', applications: 67 },
            { position: 'Product Manager', applications: 45 },
            { position: 'UX Designer', applications: 34 }
        ]
    }

    const maxApplications = Math.max(...mockData.applicationsOverTime.map(d => d.applications))

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
                            Application trends and insights
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>+12% this month</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Applications Over Time Chart */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                        Applications Over Time
                    </h4>
                    <div className="space-y-3">
                        {mockData.applicationsOverTime.map((data, index) => (
                            <motion.div
                                key={data.month}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="flex items-center space-x-3"
                            >
                                <div className="w-8 text-xs font-medium text-gray-600 dark:text-gray-400">
                                    {data.month}
                                </div>
                                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(data.applications / maxApplications) * 100}%` }}
                                        transition={{ duration: 1, delay: index * 0.1 }}
                                        className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                                    />
                                </div>
                                <div className="w-8 text-xs font-medium text-gray-900 dark:text-white text-right">
                                    {data.applications}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Top Positions */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                        Top Positions by Applications
                    </h4>
                    <div className="space-y-3">
                        {mockData.topPositions.map((position, index) => (
                            <motion.div
                                key={position.position}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="p-1 bg-blue-100 dark:bg-blue-900/20 rounded">
                                        <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {position.position}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        {position.applications}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}


