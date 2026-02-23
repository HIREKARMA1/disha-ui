"use client"

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { AdminSidebar } from './AdminSidebar'
import { AdminWelcomeMessage } from './AdminWelcomeMessage'
import { AdminDashboardStats } from './AdminDashboardStats'
import { AdminAnalyticsChart } from './AdminAnalyticsChart'
import { AdvertisementBanner } from './AdvertisementBanner'
import { AdminRecentActivities } from './AdminRecentActivities'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { LoadingOverlay } from './LoadingOverlay'
import { AdminDashboardData } from '@/types/admin'

interface AdminDashboardLayoutProps {
    children?: React.ReactNode
}

function AdminDashboardContent({ children }: AdminDashboardLayoutProps) {
    const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()

    // Fetch dashboard data when component mounts
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (user?.user_type === 'admin') {
                setIsLoading(true)
                try {
                    const data = await apiClient.getAdminDashboard()
                    // Map API response to dashboard format (backend may return slightly different structure)
                    setDashboardData({
                        total_users: data.total_users ?? 0,
                        total_corporates: data.total_corporates ?? 0,
                        total_students: data.total_students ?? 0,
                        total_universities: data.total_universities ?? 0,
                        total_jobs: data.total_jobs ?? 0,
                        total_applications: data.total_applications ?? 0,
                        active_jobs: data.active_jobs ?? 0,
                        pending_approvals: data.pending_approvals ?? 0,
                        recent_activities: data.recent_activities ?? [],
                        monthly_stats: data.monthly_stats ?? {
                            sessions: 0,
                            unique_users: 0,
                            avg_session_duration: 0,
                            page_views: 0
                        },
                        top_industries: data.top_industries ?? [],
                        top_locations: data.top_locations ?? [],
                        monthly_chart_data: data.monthly_chart_data ?? [],
                        analytics: data.analytics ?? {
                            real_time_metrics: [],
                            kpis: [],
                            alerts: []
                        }
                    })
                } catch (error) {
                    console.error('Failed to fetch dashboard data:', error)
                    setError('Failed to load dashboard data')
                } finally {
                    setIsLoading(false)
                }
            }
        }

        fetchDashboardData()
    }, [user?.id, user?.user_type, user?.name])

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
                                                monthlyChartData={dashboardData.monthly_chart_data}
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
        <>
            <AdminDashboardContent children={children} />
            <LoadingOverlay />
        </>
    )
}
