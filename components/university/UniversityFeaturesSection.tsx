"use client"

import { motion } from 'framer-motion'
import { 
  Settings, 
  Activity, 
  CheckCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Globe,
  Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeatureFlag, UniversityFeatureFlag, FEATURE_CATEGORIES, FeatureCategory } from '@/types/feature-flags'
import { useState, useEffect, useMemo } from 'react'

interface UniversityFeaturesSectionProps {
  features: FeatureFlag[]
  universityFlags: UniversityFeatureFlag[]
  universityId: string
  universityName: string
  onRefresh?: () => void
  loading?: boolean
}

export function UniversityFeaturesSection({
  features,
  universityFlags,
  universityId,
  universityName,
  onRefresh,
  loading = false
}: UniversityFeaturesSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all')

  // Filter features based on search and filters
  const filteredFeatures = useMemo(() => {
    return features.filter(feature => {
      const matchesSearch = feature.feature_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           feature.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           feature.feature_key.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = !categoryFilter || feature.feature_category === categoryFilter
      
      // Check if feature is enabled for this university
      const universityFlag = universityFlags.find(uf => uf.feature_flag_id === feature.id && uf.university_id === universityId)
      const isEnabled = universityFlag?.is_enabled ?? false
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'enabled' && isEnabled) ||
                           (statusFilter === 'disabled' && !isEnabled)
      
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [features, universityFlags, universityId, searchQuery, categoryFilter, statusFilter])

  // Get statistics
  const stats = useMemo(() => {
    const totalFeatures = features.length
    const enabledFeatures = features.filter(feature => {
      const universityFlag = universityFlags.find(uf => uf.feature_flag_id === feature.id && uf.university_id === universityId)
      return universityFlag?.is_enabled ?? false
    }).length
    const disabledFeatures = totalFeatures - enabledFeatures
    const enabledPercentage = totalFeatures > 0 ? Math.round((enabledFeatures / totalFeatures) * 100) : 0

    return {
      totalFeatures,
      enabledFeatures,
      disabledFeatures,
      enabledPercentage
    }
  }, [features, universityFlags, universityId])

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
                Features
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Available features for {universityName}
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
              <span className="text-sm font-medium text-green-800 dark:text-green-200">Enabled</span>
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
              {stats.enabledFeatures}
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-800 dark:text-red-200">Disabled</span>
            </div>
            <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">
              {stats.disabledFeatures}
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Enabled %</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
              {stats.enabledPercentage}%
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
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
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* Features List */}
      <div className="space-y-4">
        {filteredFeatures.length > 0 ? (
          filteredFeatures.map(feature => {
            const universityFlag = universityFlags.find(uf => uf.feature_flag_id === feature.id && uf.university_id === universityId)
            const isEnabled = universityFlag?.is_enabled ?? false
            
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
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
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isEnabled 
                          ? 'bg-green-500' 
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}>
                        {isEnabled ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : (
                          <Clock className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })
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
  )
}
