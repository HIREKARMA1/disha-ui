"use client"

import { motion } from 'framer-motion'
import {
    CheckCircle,
    Briefcase,
    Building,
    User,
    DollarSign,
    Calendar,
    ArrowRight,
    Activity
} from 'lucide-react'
import { RecentActivity } from '@/types/university'

interface UniversityRecentActivitiesProps {
    activities?: RecentActivity[]
    className?: string
}

export function UniversityRecentActivities({
    activities = [],
    className = ''
}: UniversityRecentActivitiesProps) {

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'student_placed':
                return CheckCircle
            case 'job_approved':
                return Briefcase
            case 'campus_drive':
                return Building
            case 'profile_update':
                return User
            default:
                return Activity
        }
    }

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'student_placed':
                return {
                    bg: 'bg-green-50 dark:bg-green-900/20',
                    icon: 'text-green-600 dark:text-green-400',
                    border: 'border-green-200 dark:border-green-700'
                }
            case 'job_approved':
                return {
                    bg: 'bg-blue-50 dark:bg-blue-900/20',
                    icon: 'text-blue-600 dark:text-blue-400',
                    border: 'border-blue-200 dark:border-blue-700'
                }
            case 'campus_drive':
                return {
                    bg: 'bg-purple-50 dark:bg-purple-900/20',
                    icon: 'text-purple-600 dark:text-purple-400',
                    border: 'border-purple-200 dark:border-purple-700'
                }
            case 'profile_update':
                return {
                    bg: 'bg-orange-50 dark:bg-orange-900/20',
                    icon: 'text-orange-600 dark:text-orange-400',
                    border: 'border-orange-200 dark:border-orange-700'
                }
            default:
                return {
                    bg: 'bg-gray-50 dark:bg-gray-900/20',
                    icon: 'text-gray-600 dark:text-gray-400',
                    border: 'border-gray-200 dark:border-gray-700'
                }
        }
    }

    const formatActivityText = (activity: RecentActivity) => {
        switch (activity.type) {
            case 'student_placed':
                return {
                    title: `${activity.student_name} placed at ${activity.company}`,
                    description: activity.package ? `Package: $${activity.package?.toLocaleString()}` : 'Placement confirmed',
                    action: 'View Profile'
                }
            case 'job_approved':
                return {
                    title: `New job posting approved`,
                    description: `${activity.job_title} at ${activity.company}`,
                    action: 'View Job'
                }
            case 'campus_drive':
                return {
                    title: `Campus drive scheduled`,
                    description: `${activity.company} - ${activity.job_title}`,
                    action: 'View Details'
                }
            case 'profile_update':
                return {
                    title: `Profile updated`,
                    description: `${activity.student_name || 'University'} profile information updated`,
                    action: 'View Changes'
                }
            default:
                return {
                    title: 'Activity update',
                    description: 'Recent activity in your dashboard',
                    action: 'View'
                }
        }
    }

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date()
        const activityTime = new Date(timestamp)
        const diffMs = now.getTime() - activityTime.getTime()
        const diffMins = Math.floor(diffMs / (1000 * 60))
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffMins < 60) {
            return `${diffMins}m ago`
        } else if (diffHours < 24) {
            return `${diffHours}h ago`
        } else {
            return `${diffDays}d ago`
        }
    }

    // Sample activities if none provided
    const sampleActivities: RecentActivity[] = [
        {
            type: 'student_placed',
            student_name: 'Sarah Johnson',
            company: 'Google',
            package: 120000,
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
            type: 'job_approved',
            company: 'Microsoft',
            job_title: 'Software Engineer',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        },
        {
            type: 'student_placed',
            student_name: 'Michael Chen',
            company: 'Apple',
            package: 135000,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
        },
        {
            type: 'campus_drive',
            company: 'Amazon',
            job_title: 'SDE-I',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
        },
        {
            type: 'job_approved',
            company: 'Meta',
            job_title: 'Frontend Developer',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
        }
    ]

    const displayActivities = activities.length > 0 ? activities : sampleActivities

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Recent Activities
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Latest placement updates and job activities
                    </p>
                </div>
                <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm flex items-center space-x-1 group">
                    <span>View All</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Activities List */}
            <div className="space-y-4">
                {displayActivities.slice(0, 5).map((activity, index) => {
                    const Icon = getActivityIcon(activity.type)
                    const colors = getActivityColor(activity.type)
                    const content = formatActivityText(activity)

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className={`flex items-start space-x-4 p-4 rounded-xl border ${colors.border} ${colors.bg} hover:shadow-md transition-all duration-300 group cursor-pointer`}
                        >
                            {/* Icon */}
                            <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 ${colors.icon} shadow-sm`}>
                                <Icon className="w-5 h-5" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {content.title}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {content.description}
                                        </p>

                                        {/* Package highlight for placements */}
                                        {activity.type === 'student_placed' && activity.package && (
                                            <div className="flex items-center space-x-2 mt-2">
                                                <div className="flex items-center space-x-1 text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                                    <DollarSign className="w-3 h-3" />
                                                    <span>${activity.package.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Time and Action */}
                                    <div className="flex flex-col items-end space-y-2 ml-4">
                                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                                            <Calendar className="w-3 h-3" />
                                            <span>{formatTimeAgo(activity.timestamp)}</span>
                                        </div>
                                        <button className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                            {content.action}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Empty State */}
            {displayActivities.length === 0 && (
                <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Recent Activities
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Recent placement and job activities will appear here
                    </p>
                </div>
            )}

            {/* Activity Summary */}
            {displayActivities.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                            Showing {Math.min(5, displayActivities.length)} of {displayActivities.length} activities
                        </span>
                        <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                                <CheckCircle className="w-4 h-4" />
                                <span>{displayActivities.filter(a => a.type === 'student_placed').length} Placements</span>
                            </span>
                            <span className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                                <Briefcase className="w-4 h-4" />
                                <span>{displayActivities.filter(a => a.type === 'job_approved').length} Jobs</span>
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    )
}






