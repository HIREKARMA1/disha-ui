'use client'

import { motion } from 'framer-motion'
import {
    CheckCircle,
    Briefcase,
    Building,
    User,
    Banknote,
    Activity,
    Clock,
} from 'lucide-react'
import { RecentActivity } from '@/types/university'
import { UniversityGlassCard } from '@/components/university/ui/UniversityGlassCard'
import { cn } from '@/lib/utils'

interface UniversityRecentActivitiesProps {
    activities?: RecentActivity[]
    className?: string
}

export function UniversityRecentActivities({
    activities = [],
    className = '',
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
                return 'bg-emerald-500/15 text-emerald-500'
            case 'job_approved':
                return 'bg-blue-500/15 text-blue-500'
            case 'campus_drive':
                return 'bg-violet-500/15 text-violet-500'
            case 'profile_update':
                return 'bg-orange-500/15 text-orange-500'
            default:
                return 'bg-gray-500/15 text-gray-400'
        }
    }

    const formatActivityText = (activity: RecentActivity) => {
        switch (activity.type) {
            case 'student_placed':
                return {
                    title: `${activity.student_name} placed at ${activity.company}`,
                    description: activity.package
                        ? `Package: $${activity.package?.toLocaleString()}`
                        : 'Placement confirmed',
                }
            case 'job_approved':
                return {
                    title: 'New job posting approved',
                    description: `${activity.job_title} at ${activity.company}`,
                }
            case 'campus_drive':
                return {
                    title: 'Campus drive scheduled',
                    description: `${activity.company} - ${activity.job_title}`,
                }
            case 'profile_update':
                return {
                    title: 'Profile updated',
                    description: `${activity.student_name || 'University'} profile information updated`,
                }
            default:
                return {
                    title: 'Activity update',
                    description: 'Recent activity in your dashboard',
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

        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        return `${diffDays}d ago`
    }

    const sampleActivities: RecentActivity[] = [
        {
            type: 'student_placed',
            student_name: 'Sarah Johnson',
            company: 'Google',
            package: 120000,
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
            type: 'job_approved',
            company: 'Microsoft',
            job_title: 'Software Engineer',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
            type: 'student_placed',
            student_name: 'Michael Chen',
            company: 'Apple',
            package: 135000,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        },
        {
            type: 'campus_drive',
            company: 'Amazon',
            job_title: 'SDE-I',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        },
        {
            type: 'job_approved',
            company: 'Meta',
            job_title: 'Frontend Developer',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        },
    ]

    const displayActivities = activities.length > 0 ? activities : sampleActivities

    return (
        <UniversityGlassCard
            title="Recent Activities"
            subtitle="Latest placement updates and job activities"
            className={cn('relative', className)}
            delay={0.08}
        >
            <div className="space-y-3 blur-sm pointer-events-none">
                {displayActivities.slice(0, 5).map((activity, index) => {
                    const Icon = getActivityIcon(activity.type)
                    const content = formatActivityText(activity)

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.35, delay: index * 0.06 }}
                            className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/60 dark:bg-white/[0.03]"
                        >
                            <div className={cn('p-2 rounded-lg shrink-0', getActivityColor(activity.type))}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                    {content.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                    {content.description}
                                </p>
                                {activity.type === 'student_placed' && activity.package && (
                                    <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/15 px-2 py-0.5 rounded-full">
                                        <Banknote className="w-3 h-3" />
                                        ₹{activity.package.toLocaleString('en-IN')}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                {formatTimeAgo(activity.timestamp)}
                            </span>
                        </motion.div>
                    )
                })}
            </div>

            {displayActivities.length === 0 && (
                <div className="text-center py-10 blur-sm pointer-events-none">
                    <Activity className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">No Recent Activities</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Recent placement and job activities will appear here
                    </p>
                </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-[#0D1628]/80 backdrop-blur-sm rounded-[18px]">
                <div className="text-center px-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-500/15 rounded-full mb-3">
                        <Clock className="w-7 h-7 text-blue-500" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Coming Soon</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                        Recent Activities functionality is under development. Stay tuned for updates!
                    </p>
                </div>
            </div>
        </UniversityGlassCard>
    )
}
