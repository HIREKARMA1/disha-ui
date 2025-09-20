"use client"

import { motion } from 'framer-motion'
import { Clock, User, Briefcase, Calendar, MapPin, ArrowRight } from 'lucide-react'

interface CorporateRecentActivitiesProps {
    className?: string
}

export function CorporateRecentActivities({ className = '' }: CorporateRecentActivitiesProps) {
    // Mock data for now - will be replaced with actual API data
    const mockActivities = [
        {
            id: 1,
            type: 'application',
            title: 'New application received',
            description: 'Sarah Johnson applied for Software Engineer position',
            time: '2 minutes ago',
            icon: User,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20'
        },
        {
            id: 2,
            type: 'interview',
            title: 'Interview scheduled',
            description: 'Technical interview with Mike Chen for Data Scientist role',
            time: '1 hour ago',
            icon: Calendar,
            color: 'text-green-600',
            bgColor: 'bg-green-100 dark:bg-green-900/20'
        },
        {
            id: 3,
            type: 'job',
            title: 'Job posted',
            description: 'Frontend Developer position published successfully',
            time: '3 hours ago',
            icon: Briefcase,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100 dark:bg-purple-900/20'
        },
        {
            id: 4,
            type: 'candidate',
            title: 'Profile viewed',
            description: 'Viewed Emily Davis profile for UX Designer role',
            time: '5 hours ago',
            icon: User,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100 dark:bg-orange-900/20'
        },
        {
            id: 5,
            type: 'application',
            title: 'Application reviewed',
            description: 'Reviewed 15 applications for Product Manager position',
            time: '1 day ago',
            icon: User,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-100 dark:bg-indigo-900/20'
        }
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 relative ${className}`}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                        <Clock className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Recent Activities
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Latest updates and notifications
                        </p>
                    </div>
                </div>
                <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center space-x-1">
                    <span>View All</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-4 blur-sm pointer-events-none">
                {mockActivities.map((activity, index) => (
                    <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                    >
                        <div className={`p-2 rounded-lg ${activity.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                            <activity.icon className={`w-4 h-4 ${activity.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {activity.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {activity.description}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {activity.time}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
                        <Clock className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Coming Soon
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                        Recent Activities functionality is under development. Stay tuned for updates!
                    </p>
                </div>
            </div>
        </motion.div>
    )
}


