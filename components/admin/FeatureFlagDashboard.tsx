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
  RefreshCw,
  BarChart3,
  Globe,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeatureFlagCard } from './FeatureFlagCard'
import { UniversityFeatureManager } from './UniversityFeatureManager'
import { FeatureFlag, UniversityFeatureFlag, BulkUniversityFeatureUpdate, FEATURE_CATEGORIES, FeatureCategory } from '@/types/feature-flags'
import { useState, useEffect, useMemo } from 'react'

interface FeatureFlagDashboardProps {
  features: FeatureFlag[]
  universityFlags: UniversityFeatureFlag[]
  universities: Array<{ id: string; name: string; email: string; status: string }>
  selectedUniversity?: string
  onFeatureToggle?: (featureId: string, universityId: string, enabled: boolean) => void
  onBulkUpdate?: (updates: BulkUniversityFeatureUpdate) => void
  onFeatureEdit?: (feature: FeatureFlag) => void
  onFeatureDelete?: (featureId: string) => void
  onAssignToUniversity?: (featureId: string, universityId: string) => void
  onRefresh?: () => void
  loading?: boolean
  refreshTrigger?: number
}

export function FeatureFlagDashboard({
  features,
  universityFlags,
  universities,
  selectedUniversity,
  onFeatureToggle,
  onBulkUpdate,
  onFeatureEdit,
  onFeatureDelete,
  onAssignToUniversity,
  onRefresh,
  loading = false,
  refreshTrigger
}: FeatureFlagDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'universities' | 'features'>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

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
      const enabledCount = uniFlags.filter(uf => uf.is_enabled).length
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
      feature_updates: updates,
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

  const selectedUniversityData = selectedUniversity 
    ? universities.find(uni => uni.id === selectedUniversity)
    : null

  const selectedUniversityFlags = selectedUniversity
    ? universityFlags.filter(uf => uf.university_id === selectedUniversity)
    : []

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
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh || (() => window.location.reload())}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
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
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'universities', label: 'Universities', icon: Building2 },
              { id: 'features', label: 'Features', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* University Feature Usage Chart */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  University Feature Usage
                </h3>
                <div className="space-y-3">
                  {stats.universityStats.map(uni => (
                    <div key={uni.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {uni.name}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {uni.enabledFeatures}/{uni.totalFeatures} features
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uni.enabledPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Categories Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(FEATURE_CATEGORIES).map(([category, info]) => {
                  const categoryFeatures = features.filter(f => f.feature_category === category)
                  const activeCount = categoryFeatures.filter(f => f.is_active).length
                  
                  return (
                    <div key={category} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${info.color}-100 dark:bg-${info.color}-900/20`}>
                          <Settings className={`w-4 h-4 text-${info.color}-600 dark:text-${info.color}-400`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{info.label}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{info.description}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {activeCount}/{categoryFeatures.length} active
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* University Features Tab - Only show when university is selected */}
          {activeTab === 'universities' && selectedUniversity && selectedUniversityData && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Feature Management for {selectedUniversityData.name}
                </h3>
              </div>

              <UniversityFeatureManager
                key={`${selectedUniversity}-${universityFlags.length}-${refreshTrigger}`}
                universityId={selectedUniversity}
                universityName={selectedUniversityData.name}
                features={features}
                universityFlags={selectedUniversityFlags}
                onUpdate={handleUniversityUpdate}
                loading={loading}
                refreshTrigger={refreshTrigger}
              />
            </div>
          )}

          {/* Show message when no university is selected */}
          {activeTab === 'universities' && !selectedUniversity && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a University
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a university from the dropdown above to manage its feature access
              </p>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search features..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <select
                  value={categoryFilter || ''}
                  onChange={(e) => setCategoryFilter(e.target.value || null)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {Object.entries(FEATURE_CATEGORIES).map(([key, info]) => (
                    <option key={key} value={key}>{info.label}</option>
                  ))}
                </select>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Features Grid */}
              <div className="space-y-4">
                {filteredFeatures.length > 0 ? (
                  filteredFeatures.map(feature => (
                    <FeatureFlagCard
                      key={feature.id}
                      feature={feature}
                      universityFlags={universityFlags.filter(uf => uf.feature_flag_id === feature.id)}
                      onToggle={onFeatureToggle ? (featureId, enabled) => {
                        // For global toggle, we might want to update all universities
                        // This is a simplified implementation
                        console.log('Global feature toggle:', featureId, enabled)
                      } : undefined}
                      onEdit={onFeatureEdit}
                      onDelete={onFeatureDelete}
                      loading={loading}
                      showUniversityStatus={true}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Settings className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Features Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
