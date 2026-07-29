"use client"

import { Navbar } from '@/components/ui/navbar'
import { AdminSidebar } from './AdminSidebar'
import { AdminWelcomeMessage } from './AdminWelcomeMessage'
import { AdminDashboardStats } from './AdminDashboardStats'
import { AdminAnalyticsChart } from './AdminAnalyticsChart'
import { AdvertisementBanner } from './AdvertisementBanner'
import { AdminRecentActivities } from './AdminRecentActivities'
import { EventPopup } from '@/components/events/EventPopup'
import { useAuth } from '@/hooks/useAuth'
import { useAdminUserStatsContext, AdminUserStatsProvider } from '@/contexts/AdminUserStatsContext'
import { LoadingOverlay } from './LoadingOverlay'
import { AdminDashboardData, AdminJobStats } from '@/types/admin'

interface AdminDashboardLayoutProps {
    children?: React.ReactNode
}

const MOCK_JOB_STATS: AdminJobStats = {
    total_jobs: 320,
    total_applications: 1250,
    active_jobs: 280,
    pending_approvals: 15,
}

const MOCK_DASHBOARD_EXTRAS: Pick<
    AdminDashboardData,
    'recent_activities' | 'monthly_stats' | 'top_industries' | 'top_locations' | 'analytics'
> = {
    recent_activities: [],
    monthly_stats: {
        sessions: 4500,
        unique_users: 1200,
        avg_session_duration: 8.5,
        page_views: 12500,
    },
    top_industries: [],
    top_locations: [],
    analytics: {
        real_time_metrics: [],
        kpis: [],
        alerts: [],
    },
}

function AdminDashboardContent({ children }: AdminDashboardLayoutProps) {
    const { user } = useAuth()
    const {
        userStats,
        isLoading: isUserStatsLoading,
        error: userStatsError,
    } = useAdminUserStatsContext()

    const isAdmin = user?.user_type === 'admin'
    const isLoading = isAdmin && isUserStatsLoading
    const error = isAdmin ? userStatsError : null

    const dashboardData: AdminDashboardData | null =
        isAdmin && userStats
            ? {
                  ...userStats,
                  ...MOCK_JOB_STATS,
                  ...MOCK_DASHBOARD_EXTRAS,
              }
            : null

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Navbar is now fixed positioned */}
            <Navbar />

            {/* AdminSidebar is now fixed positioned */}
            <AdminSidebar />

            {/* Main Content with proper spacing */}
            <div className="pt-16 lg:pl-64">
                <main className="p-6 pb-safe lg:pb-6 min-h-screen">
                    {children ? (
                        children
                    ) : (
                        <div className="space-y-6">
                            <EventPopup />
                            {/* Loading State */}
                            {isLoading && (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                                </div>
                            )}

                            {/* Error State */}
                            {error && !isLoading && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
                                    <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
                                        Error Loading Dashboard
                                    </h3>
                                    <p className="text-red-700 dark:text-red-300">{error}</p>
                                </div>
                            )}

                            {/* Dashboard Content */}
                            {dashboardData && !isLoading && (
                                <>
                                    <AdminWelcomeMessage
                                        adminInfo={dashboardData}
                                    />

                                    <AdminDashboardStats
                                        userStats={{
                                            total_users: dashboardData.total_users,
                                            total_corporates: dashboardData.total_corporates,
                                            total_students: dashboardData.total_students,
                                            total_universities: dashboardData.total_universities
                                        }}
                                        jobStats={{
                                            total_jobs: dashboardData.total_jobs,
                                            total_applications: dashboardData.total_applications,
                                            active_jobs: dashboardData.active_jobs,
                                            pending_approvals: dashboardData.pending_approvals
                                        }}
                                        isLoading={isLoading}
                                    />

                                    <div className="xl:grid-cols-10 grid grid-cols-1 gap-6">
                                        <div className="xl:col-span-7 space-y-6">
                                            <AdminAnalyticsChart
                                                userStats={{
                                                    total_users: dashboardData.total_users,
                                                    total_corporates: dashboardData.total_corporates,
                                                    total_students: dashboardData.total_students,
                                                    total_universities: dashboardData.total_universities
                                                }}
                                                jobStats={{
                                                    total_jobs: dashboardData.total_jobs,
                                                    total_applications: dashboardData.total_applications,
                                                    active_jobs: dashboardData.active_jobs,
                                                    pending_approvals: dashboardData.pending_approvals
                                                }}
                                            />
                                            <AdminRecentActivities
                                                activities={dashboardData.recent_activities}
                                            />
                                        </div>
                                        <div className="xl:col-span-3 space-y-6">
                                            <AdvertisementBanner />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

export function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
    return (
        <AdminUserStatsProvider>
            <AdminDashboardContent children={children} />
            <LoadingOverlay />
        </AdminUserStatsProvider>
    )
}
