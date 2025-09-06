"use client"

import { motion } from 'framer-motion'
import {
    Briefcase,
    Calendar,
    MapPin,
    Building2,
    Clock,
    CheckCircle,
    AlertCircle,
    Clock as ClockIcon
} from 'lucide-react'
import Link from 'next/link'

interface Activity {
    id: string
    type: 'application' | 'interview' | 'update' | 'reminder'
    title: string
    company?: string
    location?: string
    time: string
    status: 'pending' | 'accepted' | 'rejected' | 'scheduled'
    description?: string
}

interface RecentActivitiesProps {
    className?: string
}

const activities: Activity[] = [
    {
        id: '1',
        type: 'application',
        title: 'Frontend Developer Intern',
        company: 'TechCorp',
        location: 'Remote',
        time: '2 hours ago',
        status: 'pending',
        description: 'Application submitted successfully'
    },
    {
        id: '2',
        type: 'interview',
        title: 'Software Engineer',
        company: 'InnovateLab',
        location: 'San Francisco, CA',
        time: '1 day ago',
        status: 'scheduled',
        description: 'Interview scheduled for March 20, 2:00 PM'
    },
    {
        id: '3',
        type: 'update',
        title: 'Data Analyst',
        company: 'DataFlow Inc',
        location: 'New York, NY',
        time: '2 days ago',
        status: 'accepted',
        description: 'Congratulations! You\'ve been selected for the next round'
    },
    {
        id: '4',
        type: 'reminder',
        title: 'Resume Update',
        company: undefined,
        location: undefined,
        time: '3 days ago',
        status: 'pending',
        description: 'Your resume hasn\'t been updated in 30 days'
    }
]

const getStatusIcon = (status: Activity['status']) => {
    switch (status) {
        case 'accepted':
            return <CheckCircle className="w-4 h-4 text-green-500" />
        case 'rejected':
            return <AlertCircle className="w-4 h-4 text-red-500" />
        case 'scheduled':
            return <Calendar className="w-4 h-4 text-blue-500" />
        case 'pending':
        default:
            return <ClockIcon className="w-4 h-4 text-yellow-500" />
    }
}

const getStatusColor = (status: Activity['status']) => {
    switch (status) {
        case 'accepted':
            return 'text-green-600 bg-green-50 dark:bg-green-900/20'
        case 'rejected':
            return 'text-red-600 bg-red-50 dark:bg-red-900/20'
        case 'scheduled':
            return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
        case 'pending':
        default:
            return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
    }
}

export function RecentActivities({ className = '' }: RecentActivitiesProps) {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Recent Activities
                </h2>
                <Link
                    href="/dashboard/student/activities"
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
                >
                    View All
                </Link>
            </div>

            <div className="space-y-4">
                {activities.map((activity, index) => (
                    <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer group"
                    >
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                                {getStatusIcon(activity.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                        {activity.title}
                                    </h3>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                    </span>
                                </div>

                                {activity.company && (
                                    <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400 mb-2">
                                        <span className="flex items-center">
                                            <Building2 className="w-3 h-3 mr-1" />
                                            {activity.company}
                                        </span>
                                        {activity.location && (
                                            <span className="flex items-center">
                                                <MapPin className="w-3 h-3 mr-1" />
                                                {activity.location}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    {activity.description}
                                </p>

                                <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {activity.time}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
