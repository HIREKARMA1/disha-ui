"use client"

import { motion } from 'framer-motion'
import { 
  Building2, 
  ToggleLeft, 
  ToggleRight, 
  Save, 
  RotateCcw, 
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Users,
  Activity,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeatureFlag, UniversityFeatureFlag, UniversityFeatureUpdate, FEATURE_CATEGORIES, FeatureCategory } from '@/types/feature-flags'
import { useState, useEffect } from 'react'

interface UniversityFeatureManagerProps {
  universityId: string
  universityName: string
  features: FeatureFlag[]
  universityFlags: UniversityFeatureFlag[]
  onUpdate?: (updates: UniversityFeatureUpdate[]) => void
  loading?: boolean
  refreshTrigger?: number
}

export function UniversityFeatureManager({
  universityId,
  universityName,
  features,
  universityFlags,
  onUpdate,
  loading = false,
  refreshTrigger
}: UniversityFeatureManagerProps) {
  const [localFlags, setLocalFlags] = useState<Record<string, boolean>>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  // Initialize local state with current university flags
  useEffect(() => {
    console.log('🔄 Initializing university feature flags:', {
      features: features.length,
      universityFlags: universityFlags.length,
      universityFlagsData: universityFlags,
      refreshTrigger: refreshTrigger
    })
    
    const initialFlags: Record<string, boolean> = {}
    features.forEach(feature => {
      const universityFlag = universityFlags.find(uf => uf.feature_flag_id === feature.id)
      const isEnabled = universityFlag?.is_enabled ?? feature.default_enabled
      console.log(`Feature ${feature.feature_key}:`, {
        featureId: feature.id,
        universityFlag: universityFlag,
        isEnabled: isEnabled,
        universityFlagData: universityFlag ? {
          id: universityFlag.id,
          university_id: universityFlag.university_id,
          feature_flag_id: universityFlag.feature_flag_id,
          is_enabled: universityFlag.is_enabled,
          status: universityFlag.status
        } : null
      })
      initialFlags[feature.id] = isEnabled
    })
    
    console.log('📊 Initial flags calculated:', initialFlags)
    console.log('📈 Statistics preview:', {
      total: features.length,
      enabled: Object.values(initialFlags).filter(Boolean).length,
      disabled: Object.values(initialFlags).filter(v => !v).length
    })
    
    setLocalFlags(initialFlags)
  }, [features, universityFlags, refreshTrigger])

  // Track changes
  useEffect(() => {
    const hasAnyChanges = features.some(feature => {
      const universityFlag = universityFlags.find(uf => uf.feature_flag_id === feature.id)
      const currentValue = universityFlag?.is_enabled ?? feature.default_enabled
      return localFlags[feature.id] !== currentValue
    })
    setHasChanges(hasAnyChanges)
  }, [localFlags, features, universityFlags])

  // Debug localFlags changes
  useEffect(() => {
    console.log('🔄 localFlags state changed:', {
      localFlags,
      enabledCount: Object.values(localFlags).filter(Boolean).length,
      disabledCount: Object.values(localFlags).filter(v => !v).length,
      totalCount: Object.keys(localFlags).length
    })
  }, [localFlags])

  // Debug refreshTrigger changes
  useEffect(() => {
    console.log('🔄 Refresh trigger changed:', refreshTrigger)
  }, [refreshTrigger])

  const handleToggle = (featureId: string, enabled: boolean) => {
    console.log('🔄 Toggling feature:', {
      featureId,
      enabled,
      currentValue: localFlags[featureId]
    })
    setLocalFlags(prev => {
      const newFlags = {
        ...prev,
        [featureId]: enabled
      }
      console.log('🔄 New localFlags after toggle:', newFlags)
      return newFlags
    })
  }

  const handleSave = async () => {
    if (!onUpdate) return

    setSaving(true)
    try {
      console.log('💾 Starting save process...')
      console.log('📊 Current localFlags before save:', localFlags)
      console.log('📈 Current statistics before save:', {
        enabled: Object.values(localFlags).filter(Boolean).length,
        disabled: Object.values(localFlags).filter(v => !v).length
      })
      
      const updates: UniversityFeatureUpdate[] = features
        .filter(feature => {
          const universityFlag = universityFlags.find(uf => uf.feature_flag_id === feature.id)
          const currentValue = universityFlag?.is_enabled ?? feature.default_enabled
          const hasChanged = localFlags[feature.id] !== currentValue
          console.log(`Feature ${feature.feature_key}:`, {
            currentValue,
            newValue: localFlags[feature.id],
            hasChanged
          })
          return hasChanged
        })
        .map(feature => ({
          university_id: universityId,
          feature_flag_id: feature.id,
          feature_key: feature.feature_key, // Add feature_key for backend compatibility
          is_enabled: localFlags[feature.id],
          reason: `Updated via admin panel at ${new Date().toISOString()}`
        }))

      console.log('📝 Updates to be saved:', updates)
      await onUpdate(updates)
      setHasChanges(false)
      console.log('✅ Save completed, waiting for refresh...')
    } catch (error) {
      console.error('Failed to save university features:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    const resetFlags: Record<string, boolean> = {}
    features.forEach(feature => {
      const universityFlag = universityFlags.find(uf => uf.feature_flag_id === feature.id)
      resetFlags[feature.id] = universityFlag?.is_enabled ?? feature.default_enabled
    })
    setLocalFlags(resetFlags)
  }

  const getFeaturesByCategory = () => {
    const categories = features.reduce((acc, feature) => {
      const category = feature.feature_category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(feature)
      return acc
    }, {} as Record<string, FeatureFlag[]>)

    return categories
  }

  const getCategoryStats = (categoryFeatures: FeatureFlag[]) => {
    const total = categoryFeatures.length
    const enabled = categoryFeatures.filter(feature => localFlags[feature.id]).length
    return { total, enabled, disabled: total - enabled }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700',
      green: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700',
      purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700',
      red: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-700',
      orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700',
      teal: 'bg-teal-100 dark:bg-teal-900/20 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-700'
    }
    return colors[category as keyof typeof colors] || colors.blue
  }

  const featuresByCategory = getFeaturesByCategory()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {universityName}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage feature access for this university
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {hasChanges && (
              <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Unsaved changes</span>
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={!hasChanges || saving}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              loading={saving}
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Features</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {features.length}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Enabled</span>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {(() => {
                const enabledCount = Object.values(localFlags).filter(Boolean).length
                console.log('📊 Enabled count calculation:', {
                  localFlags,
                  enabledCount,
                  allValues: Object.values(localFlags)
                })
                return enabledCount
              })()}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Disabled</span>
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
              {(() => {
                const disabledCount = Object.values(localFlags).filter(v => !v).length
                console.log('📊 Disabled count calculation:', {
                  localFlags,
                  disabledCount,
                  allValues: Object.values(localFlags)
                })
                return disabledCount
              })()}
            </p>
          </div>
        </div>
      </div>

      {/* Features by Category */}
      <div className="space-y-4">
        {Object.entries(featuresByCategory).map(([category, categoryFeatures]) => {
          const categoryInfo = FEATURE_CATEGORIES[category as FeatureCategory]
          const stats = getCategoryStats(categoryFeatures)
          const isExpanded = expandedCategory === category

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Category Header */}
              <div 
                className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${getCategoryColor(categoryInfo?.color || 'blue')}`}
                onClick={() => setExpandedCategory(isExpanded ? null : category)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5" />
                    <div>
                      <h3 className="text-lg font-semibold">{categoryInfo?.label}</h3>
                      <p className="text-sm opacity-80">{categoryInfo?.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {stats.enabled}/{stats.total} enabled
                      </div>
                      <div className="text-xs opacity-80">
                        {Math.round((stats.enabled / stats.total) * 100)}% active
                      </div>
                    </div>
                    
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                      {isExpanded ? (
                        <span className="text-lg">−</span>
                      ) : (
                        <span className="text-lg">+</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Features */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 space-y-3"
                >
                  {categoryFeatures.map(feature => {
                    const isEnabled = localFlags[feature.id]
                    const universityFlag = universityFlags.find(uf => uf.feature_flag_id === feature.id)
                    const isChanged = universityFlag ? localFlags[feature.id] !== universityFlag.is_enabled : localFlags[feature.id] !== feature.default_enabled

                    return (
                      <div
                        key={feature.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                          isChanged 
                            ? 'border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20' 
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {feature.feature_name}
                            </h4>
                            {isChanged && (
                              <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded text-xs font-medium">
                                Modified
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                            {feature.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="font-mono">{feature.feature_key}</span>
                            {feature.is_global && (
                              <span className="flex items-center space-x-1">
                                <Globe className="w-3 h-3" />
                                <span>Global</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="text-right text-sm">
                            <div className={`font-medium ${isEnabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {isEnabled ? 'Enabled' : 'Disabled'}
                            </div>
                            {universityFlag && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {isEnabled ? 'University' : 'Default'}
                              </div>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggle(feature.id, !isEnabled)}
                            disabled={loading || !feature.is_active}
                            className="p-2"
                          >
                            {isEnabled ? (
                              <ToggleRight className="w-5 h-5 text-green-600" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
