"use client"

import { motion } from 'framer-motion'
import { 
  Settings, 
  Activity, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  Shield,
  BarChart3,
  BookOpen,
  Video,
  FileText,
  Heart,
  Users
} from 'lucide-react'
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
import { useState, useEffect } from 'react'

interface UniversityFeaturesProps {
  features: FeatureFlagWithUniversityStatus[]
  loading?: boolean
}

const getFeatureIcon = (category: string) => {
  switch (category) {
    case 'career': return <TrendingUp className="w-5 h-5" />
    case 'practice': return <BookOpen className="w-5 h-5" />
    case 'video_search': return <Video className="w-5 h-5" />
    case 'library': return <BookOpen className="w-5 h-5" />
    case 'resume': return <FileText className="w-5 h-5" />
    case 'sadhana': return <Heart className="w-5 h-5" />
    case 'sangha': return <Users className="w-5 h-5" />
    default: return <Settings className="w-5 h-5" />
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'enabled': return <CheckCircle className="w-4 h-4 text-green-500" />
    case 'disabled': return <AlertCircle className="w-4 h-4 text-red-500" />
    case 'maintenance': return <Clock className="w-4 h-4 text-yellow-500" />
    default: return <AlertCircle className="w-4 h-4 text-gray-500" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'enabled': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    case 'disabled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
  }
}

export function UniversityFeatures({ features, loading = false }: UniversityFeaturesProps) {
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Available Features</h2>
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!features || features.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Available Features</h2>
        </div>
        <div className="text-center py-8">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No features available yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Contact your administrator to enable features for your university
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Available Features</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {features.length} feature{features.length !== 1 ? 's' : ''} available
        </span>
      </div>

      <div className="grid gap-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
              expandedFeature === feature.id 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {feature.icon ? (
                    <span className="text-2xl">{feature.icon}</span>
                  ) : (
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                      {getFeatureIcon(feature.feature_category || '')}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                    {feature.display_name || feature.feature_name || 'Unknown Feature'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {feature.description || 'No description available'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(feature.university_status?.status || (feature.is_available ? 'enabled' : 'disabled'))}`}>
                  {getStatusIcon(feature.university_status?.status || (feature.is_available ? 'enabled' : 'disabled'))}
                  <span className="ml-1 capitalize">{feature.university_status?.status || (feature.is_available ? 'enabled' : 'disabled')}</span>
                </span>
                
                {(feature.university_status?.custom_message || feature.maintenance_message) && (
                  <button
                    onClick={() => setExpandedFeature(expandedFeature === feature.id ? null : feature.id)}
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {expandedFeature === feature.id && (feature.university_status?.custom_message || feature.maintenance_message) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="space-y-3">
                  {(feature.university_status?.custom_message || feature.maintenance_message) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {feature.university_status?.custom_message ? 'Custom Message' : 'Maintenance Message'}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.university_status?.custom_message || feature.maintenance_message}
                      </p>
                    </div>
                  )}
                  
                  {feature.university_status?.custom_settings && Object.keys(feature.university_status.custom_settings).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Custom Settings</h4>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                          {JSON.stringify(feature.university_status.custom_settings, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Category: {feature.feature_category || 'Unknown'}</span>
                    <span>•</span>
                    <span>Order: {feature.order || 0}</span>
                    {feature.is_global && (
                      <>
                        <span>•</span>
                        <span className="flex items-center">
                          <Globe className="w-3 h-3 mr-1" />
                          Global
                        </span>
                      </>
                    )}
                    {feature.requires_auth && (
                      <>
                        <span>•</span>
                        <span className="flex items-center">
                          <Shield className="w-3 h-3 mr-1" />
                          Auth Required
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
