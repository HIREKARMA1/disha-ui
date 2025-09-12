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
import { Building2, RefreshCw } from 'lucide-react'

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

      // Load university-specific feature flags if a university is selected
      let universityFlagsData: UniversityFeatureFlag[] = []
      if (selectedUniId) {
        console.log('🏫 Loading feature flags for university:', selectedUniId)
        universityFlagsData = await apiClient.getUniversityFeatureFlags(selectedUniId)
        console.log('✅ University flags loaded for', selectedUniId, ':', universityFlagsData.length)
        console.log('📊 University flags data sample:', universityFlagsData.slice(0, 3))
        
        // Also get the summary for accurate counts
        try {
          const summary = await apiClient.getUniversityFeaturesSummary(selectedUniId)
          console.log('✅ University features summary:', summary)
        } catch (err) {
          console.warn('⚠️ Could not load university features summary:', err)
        }
      } else {
        // Load all university feature flags (this will be empty, but keeping for compatibility)
        universityFlagsData = await apiClient.getUniversityFeatureFlags()
        console.log('✅ All university flags loaded:', universityFlagsData.length)
      }

      // Add default_enabled property based on is_global for frontend compatibility
      const featuresWithDefaults = featuresData.map(feature => ({
        ...feature,
        default_enabled: feature.is_global // Global features are enabled by default
      }))
      
      // Update state with fresh data
      setFeatures(featuresWithDefaults)
      setUniversityFlags(universityFlagsData)
      setUniversities(universitiesData)
      
      console.log('🔄 State updated with fresh data:')
      console.log('📊 Features count:', featuresWithDefaults.length)
      console.log('📊 University flags count:', universityFlagsData.length)
      console.log('📊 Universities count:', universitiesData.length)
      
      // Log detailed university flags data for debugging
      if (selectedUniId && universityFlagsData.length > 0) {
        const enabledCount = universityFlagsData.filter(uf => uf.is_enabled).length
        const disabledCount = universityFlagsData.length - enabledCount
        console.log('📊 University flags breakdown:')
        console.log('  - Enabled:', enabledCount)
        console.log('  - Disabled:', disabledCount)
        console.log('  - Total:', universityFlagsData.length)
        console.log('📊 Sample university flags:', universityFlagsData.slice(0, 3).map(uf => ({
          feature_flag_id: uf.feature_flag_id,
          is_enabled: uf.is_enabled
        })))
      }
      
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
      
      // Update local state
      setUniversityFlags(prev => {
        const existing = prev.find(uf => uf.university_id === universityId && uf.feature_flag_id === featureId)
        if (existing) {
          return prev.map(uf => 
            uf.university_id === universityId && uf.feature_flag_id === featureId
              ? { ...uf, is_enabled: enabled }
              : uf
          )
        } else {
          return [...prev, {
            id: `temp-${Date.now()}`,
            university_id: universityId,
            feature_flag_id: featureId,
            is_enabled: enabled,
            enabled_at: enabled ? new Date().toISOString() : undefined,
            disabled_at: enabled ? undefined : new Date().toISOString(),
            enabled_by: user?.id || 'admin',
            disabled_by: enabled ? undefined : user?.id || 'admin',
            reason: update.reason,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
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

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered')
    setRefreshTrigger(prev => prev + 1)
    await loadData(selectedUniversity)
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
          {/* University Selection */}
          <div className="mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-6 h-6 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    University Feature Management
                  </h2>
                </div>
                <Button
                  onClick={() => loadData()}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select University
                  </label>
                  <Select value={selectedUniversity} onValueChange={handleUniversitySelection}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a university to manage features" />
                    </SelectTrigger>
                    <SelectContent>
                      {universities.map((university) => (
                        <SelectItem key={university.id} value={university.id}>
                          <div className="flex items-center space-x-2">
                            <span>{university.name}</span>
                            <span className="text-xs text-gray-500">({university.email})</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              university.status === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                            }`}>
                              {university.status}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedUniversity && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Managing features for: <span className="font-medium">
                      {universities.find(u => u.id === selectedUniversity)?.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <FeatureFlagDashboard
            features={features}
            universityFlags={universityFlags}
            universities={universities}
            selectedUniversity={selectedUniversity}
            onFeatureToggle={handleFeatureToggle}
            onBulkUpdate={handleBulkUpdate}
            onFeatureEdit={handleFeatureEdit}
            onFeatureDelete={handleFeatureDelete}
            onAssignToUniversity={handleAssignToUniversity}
            onRefresh={handleRefresh}
            loading={loading}
            refreshTrigger={refreshTrigger}
          />
        </motion.div>
      </main>
    </div>
  )
}
