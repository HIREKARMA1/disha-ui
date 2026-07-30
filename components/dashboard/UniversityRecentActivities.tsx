'use client'

import { motion } from 'framer-motion'
import {
    CheckCircle,
    Briefcase,
    Building,
    User,
    IndianRupee,
    Calendar,
    ArrowRight,
    Activity,
    Clock,
} from 'lucide-react'
import { CorporateGlassCard } from '@/components/corporate/ui/CorporateGlassCard'
import { cn } from '@/lib/utils'
import { RecentActivity } from '@/types/university'

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
                return {
                    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
                    icon: 'text-emerald-600 dark:text-emerald-400',
                    border: 'border-emerald-200/60 dark:border-emerald-500/25',
                }
            case 'job_approved':
                return {
                    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
                    icon: 'text-blue-600 dark:text-blue-400',
                    border: 'border-blue-200/60 dark:border-blue-500/25',
                }
            case 'campus_drive':
                return {
                    bg: 'bg-violet-500/10 dark:bg-violet-500/15',
                    icon: 'text-violet-600 dark:text-violet-400',
                    border: 'border-violet-200/60 dark:border-violet-500/25',
                }
            case 'profile_update':
                return {
                    bg: 'bg-orange-500/10 dark:bg-orange-500/15',
                    icon: 'text-orange-600 dark:text-orange-400',
                    border: 'border-orange-200/60 dark:border-orange-500/25',
                }
            default:
                return {
                    bg: 'bg-gray-500/10 dark:bg-white/[0.04]',
                    icon: 'text-gray-600 dark:text-gray-400',
                    border: 'border-gray-200/60 dark:border-white/[0.08]',
                }
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
                    action: 'View Profile',
                }
            case 'job_approved':
                return {
                    title: `New job posting approved`,
                    description: `${activity.job_title} at ${activity.company}`,
                    action: 'View Job',
                }
            case 'campus_drive':
                return {
                    title: `Campus drive scheduled`,
                    description: `${activity.company} - ${activity.job_title}`,
                    action: 'View Details',
                }
            case 'profile_update':
                return {
                    title: `Profile updated`,
                    description: `${activity.student_name || 'University'} profile information updated`,
                    action: 'View Changes',
                }
            default:
                return {
                    title: 'Activity update',
                    description: 'Recent activity in your dashboard',
                    action: 'View',
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
        <CorporateGlassCard
            className={cn('relative', className)}
            title="Recent Activities"
            subtitle="Latest placement updates and job activities"
            delay={0.22}
            action={
                <button className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-xs flex items-center gap-1 group">
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
            }
        >
            <div className="space-y-3 blur-sm pointer-events-none">
                {displayActivities.slice(0, 5).map((activity, index) => {
                    const Icon = getActivityIcon(activity.type)
                    const colors = getActivityColor(activity.type)
                    const content = formatActivityText(activity)

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.35, delay: index * 0.06 }}
                            className={cn(
                                'flex items-start gap-3 p-3 rounded-xl border transition-all duration-300 group cursor-pointer',
                                colors.border,
                                colors.bg,
                                'hover:bg-white/50 dark:hover:bg-white/[0.06]'
                            )}
                        >
                            <div
                                className={cn(
                                    'p-2 rounded-lg bg-white dark:bg-[#0f1520] shadow-sm flex-shrink-0',
                                    colors.icon
                                )}
                            >
                                <Icon className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {content.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            {content.description}
                                        </p>

                                        {activity.type === 'student_placed' && activity.package && (
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full">
                                                    <IndianRupee className="w-3 h-3" />
                                                    <span>₹{activity.package.toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                        <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                                            <Calendar className="w-3 h-3" />
                                            <span>{formatTimeAgo(activity.timestamp)}</span>
                                        </div>
                                        <button className="text-[10px] text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                            {content.action}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {displayActivities.length === 0 && (
                <div className="text-center py-10 blur-sm pointer-events-none">
                    <Activity className="w-10 h-10 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                    <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                        No Recent Activities
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Recent placement and job activities will appear here
                    </p>
                </div>
            )}

            {displayActivities.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200/70 dark:border-white/[0.08] blur-sm pointer-events-none">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                            Showing {Math.min(5, displayActivities.length)} of {displayActivities.length}{' '}
                            activities
                        </span>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>
                                    {displayActivities.filter((a) => a.type === 'student_placed').length}{' '}
                                    Placements
                                </span>
                            </span>
                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                <Briefcase className="w-3.5 h-3.5" />
                                <span>
                                    {displayActivities.filter((a) => a.type === 'job_approved').length} Jobs
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-[#0D1628]/80 backdrop-blur-sm rounded-[18px]">
                <div className="text-center px-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-500/15 dark:bg-blue-500/20 rounded-full mb-3">
                        <Clock className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">
                        Coming Soon
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                        Recent Activities functionality is under development. Stay tuned for updates!
                    </p>
                </div>
            </div>
        </CorporateGlassCard>
    )
}
