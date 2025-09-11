"use client"

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { StudentSidebar } from './StudentSidebar'
import { WelcomeMessage } from './WelcomeMessage'
import { DashboardStats } from './DashboardStats'
import { AnalyticsChart } from './AnalyticsChart'
import { AdvertisementBanner } from './AdvertisementBanner'
import { RecentActivities } from './RecentActivities'
import { StudentFeatures } from './StudentFeatures'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { LoadingOverlay } from './LoadingOverlay'
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

interface StudentDashboardLayoutProps {
    children?: React.ReactNode
}

function StudentDashboardContent({ children }: StudentDashboardLayoutProps) {
    const [studentName, setStudentName] = useState<string>('Student')
    const [features, setFeatures] = useState<FeatureFlagWithUniversityStatus[]>([])
    const [featuresLoading, setFeaturesLoading] = useState(true)
    const { user } = useAuth()

    // Fetch student profile data to get the name
    useEffect(() => {
        const fetchStudentName = async () => {
            if (user?.user_type === 'student') {
                try {
                    const profileData = await apiClient.getStudentProfile()
                    if (profileData?.name && profileData.name.trim()) {
                        setStudentName(profileData.name)
                    } else if (user?.name) {
                        setStudentName(user.name)
                    }
                } catch (error) {
                    console.error('Failed to fetch student profile:', error)
                    // Fallback to user name from auth
                    if (user?.name) {
                        setStudentName(user.name)
                    }
                }
            }
        }

        fetchStudentName()
    }, [user?.id])

    // Fetch student features from dashboard data
    useEffect(() => {
        const fetchFeatures = async () => {
            if (user?.user_type === 'student') {
                try {
                    setFeaturesLoading(true)
                    // Get features from dashboard API instead of separate endpoint
                    const dashboardData = await apiClient.getStudentDashboard()
                    console.log('🎯 Student Dashboard Data:', dashboardData)
                    
                    if (dashboardData.available_features) {
                        setFeatures(dashboardData.available_features)
                    } else {
                        // Fallback to separate features endpoint
                        const featuresData = await apiClient.getStudentFeatures()
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
                                allowed_user_types: ['student'],
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
                    console.error('Failed to fetch student features:', error)
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

            {/* StudentSidebar is now fixed positioned */}
            <StudentSidebar />

            {/* Main Content with proper spacing */}
            <div className="pt-16 lg:pl-64">
                <main className="p-6 pb-safe lg:pb-6 min-h-screen">
                    {children ? (
                        children
                    ) : (
                        <div className="space-y-6">
                            <WelcomeMessage studentName={studentName} />
                            <DashboardStats />
                            <div className="xl:grid-cols-10 grid grid-cols-1 gap-6">
                                <div className="xl:col-span-7 space-y-6">
                                    <AnalyticsChart />
                                    <RecentActivities />
                                </div>
                                <div className="xl:col-span-3 space-y-6">
                                    <StudentFeatures 
                                        features={features}
                                        loading={featuresLoading}
                                    />
                                    <AdvertisementBanner />
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

export function StudentDashboardLayout({ children }: StudentDashboardLayoutProps) {
    return (
        <>
            <StudentDashboardContent children={children} />
            <LoadingOverlay />
        </>
    )
}
