"use client"

import { motion } from 'framer-motion'
import { 
  Settings, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Globe, 
  Users, 
  Shield,
  Activity,
  MoreVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeatureFlag, FEATURE_CATEGORIES, FeatureCategory } from '@/types/feature-flags'
import { useState } from 'react'

interface FeatureFlagCardProps {
  feature: FeatureFlag
  universityFlags?: Array<{ university_id: string; is_enabled: boolean }>
  onToggle?: (featureId: string, enabled: boolean) => void
  onEdit?: (feature: FeatureFlag) => void
  onDelete?: (featureId: string) => void
  loading?: boolean
  showUniversityStatus?: boolean
}

export function FeatureFlagCard({
  feature,
  universityFlags = [],
  onToggle,
  onEdit,
  onDelete,
  loading = false,
  showUniversityStatus = false
}: FeatureFlagCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const categoryInfo = FEATURE_CATEGORIES[feature.feature_category as FeatureCategory]
  const enabledUniversities = universityFlags.filter(uf => uf.is_enabled).length
  const totalUniversities = universityFlags.length

  const getStatusColor = (isActive: boolean, isEnabled: boolean) => {
    if (!isActive) return 'text-gray-400'
    if (isEnabled) return 'text-green-600 dark:text-green-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getStatusText = (isActive: boolean, isEnabled: boolean) => {
    if (!isActive) return 'Inactive'
    if (isEnabled) return 'Enabled'
    return 'Disabled'
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200',
      green: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
      purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200',
      red: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200',
      orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200',
      teal: 'bg-teal-100 dark:bg-teal-900/20 text-teal-800 dark:text-teal-200'
    }
    return colors[categoryInfo?.color as keyof typeof colors] || colors.blue
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            {/* Category Icon */}
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getCategoryColor(categoryInfo?.color || 'blue')}`}>
              <Settings className="w-6 h-6" />
            </div>

            {/* Feature Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {feature.feature_name}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(categoryInfo?.color || 'blue')}`}>
                  {categoryInfo?.label}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {feature.description}
              </p>

              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <span className={`w-2 h-2 rounded-full ${feature.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  <span className={getStatusColor(feature.is_active, feature.default_enabled ?? false)}>
                    {getStatusText(feature.is_active, feature.default_enabled ?? false)}
                  </span>
                </div>
                
                {feature.is_global && (
                  <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                    <Globe className="w-4 h-4" />
                    <span>Global</span>
                  </div>
                )}

                {showUniversityStatus && totalUniversities > 0 && (
                  <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{enabledUniversities}/{totalUniversities} universities</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {onToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggle(feature.id, !feature.default_enabled)}
                disabled={loading || !feature.is_active}
                className="p-2"
              >
                {feature.default_enabled ? (
                  <ToggleRight className="w-5 h-5 text-green-600" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-gray-400" />
                )}
              </Button>
            )}

            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowActions(!showActions)}
                className="p-2"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>

              {showActions && (
                <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 min-w-[120px]">
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit(feature)
                        setShowActions(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        onDelete(feature.id)
                        setShowActions(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-6 bg-gray-50 dark:bg-gray-700/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature Details */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Feature Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Key:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{feature.feature_key}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Category:</span>
                  <span className="text-gray-900 dark:text-white">{categoryInfo?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Global:</span>
                  <span className="text-gray-900 dark:text-white">{feature.is_global ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Default Enabled:</span>
                  <span className="text-gray-900 dark:text-white">{feature.default_enabled ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            {/* User Access */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">User Access</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">User Types:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(feature as any).user_types?.map((type: any, index: number) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded text-xs">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Required Roles:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(feature as any).required_roles?.length > 0 ? (
                      (feature as any).required_roles.map((role: any, index: number) => (
                        <span key={index} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 rounded text-xs">
                          {role}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400 text-xs">No specific roles required</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Created:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {new Date(feature.created_at).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {new Date(feature.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <Activity className="w-4 h-4 mr-1" />
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </Button>

          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <Shield className="w-3 h-3" />
            <span>Admin Only</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
