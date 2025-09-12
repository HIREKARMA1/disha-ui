"use client"

import { motion } from 'framer-motion'
import { Activity, User, Briefcase, FileText, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { AdminActivity } from '@/types/admin'

interface AdminRecentActivitiesProps {
    activities: AdminActivity[]
}

export function AdminRecentActivities({ activities }: AdminRecentActivitiesProps) {
    // Mock data for now - in real implementation, this would come from API
    const mockActivities: AdminActivity[] = [
        {
            id: '1',
            type: 'user_registration',
            title: 'New Student Registration',
            description: 'John Doe registered as a student from MIT',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            user_id: 'user_123',
            user_name: 'John Doe'
        },
        {
            id: '2',
            type: 'job_posted',
            title: 'New Job Posted',
            description: 'Software Engineer position posted by TechCorp',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            user_id: 'corp_456',
            user_name: 'TechCorp'
        },
        {
            id: '3',
            type: 'application_submitted',
            title: 'Application Submitted',
            description: 'Sarah Wilson applied for Data Scientist role',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            user_id: 'user_789',
            user_name: 'Sarah Wilson'
        },
        {
            id: '4',
            type: 'system_alert',
            title: 'System Alert',
            description: 'High server load detected on database cluster',
            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
        },
        {
            id: '5',
            type: 'admin_action',
            title: 'Admin Action',
            description: 'University profile approved by admin',
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            user_id: 'uni_101',
            user_name: 'Stanford University'
        }
    ]

    const displayActivities = activities.length > 0 ? activities : mockActivities

    const getActivityIcon = (type: AdminActivity['type']) => {
        switch (type) {
            case 'user_registration':
                return User
            case 'job_posted':
                return Briefcase
            case 'application_submitted':
                return FileText
            case 'system_alert':
                return AlertTriangle
            case 'admin_action':
                return CheckCircle
            default:
                return Activity
        }
    }

    const getActivityColor = (type: AdminActivity['type']) => {
        switch (type) {
            case 'user_registration':
                return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
            case 'job_posted':
                return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
            case 'application_submitted':
                return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
            case 'system_alert':
                return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
            case 'admin_action':
                return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
            default:
                return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
        }
    }

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

        if (diffInMinutes < 1) return 'Just now'
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
        return date.toLocaleDateString()
    }

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
                        Recent Activities
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Latest platform activities and events
                    </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Live updates</span>
                </div>
            </div>

            <div className="space-y-4">
                {displayActivities.map((activity, index) => {
                    const IconComponent = getActivityIcon(activity.type)
                    const colorClasses = getActivityColor(activity.type)

                    return (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                            <div className={`w-10 h-10 ${colorClasses.split(' ')[1]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                <IconComponent className={`w-5 h-5 ${colorClasses.split(' ')[0]}`} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {activity.title}
                                    </h4>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                                        {formatTimestamp(activity.timestamp)}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {activity.description}
                                </p>

                                {activity.user_name && (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            by {activity.user_name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {displayActivities.length === 0 && (
                <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                        No recent activities to display
                    </p>
                </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="w-full text-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                    View All Activities
                </button>
            </div>
        </motion.div>
    )
}
