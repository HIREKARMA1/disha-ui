"use client"

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/navbar'
import { FeatureFlagDashboard } from '@/components/admin/FeatureFlagDashboard'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiClient } from '@/lib/api'
import { FeatureFlag, UniversityFeatureFlag, BulkUniversityFeatureUpdate, UniversityFeatureUpdate } from '@/types/feature-flags'
import { useAuth } from '@/hooks/useAuth'
import { Building2 } from 'lucide-react'

export default function AdminFeatureFlagsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [features, setFeatures] = useState<FeatureFlag[]>([])
  const [universityFlags, setUniversityFlags] = useState<UniversityFeatureFlag[]>([])
  const [universities, setUniversities] = useState<Array<{ id: string; name: string; email: string; status: string }>>([])
  const [selectedUniversity, setSelectedUniversity] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    if (authLoading) return

    // Check if user is authenticated and is admin
    if (!user) {
      console.log('No user found, redirecting to login')
      router.push('/auth/login')
      return
    }

    if (user.user_type !== 'admin') {
      console.log('User is not admin, redirecting to login. User type:', user.user_type)
      router.push('/auth/login')
      return
    }

    console.log('User is admin, loading data')
    loadData()
  }, [user, authLoading, router])

  const loadData = async (selectedUniId?: string) => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔄 Loading feature flag data...')
      console.log('👤 Current user:', user)
      console.log('🏫 Selected university ID:', selectedUniId)

      // Load features and universities first
      const [featuresData, universitiesData] = await Promise.all([
        apiClient.getFeatureFlags(),
        apiClient.getUniversities()
      ])

      console.log('✅ Features loaded:', featuresData.length)
      console.log('✅ Universities loaded:', universitiesData.length)

      // Load ALL university feature flags to show counts in the universities table
      console.log('🏫 Loading ALL university feature flags for count calculation...')
      const allUniversityFlagsData = await apiClient.getUniversityFeatureFlags()
      console.log('✅ All university flags loaded:', allUniversityFlagsData.length)
      
      // Log enabled/disabled counts for debugging
      const enabledCount = allUniversityFlagsData.filter(flag => flag.is_enabled).length
      const disabledCount = allUniversityFlagsData.filter(flag => !flag.is_enabled).length
      console.log(`📈 All university flags breakdown: ${enabledCount} enabled, ${disabledCount} disabled`)
      
      // Set the university flags data
      setUniversityFlags(allUniversityFlagsData)

      // Add default_enabled property based on is_global for frontend compatibility
      const featuresWithDefaults = featuresData.map(feature => ({
        ...feature,
        default_enabled: feature.is_global // Global features are enabled by default
      }))
      
      // Update state with fresh data
      setFeatures(featuresWithDefaults)
      setUniversities(universitiesData)
      
      console.log('🔄 State updated with fresh data:')
      console.log('📊 Features count:', featuresWithDefaults.length)
      console.log('📊 University flags count:', allUniversityFlagsData.length)
      console.log('📊 Universities count:', universitiesData.length)
      
      
    } catch (err: any) {
      console.error('❌ Failed to load feature flag data:', err)
      console.error('❌ Error response:', err.response?.data)
      console.error('❌ Error status:', err.response?.status)
      console.error('❌ Error headers:', err.response?.headers)
      
      // Handle authentication errors
      if (err.response?.status === 401) {
        console.log('🔐 Authentication failed, redirecting to login')
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_data')
        router.push('/auth/login')
        return
      }
      
      setError(err.response?.data?.message || err.message || 'Failed to load feature flag data')
    } finally {
      setLoading(false)
    }
  }

  const handleFeatureToggle = async (featureId: string, universityId: string, enabled: boolean) => {
    try {
      // Find the feature to get the feature_key
      const feature = features.find(f => f.id === featureId);
      if (!feature) {
        console.error('Feature not found:', featureId);
        return;
      }

      const update: UniversityFeatureUpdate = {
        university_id: universityId,
        feature_flag_id: featureId,
        feature_key: feature.feature_key, // Add feature_key for backend compatibility
        is_enabled: enabled,
        reason: `Toggled via admin panel at ${new Date().toISOString()}`
      }

      await apiClient.updateUniversityFeatureFlag(update)
      
      // Update local state with better conflict resolution
      setUniversityFlags(prev => {
        const existingIndex = prev.findIndex(uf => uf.university_id === universityId && uf.feature_flag_id === featureId)
        
        if (existingIndex !== -1) {
          // Update existing entry
          const updated = [...prev]
          updated[existingIndex] = { 
            ...updated[existingIndex], 
            is_enabled: enabled,
            status: enabled ? 'enabled' : 'disabled',
            updated_at: new Date().toISOString()
          }
          return updated
        } else {
          // Add new entry
          return [...prev, {
            id: `temp-${Date.now()}-${Math.random()}`,
            university_id: universityId,
            feature_flag_id: featureId,
            is_enabled: enabled,
            status: enabled ? 'enabled' : 'disabled',
            enabled_at: enabled ? new Date().toISOString() : undefined,
            disabled_at: enabled ? undefined : new Date().toISOString(),
            enabled_by: user?.id || 'admin',
            disabled_by: enabled ? undefined : user?.id || 'admin',
            reason: update.reason,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            tenant_id: 'default'
          }]
        }
      })
    } catch (err: any) {
      console.error('Failed to toggle feature:', err)
      setError(err.response?.data?.message || 'Failed to toggle feature')
    }
  }


  const handleBulkUpdate = async (updates: BulkUniversityFeatureUpdate) => {
    try {
      console.log('🔄 Performing bulk update:', updates)
      console.log('🔄 Updates count:', updates.feature_updates.length)
      console.log('🔄 University ID:', updates.university_id)
      
      // Extract enabled features from the updates
      const enabledFeatures = updates.feature_updates
        .filter(update => update.is_enabled)
        .map(update => update.feature_key)
      
      console.log('🔄 All feature updates:', updates.feature_updates)
      console.log('🔄 Enabled features to save:', enabledFeatures)
      console.log('🔄 Enabled features count:', enabledFeatures.length)
      
      // Use the new save endpoint
      const result = await apiClient.saveUniversityFeatures(updates.university_id, enabledFeatures)
      console.log('✅ Save result:', result)
      
      // All updates successful, reload data to get updated state
      console.log('✅ Save successful, reloading data...')
      console.log('📊 Result details:', {
        totalFeatures: result.totalFeatures,
        enabledCount: result.enabledCount,
        disabledCount: result.disabledCount
      })
      
      // Force a complete data reload with a small delay to ensure backend is updated
      setTimeout(async () => {
        console.log('🔄 Reloading data after successful save...')
        await forceRefreshData(updates.university_id)
        console.log('✅ Data reload completed')
      }, 1000) // Increased delay to 1 second to ensure backend has processed the update
      
      setError(null) // Clear any previous errors
      console.log('✅ Save completed successfully')
    } catch (err: any) {
      console.error('❌ Failed to save university features:', err)
      setError(err.response?.data?.message || 'Failed to save university features')
    }
  }


  const forceRefreshData = async (universityId?: string) => {
    console.log('🔄 Force refresh data triggered for university:', universityId || selectedUniversity)
    setRefreshTrigger(prev => prev + 1)
    await loadData(universityId || selectedUniversity)
  }


  const handleAssignToUniversity = async (featureId: string, universityId: string) => {
    try {
      // Call API to assign feature to university
      await apiClient.setUniversityFeatureFlag(universityId, featureId, 'enabled', {
        custom_message: `Feature enabled for ${universities.find(u => u.id === universityId)?.name || 'University'}`,
        allowed_user_types: ['student', 'university', 'admin'],
        allowed_roles: ['user', 'admin']
      })
      
      // Refresh data
      await loadData()
      console.log('Feature assigned to university successfully!')
    } catch (error: any) {
      console.error('Failed to assign feature to university:', error)
      console.error('Failed to assign feature to university')
    }
  }

  const handleUniversitySelection = async (universityId: string) => {
    console.log('🏫 University selected:', universityId)
    setSelectedUniversity(universityId)
    
    // Load feature flags for the selected university
    if (universityId) {
      await loadData(universityId)
    }
  }

  const handleFeatureEdit = (feature: FeatureFlag) => {
    // Navigate to edit feature page or open modal
    router.push(`/dashboard/admin/feature-flags/edit/${feature.id}`)
  }

  const handleFeatureDelete = async (featureId: string) => {
    if (!confirm('Are you sure you want to delete this feature? This action cannot be undone.')) {
      return
    }

    try {
      await apiClient.deleteFeatureFlag(featureId)
      setFeatures(prev => prev.filter(f => f.id !== featureId))
    } catch (err: any) {
      console.error('Failed to delete feature:', err)
      setError(err.response?.data?.message || 'Failed to delete feature')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar variant="solid" />
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading feature flags...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar variant="solid" />
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Error Loading Feature Flags</h3>
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => loadData()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Unified Navbar */}
      <Navbar variant="solid" />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >

          <FeatureFlagDashboard
            features={features}
            universityFlags={universityFlags}
            universities={universities}
            onFeatureToggle={handleFeatureToggle}
            onBulkUpdate={handleBulkUpdate}
            onFeatureEdit={handleFeatureEdit}
            onFeatureDelete={handleFeatureDelete}
            onAssignToUniversity={handleAssignToUniversity}
            loading={loading}
            refreshTrigger={refreshTrigger}
          />
        </motion.div>
      </main>
    </div>
  )
}
