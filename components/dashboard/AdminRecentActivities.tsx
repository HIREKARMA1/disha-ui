'use client'

import { Activity } from 'lucide-react'
import { AdminActivity } from '@/types/admin'
import { AdminGlassCard } from '@/components/admin/ui/AdminGlassCard'

interface AdminRecentActivitiesProps {
    activities: AdminActivity[]
}

export function AdminRecentActivities({ activities }: AdminRecentActivitiesProps) {
    const hasActivities = activities.length > 0

    return (
        <AdminGlassCard
            title="Recent Activity"
            subtitle="Latest platform events"
        >
            {!hasActivities ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center mb-3">
                        <Activity className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        No recent activity
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                        Activity will appear here when platform events are available from the API.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {activities.map((activity) => (
                        <div
                            key={activity.id}
                            className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/80 dark:bg-white/[0.03]"
                        >
                            <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                                <Activity className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {activity.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                    {activity.description}
                                </p>
                                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                                    {new Date(activity.timestamp).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AdminGlassCard>
    )
}
