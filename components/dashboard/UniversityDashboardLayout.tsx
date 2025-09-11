"use client"

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { UniversitySidebar } from './UniversitySidebar'
import { UniversityWelcomeMessage } from './UniversityWelcomeMessage'
import { UniversityDashboardStats } from './UniversityDashboardStats'
import { UniversityAnalyticsChart } from './UniversityAnalyticsChart'
import { AdvertisementBanner } from './AdvertisementBanner'
import { UniversityRecentActivities } from './UniversityRecentActivities'
import { UniversityFeatures } from './UniversityFeatures'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { LoadingOverlay } from './LoadingOverlay'
import { UniversityDashboardData } from '@/types/university'
import { UniversityFeatureFlag } from '@/types/feature-flags'

// New interface for the data structure returned by the backend
interface FeatureFlagWithUniversityStatus {
  id: string
  feature_name: string
  feature_category: string
  feature_key: string
  display_name: string
  description?: string
  icon?: string
  order: number
  is_global: boolean
  is_active: boolean
  requires_auth: boolean
  settings?: Record<string, any>
  maintenance_message?: string
  created_at: string
  updated_at?: string
  created_by?: string
  tenant_id: string
  university_status?: {
    id: string
    feature_flag_id: string
    university_id: string
    status: string
    custom_settings?: Record<string, any>
    custom_message?: string
    allowed_user_types?: string[]
    allowed_roles?: string[]
    created_at: string
    updated_at?: string
    enabled_at?: string
    disabled_at?: string
    tenant_id: string
  }
  is_available: boolean
}

interface UniversityDashboardLayoutProps {
    children?: React.ReactNode
}

function UniversityDashboardContent({ children }: UniversityDashboardLayoutProps) {
    const [dashboardData, setDashboardData] = useState<UniversityDashboardData | null>(null)
    const [features, setFeatures] = useState<FeatureFlagWithUniversityStatus[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [featuresLoading, setFeaturesLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()

    // Fetch university dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (user?.user_type === 'university') {
                try {
                    setIsLoading(true)
                    const data = await apiClient.getUniversityDashboard()
                    console.log('🎯 University Dashboard Data:', data)
                    setDashboardData(data)
                    setError(null)
                } catch (error) {
                    console.error('Failed to fetch university dashboard data:', error)
                    setError('Failed to load dashboard data')
                    // Don't set fallback data - only show real data from backend
                    setDashboardData(null)
                } finally {
                    setIsLoading(false)
                }
            }
        }

        fetchDashboardData()
    }, [user?.id, user?.user_type, user?.name])

    // Fetch university features from dashboard data
    useEffect(() => {
        const fetchFeatures = async () => {
            if (user?.user_type === 'university') {
                try {
                    setFeaturesLoading(true)
                    // Get features from dashboard API instead of separate endpoint
                    const dashboardData = await apiClient.getUniversityDashboard()
                    console.log('🎯 University Dashboard Data:', dashboardData)
                    
                    if (dashboardData.available_features) {
                        setFeatures(dashboardData.available_features)
                    } else {
                        // Fallback to separate features endpoint
                        const featuresData = await apiClient.getUniversityFeatures()
                        // Transform UniversityFeatureFlag[] to FeatureFlagWithUniversityStatus[]
                        const transformedFeatures = featuresData.map(flag => ({
                            id: flag.id,
                            feature_name: flag.feature_flag?.feature_name || '',
                            feature_category: flag.feature_flag?.feature_category || '',
                            feature_key: flag.feature_flag?.feature_key || '',
                            display_name: flag.feature_flag?.display_name || '',
                            description: flag.feature_flag?.description || '',
                            icon: flag.feature_flag?.icon || '',
                            order: flag.feature_flag?.order || 0,
                            is_global: flag.feature_flag?.is_global || false,
                            is_active: flag.feature_flag?.is_active || false,
                            requires_auth: flag.feature_flag?.requires_auth || false,
                            settings: flag.feature_flag?.settings || {},
                            maintenance_message: flag.feature_flag?.maintenance_message || '',
                            created_at: flag.created_at,
                            updated_at: flag.updated_at,
                            created_by: flag.enabled_by,
                            tenant_id: flag.feature_flag?.tenant_id || 'default',
                            is_available: flag.is_enabled,
                            university_status: {
                                id: flag.id,
                                feature_flag_id: flag.feature_flag_id,
                                university_id: flag.university_id,
                                status: flag.is_enabled ? 'enabled' : 'disabled',
                                custom_settings: flag.custom_config,
                                custom_message: flag.reason,
                                allowed_user_types: ['university'],
                                allowed_roles: ['user'],
                                created_at: flag.created_at,
                                updated_at: flag.updated_at,
                                enabled_at: flag.enabled_at,
                                disabled_at: flag.disabled_at,
                                tenant_id: flag.feature_flag?.tenant_id || 'default'
                            }
                        }))
                        setFeatures(transformedFeatures)
                    }
                } catch (error) {
                    console.error('Failed to fetch university features:', error)
                    setFeatures([])
                } finally {
                    setFeaturesLoading(false)
                }
            }
        }

        fetchFeatures()
    }, [user?.id, user?.user_type])

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Navbar is now fixed positioned */}
            <Navbar />

            {/* UniversitySidebar is now fixed positioned */}
            <UniversitySidebar />

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
                                    <UniversityWelcomeMessage
                                        universityInfo={dashboardData.university_info}
                                    />

                                    <UniversityDashboardStats
                                        studentStats={dashboardData.student_statistics}
                                        jobStats={dashboardData.job_statistics}
                                        isLoading={isLoading}
                                    />

                                    <div className="xl:grid-cols-10 grid grid-cols-1 gap-6">
                                        <div className="xl:col-span-7 space-y-6">
                                            <UniversityAnalyticsChart
                                                studentStats={dashboardData.student_statistics}
                                                jobStats={dashboardData.job_statistics}
                                            />
                                            <UniversityRecentActivities
                                                activities={dashboardData.recent_activity}
                                            />
                                        </div>
                                        <div className="xl:col-span-3 space-y-6">
                                            <UniversityFeatures 
                                                features={features}
                                                loading={featuresLoading}
                                            />
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

export function UniversityDashboardLayout({ children }: UniversityDashboardLayoutProps) {
    return (
        <>
            <UniversityDashboardContent children={children} />
            <LoadingOverlay />
        </>
    )
}
