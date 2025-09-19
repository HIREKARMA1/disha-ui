"use client"

import { motion } from 'framer-motion'
import { 
  Settings, 
  Building2, 
  Activity, 
  Users, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Download,
  BarChart3,
  Globe,
  Shield,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeatureFlagCard } from './FeatureFlagCard'
import { UniversityFeatureManager } from './UniversityFeatureManager'
import { FeatureFlag, UniversityFeatureFlag, UniversityFeatureUpdate, BulkUniversityFeatureUpdate, FEATURE_CATEGORIES, FeatureCategory } from '@/types/feature-flags'
import { useState, useEffect, useMemo } from 'react'

interface FeatureFlagDashboardProps {
  features: FeatureFlag[]
  universityFlags: UniversityFeatureFlag[]
  universities: Array<{ id: string; name: string; email: string; status: string }>
  onFeatureToggle?: (featureId: string, universityId: string, enabled: boolean) => void
  onBulkUpdate?: (updates: BulkUniversityFeatureUpdate) => void
  onFeatureEdit?: (feature: FeatureFlag) => void
  onFeatureDelete?: (featureId: string) => void
  onAssignToUniversity?: (featureId: string, universityId: string) => void
  loading?: boolean
  refreshTrigger?: number
}

export function FeatureFlagDashboard({
  features,
  universityFlags,
  universities,
  onFeatureToggle,
  onBulkUpdate,
  onFeatureEdit,
  onFeatureDelete,
  onAssignToUniversity,
  loading = false,
  refreshTrigger
}: FeatureFlagDashboardProps) {
  const [activeTab, setActiveTab] = useState<'universities' | 'university-features'>('universities')
  const [selectedUniversityForFeatures, setSelectedUniversityForFeatures] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [togglingFeatures, setTogglingFeatures] = useState<Set<string>>(new Set())

  // Filter features based on search and filters
  const filteredFeatures = useMemo(() => {
    return features.filter(feature => {
      const matchesSearch = feature.feature_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           feature.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           feature.feature_key.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = !categoryFilter || feature.feature_category === categoryFilter
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && feature.is_active) ||
                           (statusFilter === 'inactive' && !feature.is_active)
      
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [features, searchQuery, categoryFilter, statusFilter])

  // Get statistics
  const stats = useMemo(() => {
    const totalFeatures = features.length
    const activeFeatures = features.filter(f => f.is_active).length
    const globalFeatures = features.filter(f => f.is_global).length
    const totalUniversities = universities.length
    
    // Calculate university feature usage
    const universityStats = universities.map(uni => {
      const uniFlags = universityFlags.filter(uf => uf.university_id === uni.id)
      
      // Debug logging
      console.log(`🔍 University ${uni.name} (${uni.id}):`, {
        totalFlags: uniFlags.length,
        enabledFlags: uniFlags.filter(uf => uf.is_enabled).length,
        allFlags: uniFlags.map(uf => ({
          feature_flag_id: uf.feature_flag_id,
          is_enabled: uf.is_enabled,
          status: uf.status
        }))
      })
      
      // Count enabled features by checking each feature individually
      // Only count if the flag explicitly exists and is enabled
      let enabledCount = 0
      for (const feature of features) {
        const universityFlag = uniFlags.find(uf => uf.feature_flag_id === feature.id)
        // Only count as enabled if the flag exists AND is explicitly enabled
        if (universityFlag && universityFlag.is_enabled === true) {
          enabledCount++
        }
      }
      
      console.log(`📊 University ${uni.name} counts:`, {
        totalFeatures: totalFeatures,
        enabledFeatures: enabledCount,
        disabledFeatures: totalFeatures - enabledCount
      })
      
      return {
        id: uni.id,
        name: uni.name,
        totalFeatures: totalFeatures,
        enabledFeatures: enabledCount,
        disabledFeatures: totalFeatures - enabledCount,
        enabledPercentage: totalFeatures > 0 ? Math.round((enabledCount / totalFeatures) * 100) : 0
      }
    })

    return {
      totalFeatures,
      activeFeatures,
      globalFeatures,
      totalUniversities,
      universityStats
    }
  }, [features, universities, universityFlags])

  const getFeaturesByCategory = () => {
    const categories = filteredFeatures.reduce((acc, feature) => {
      const category = feature.feature_category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(feature)
      return acc
    }, {} as Record<string, FeatureFlag[]>)

    return categories
  }

  const handleBulkUpdate = async (universityId: string, updates: Array<{ feature_flag_id: string; is_enabled: boolean }>) => {
    if (!onBulkUpdate) return

    const bulkUpdate: BulkUniversityFeatureUpdate = {
      university_id: universityId,
      feature_updates: updates.map(update => ({
        ...update,
        feature_key: update.feature_flag_id // Use feature_flag_id as feature_key for now
      })),
      reason: `Bulk update via admin panel at ${new Date().toISOString()}`
    }

    await onBulkUpdate(bulkUpdate)
  }

  // Wrapper function to handle UniversityFeatureUpdate[] from UniversityFeatureManager
  const handleUniversityUpdate = async (updates: UniversityFeatureUpdate[]) => {
    console.log('🔄 handleUniversityUpdate called with:', updates)
    console.log('🔄 Updates count:', updates.length)
    console.log('🔄 onBulkUpdate function:', onBulkUpdate ? 'Present' : 'Missing')
    
    if (!onBulkUpdate || updates.length === 0) {
      console.log('❌ Early return: onBulkUpdate missing or no updates')
      return
    }

    // Extract university_id from the first update (all should have the same university_id)
    const universityId = updates[0].university_id
    console.log('🔄 University ID:', universityId)
    
    // Convert UniversityFeatureUpdate[] to the format expected by bulk update
    const featureUpdates = updates.map(update => {
      // Find the feature to get the feature_key
      const feature = features.find(f => f.id === update.feature_flag_id)
      const result = {
        feature_flag_id: update.feature_flag_id,
        feature_key: feature?.feature_key || update.feature_flag_id,
        is_enabled: update.is_enabled,
        reason: update.reason,
        custom_config: update.custom_config
      }
      console.log('🔄 Feature update:', result)
      return result
    })

    const bulkUpdate: BulkUniversityFeatureUpdate = {
      university_id: universityId,
      feature_updates: featureUpdates,
      reason: `Bulk update via admin panel at ${new Date().toISOString()}`
    }

    console.log('🔄 Sending bulk update:', bulkUpdate)
    await onBulkUpdate(bulkUpdate)
  }


  // Handle feature toggle with loading state
  const handleFeatureToggle = async (featureId: string, universityId: string, enabled: boolean) => {
    if (!onFeatureToggle) return
    
    setTogglingFeatures(prev => new Set(prev).add(featureId))
    try {
      await onFeatureToggle(featureId, universityId, enabled)
    } catch (error) {
      console.error('Failed to toggle feature:', error)
    } finally {
      setTogglingFeatures(prev => {
        const newSet = new Set(prev)
        newSet.delete(featureId)
        return newSet
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Feature Flag Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage feature access across universities
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Features</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
              {stats.totalFeatures}
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">Active Features</span>
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
              {stats.activeFeatures}
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Global Features</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
              {stats.globalFeatures}
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Universities</span>
            </div>
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100 mt-1">
              {stats.totalUniversities}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'universities', label: 'Universities List', icon: Building2 },
              { id: 'university-features', label: 'University Features', icon: Settings, disabled: !selectedUniversityForFeatures }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id as any)}
                disabled={tab.disabled}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : tab.disabled
                    ? 'border-transparent text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.disabled && <span className="text-xs text-gray-400">(Select University)</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Universities List Tab */}
          {activeTab === 'universities' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Universities List
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Click on a university to manage its features
                </div>
              </div>

              {/* Universities Table */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          University
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Features Enabled
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {universities.map((university) => {
                        const uniFlags = universityFlags.filter(uf => uf.university_id === university.id)
                        
                        // Count enabled features by checking each feature individually
                        // Only count if the flag exists AND is explicitly enabled
                        let enabledCount = 0
                        for (const feature of features) {
                          const universityFlag = uniFlags.find(uf => uf.feature_flag_id === feature.id)
                          if (universityFlag && universityFlag.is_enabled === true) {
                            enabledCount++
                          }
                        }
                        
                        const totalCount = features.length
                        const enabledPercentage = totalCount > 0 ? Math.round((enabledCount / totalCount) * 100) : 0
                        
                        // Debug logging
                        console.log(`🏫 University ${university.name} counting:`, {
                          totalFeatures: totalCount,
                          enabledFeatures: enabledCount,
                          disabledFeatures: totalCount - enabledCount,
                          uniFlags: uniFlags.length,
                          enabledFlags: uniFlags.filter(uf => uf.is_enabled).length
                        })
                  
                  return (
                          <tr 
                            key={university.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedUniversityForFeatures(university.id)
                              setActiveTab('university-features')
                            }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                                  <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {university.name}
                        </div>
                        </div>
                      </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                                {university.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                university.status === 'active'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                              }`}>
                                {university.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-1 mr-3">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {enabledCount}/{totalCount}
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400">
                                      {enabledPercentage}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                                    <div
                                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${enabledPercentage}%` }}
                                    />
                                  </div>
                      </div>
                    </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedUniversityForFeatures(university.id)
                                  setActiveTab('university-features')
                                }}
                                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                              >
                                Manage Features
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* University Features Tab */}
          {activeTab === 'university-features' && selectedUniversityForFeatures && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setActiveTab('universities')}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    ← Back to Universities
                  </button>
                  <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Features for {universities.find(u => u.id === selectedUniversityForFeatures)?.name}
                </h3>
                </div>
              </div>

              {/* Feature Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Features</span>
            </div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                    {features.length}
              </p>
            </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">Enabled</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                    {features.filter(feature => {
                      const universityFlag = universityFlags.find(uf => uf.feature_flag_id === feature.id && uf.university_id === selectedUniversityForFeatures)
                      return universityFlag?.is_enabled === true
                    }).length}
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-200">Disabled</span>
                  </div>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">
                    {features.filter(feature => {
                      const universityFlag = universityFlags.find(uf => uf.feature_flag_id === feature.id && uf.university_id === selectedUniversityForFeatures)
                      return universityFlag?.is_enabled !== true
                    }).length}
                  </p>
                </div>
              </div>

              {/* Features List with Toggles */}
              <div className="space-y-4">
                {features.map(feature => {
                  const universityFlag = universityFlags.find(uf => uf.feature_flag_id === feature.id && uf.university_id === selectedUniversityForFeatures)
                  const isEnabled = universityFlag?.is_enabled ?? false
                  
                  return (
                    <div
                      key={feature.id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${FEATURE_CATEGORIES[feature.feature_category as FeatureCategory]?.color || 'blue'}-100 dark:bg-${FEATURE_CATEGORIES[feature.feature_category as FeatureCategory]?.color || 'blue'}-900/20`}>
                              <Settings className={`w-4 h-4 text-${FEATURE_CATEGORIES[feature.feature_category as FeatureCategory]?.color || 'blue'}-600 dark:text-${FEATURE_CATEGORIES[feature.feature_category as FeatureCategory]?.color || 'blue'}-400`} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">{feature.feature_name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <span className="font-mono">{feature.feature_key}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              feature.feature_category === 'career' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                              feature.feature_category === 'practice' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                              feature.feature_category === 'video_search' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                              feature.feature_category === 'library' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                              feature.feature_category === 'resume' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' :
                              feature.feature_category === 'sadhana' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                              feature.feature_category === 'sangha' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              feature.feature_category === 'SANGHA' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                            }`}>
                              {FEATURE_CATEGORIES[feature.feature_category as FeatureCategory]?.label || feature.feature_category}
                            </span>
                            {feature.is_global && (
                              <span className="flex items-center space-x-1">
                                <Globe className="w-3 h-3" />
                                <span>Global</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className={`font-medium text-sm ${isEnabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {isEnabled ? 'Enabled' : 'Disabled'}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {universityFlag ? 'University Setting' : 'Default Setting'}
                              </div>
                            </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {isEnabled ? 'ON' : 'OFF'}
                            </span>
                            <button
                              onClick={() => handleFeatureToggle(feature.id, selectedUniversityForFeatures, !isEnabled)}
                              disabled={loading || !feature.is_active || togglingFeatures.has(feature.id)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                                isEnabled 
                                  ? 'bg-green-500 hover:bg-green-600' 
                                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                              } ${loading || !feature.is_active || togglingFeatures.has(feature.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-200 ${
                                  isEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                              {togglingFeatures.has(feature.id) && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                            </button>
                            {isEnabled ? (
                              <ToggleRight className="w-4 h-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
