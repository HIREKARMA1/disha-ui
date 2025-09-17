'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, CheckCircle, XCircle, Globe, Lock, ToggleLeft, ToggleRight } from 'lucide-react';
import { useUniversityFeatures } from '@/hooks/useUniversityFeatures';
import { useAuth } from '@/hooks/useAuth';
import { UniversityDashboardLayout } from '@/components/dashboard/UniversityDashboardLayout';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function UniversityFeaturesPage() {
  const { user } = useAuth();
  const { features, loading, error, refetch } = useUniversityFeatures();
  const [togglingFeatures, setTogglingFeatures] = useState<Set<string>>(new Set());

  // Debug logging
  useEffect(() => {
    console.log('🎯 Features page - features data:', features);
    console.log('📊 Features page - features count:', features.length);
    console.log('✅ Features page - loading:', loading);
    console.log('❌ Features page - error:', error);
  }, [features, loading, error]);

  const enabledCount = features.filter(f => f.is_available).length;
  const totalCount = features.length;

  const handleToggleFeature = async (featureKey: string, currentStatus: boolean) => {
    if (!user?.id) {
      toast.error('User not found');
      return;
    }

    setTogglingFeatures(prev => new Set(prev).add(featureKey));
    
    try {
      const newStatus = !currentStatus;
      const statusString = newStatus ? 'enabled' : 'disabled';
      
      await apiClient.setUniversityFeatureFlag(
        user.id, // For university users, user.id is the university_id
        featureKey,
        statusString,
        {
          custom_message: newStatus 
            ? `Feature enabled by ${user.name || 'university admin'}` 
            : `Feature disabled by ${user.name || 'university admin'}`,
          allowed_user_types: ['student', 'university'],
          allowed_roles: ['admin', 'moderator']
        }
      );

      toast.success(
        newStatus 
          ? `Feature "${featureKey}" has been enabled` 
          : `Feature "${featureKey}" has been disabled`
      );

      // Refresh features to get updated status
      await refetch();
      
    } catch (error: any) {
      console.error('Failed to toggle feature:', error);
      toast.error(
        error.response?.data?.detail || 
        `Failed to ${currentStatus ? 'disable' : 'enable'} feature`
      );
    } finally {
      setTogglingFeatures(prev => {
        const newSet = new Set(prev);
        newSet.delete(featureKey);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <UniversityDashboardLayout>
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
          
          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Features Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mr-4"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </UniversityDashboardLayout>
    );
  }

  if (error) {
    return (
      <UniversityDashboardLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Failed to Load Features
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          </div>
        </div>
      </UniversityDashboardLayout>
    );
  }

  return (
    <UniversityDashboardLayout>
      <div className="space-y-6">
        {/* Header matching other university pages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-700"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                University Features ⚙️
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                Manage and view available features for {user?.name || 'your university'}
              </p>

              {/* Tags matching other university pages */}
              <div className="flex flex-wrap gap-2">
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-900/40 transition-colors cursor-pointer"
                >
                  📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </motion.span>

                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors cursor-pointer"
                >
                  🎯 Feature Management
                </motion.span>

                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
                >
                  🚀 System Configuration
                </motion.span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards - Matching Dashboard Style */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full"
          >
            <div className="block group w-full">
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md w-full bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Enabled Features
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-200">
                      {enabledCount}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm group-hover:scale-110 transition-transform duration-200">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full"
          >
            <div className="block group w-full">
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md w-full bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Total Features
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-200">
                      {totalCount}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm group-hover:scale-110 transition-transform duration-200">
                    <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full"
          >
            <div className="block group w-full">
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md w-full bg-purple-50 dark:bg-purple-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Global Features
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-200">
                      {features.filter(f => f.is_global).length}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm group-hover:scale-110 transition-transform duration-200">
                    <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Grid - Matching Dashboard Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="w-full"
            >
              <div className="block group w-full">
                <div className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-md w-full ${
                  feature.is_available
                    ? 'border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-200 ${
                        feature.is_available
                          ? 'bg-white dark:bg-gray-800'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <span className="text-2xl">{feature.icon || '⚙️'}</span>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {feature.display_name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {feature.feature_key}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {feature.is_global && (
                        <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded group-hover:scale-110 transition-transform duration-200">
                          <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      )}
                      <div className={`px-3 py-1 rounded-full text-xs font-medium group-hover:scale-105 transition-transform duration-200 ${
                        feature.is_available
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {feature.is_available ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                  </div>

                  {feature.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                      {feature.description}
                    </p>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Category:</span>
                      <span className="text-gray-900 dark:text-white capitalize group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {feature.feature_category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className={`flex items-center group-hover:scale-105 transition-transform duration-200 ${
                        feature.is_available ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {feature.is_available ? (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-1" />
                        )}
                        {feature.is_available ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                    
                    {/* Toggle Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.is_available ? 'Enabled for students' : 'Disabled for students'}
                      </span>
                      <button
                        onClick={() => handleToggleFeature(feature.feature_key, feature.is_available)}
                        disabled={togglingFeatures.has(feature.feature_key) || feature.is_global}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                          feature.is_available
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                        } ${feature.is_global ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            feature.is_available ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                        {togglingFeatures.has(feature.feature_key) && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </button>
                    </div>
                    
                    {feature.is_global && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
                        <Globe className="w-3 h-3 mr-1" />
                        Global feature - cannot be disabled
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {features.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Features Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No features are configured for this university yet.
            </p>
          </motion.div>
        )}
      </div>
    </UniversityDashboardLayout>
  );
}
