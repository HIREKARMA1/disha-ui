'use client'

import { useEffect, useState } from 'react'
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
import { AdminJobStats } from '@/types/admin'
import { apiClient } from '@/lib/api'
import { adminPageBg } from '@/components/admin/ui/admin-theme'

interface AdminDashboardLayoutProps {
    children?: React.ReactNode
}

const EMPTY_JOB_STATS: AdminJobStats = {
    total_jobs: 0,
    total_applications: 0,
    active_jobs: 0,
    pending_approvals: 0,
}

function AdminDashboardContent({ children }: AdminDashboardLayoutProps) {
    const { user } = useAuth()
    const {
        userStats,
        isLoading: isUserStatsLoading,
        error: userStatsError,
    } = useAdminUserStatsContext()
    const [jobStats, setJobStats] = useState<AdminJobStats>(EMPTY_JOB_STATS)
    const [isJobStatsLoading, setIsJobStatsLoading] = useState(false)

    const isAdmin = user?.user_type === 'admin'
    const isLoading = isAdmin && (isUserStatsLoading || isJobStatsLoading)
    const error = isAdmin ? userStatsError : null
    const displayUserStats = userStats ?? {
        total_users: 0,
        total_corporates: 0,
        total_students: 0,
        total_universities: 0,
    }

    useEffect(() => {
        if (!isAdmin) return

        let cancelled = false
        const fetchJobStats = async () => {
            setIsJobStatsLoading(true)
            try {
                const [jobCounts, licenseRequests] = await Promise.all([
                    apiClient.getAdminJobStats(),
                    apiClient.getLicenseRequests({
                        status: 'pending',
                        page: 1,
                        page_size: 1,
                    }),
                ])
                if (cancelled) return

                const total_jobs = Number(jobCounts?.total_jobs) || 0
                const active_jobs = Number(jobCounts?.active_jobs) || 0
                const total_applications = Number(jobCounts?.total_applications) || 0
                // Same source of truth as License Management: LicenseRequest status === 'pending'
                const pendingTotal = Number(licenseRequests?.total)
                const pendingFromRows = Array.isArray(licenseRequests?.requests)
                    ? licenseRequests.requests.filter(
                          (r: { status?: string }) => r.status === 'pending'
                      ).length
                    : 0
                const pending_approvals = Number.isFinite(pendingTotal)
                    ? pendingTotal
                    : pendingFromRows

                setJobStats({
                    total_jobs,
                    active_jobs,
                    total_applications,
                    pending_approvals,
                })
            } catch (err) {
                console.error('Failed to fetch admin job stats:', err)
                if (!cancelled) setJobStats(EMPTY_JOB_STATS)
            } finally {
                if (!cancelled) setIsJobStatsLoading(false)
            }
        }

        fetchJobStats()
        return () => {
            cancelled = true
        }
    }, [isAdmin])

    return (
        <div className={adminPageBg}>
            <Navbar />
            <AdminSidebar />

            <div className="pt-16 lg:pl-64">
                <main className="p-4 md:p-6 lg:p-8 pb-28 lg:pb-8 min-h-screen">
                    {children ? (
                        children
                    ) : (
                        <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto">
                            <EventPopup />

                            {error && (
                                <div className="rounded-[18px] border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-6">
                                    <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
                                        Error Loading Dashboard
                                    </h3>
                                    <p className="text-red-700 dark:text-red-300">{error}</p>
                                </div>
                            )}

                            {!error && (
                                <>
                                    <AdminWelcomeMessage
                                        totalUsers={displayUserStats.total_users}
                                        totalStudents={displayUserStats.total_students}
                                    />

                                    <AdminDashboardStats
                                        userStats={displayUserStats}
                                        jobStats={jobStats}
                                        isLoading={isLoading}
                                    />

                                    <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
                                        <div className="xl:col-span-7 space-y-6">
                                            <AdminAnalyticsChart
                                                userStats={displayUserStats}
                                                jobStats={jobStats}
                                            />
                                            <AdminRecentActivities activities={[]} />
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
