'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from './useAuth';

import { StudentFeatureWithAccess } from '@/types/student-features';

interface UseStudentFeatureAccessReturn {
  features: StudentFeatureWithAccess[];
  loading: boolean;
  error: string | null;
  hasFeatureAccess: (featureKey: string) => boolean;
  getFeatureInfo: (featureKey: string) => StudentFeatureWithAccess | undefined;
  refetch: () => Promise<void>;
}

export const useStudentFeatureAccess = (): UseStudentFeatureAccessReturn => {
  const [features, setFeatures] = useState<StudentFeatureWithAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchStudentFeatures = async () => {
    if (!user?.id || user?.user_type !== 'student') {
      setError('No student ID found or user is not a student');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🎯 Fetching university features for student:', user.id);
      
      // Use the new API endpoint that gets university-specific features
      const response = await apiClient.getStudentUniversityFeatures(user.id);
      console.log('🎯 University features API response:', response);
      console.log('🎯 Response type:', typeof response);
      console.log('🎯 Response length:', Array.isArray(response) ? response.length : 'Not an array');
      
      // Check if response is an error
      if (response && typeof response === 'object' && 'error' in response) {
        console.error('🎯 API returned error response:', response);
        throw new Error(`API Error: ${response.error}`);
      }
      
      // Check if response is empty or null
      if (!response || (Array.isArray(response) && response.length === 0)) {
        console.error('🎯 API returned empty response:', response);
        throw new Error('API returned empty response');
      }
      
      // Additional debugging for the response structure
      if (Array.isArray(response) && response.length > 0) {
        console.log('🎯 First feature in response:', response[0]);
        console.log('🎯 All feature keys:', response.map(f => f.feature_key));
        console.log('🎯 All is_available values:', response.map(f => ({ key: f.feature_key, is_available: f.is_available })));
        
        // Debug: Log each feature's exact structure
        response.forEach((feature, index) => {
          console.log(`🎯 Raw feature ${index}:`, {
            feature_key: feature.feature_key,
            display_name: feature.display_name,
            is_available: feature.is_available,
            keys: Object.keys(feature)
          });
        });
      }
      
      // Transform the response to match StudentFeatureWithAccess interface
      const transformedFeatures = response.map((feature: any, index: number) => {
        console.log('🔍 Processing feature:', feature);
        console.log('🔍 Feature is_available:', feature.is_available);
        console.log('🔍 Feature feature_key:', feature.feature_key);
        console.log('🔍 Feature display_name:', feature.display_name);
        
        // Use is_available field directly from the API response
        const isEnabled = feature.is_available || false;
        
        console.log('🔍 Final isEnabled value:', isEnabled);
        
        const transformed: StudentFeatureWithAccess = {
          id: feature.id || `feature-${index}`,
          feature_key: feature.feature_key || 'unknown',
          feature_name: feature.feature_name || feature.feature_key || 'Unknown Feature',
          display_name: feature.display_name || feature.feature_name || 'Unknown Feature',
          description: feature.description || `Access to ${feature.display_name || feature.feature_name} features`,
          icon: feature.icon || 'HelpCircle',
          route: `/${feature.feature_key || 'unknown'}`,
          order: feature.order || index,
          is_active: feature.is_active !== false,
          category: feature.feature_category || 'general',
          requires_auth: feature.requires_auth !== false,
          settings: feature.settings || {},
          created_at: feature.created_at || new Date().toISOString(),
          updated_at: feature.updated_at,
          tenant_id: feature.tenant_id || 'default',
          is_available: isEnabled, // Use the is_available field directly from API
          is_enabled_for_university: isEnabled,
          maintenance_message: feature.maintenance_message,
          university_status: {
            access_reason: feature.university_status?.access_reason || (isEnabled ? 'university_enabled' : 'university_disabled'),
            custom_message: feature.university_status?.custom_message || feature.custom_message,
            is_enabled_for_university: isEnabled,
            university_id: feature.university_status?.university_id || feature.university_id || user?.university_id || ''
          }
        };
        
        console.log('✅ Transformed feature:', transformed);
        return transformed;
      }) || [];
      
      console.log('🎯 Final transformed features:', transformedFeatures);
      
      // Debug: Log each feature's key for debugging
      transformedFeatures.forEach((feature, index) => {
        console.log(`🎯 Transformed feature ${index}:`, {
          feature_key: feature.feature_key,
          is_available: feature.is_available,
          display_name: feature.display_name
        });
      });
      
      setFeatures(transformedFeatures);
      
    } catch (err) {
      console.error('Failed to fetch student features:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch features');
      setFeatures([]);
    } finally {
      setLoading(false);
    }
  };

  const hasFeatureAccess = (featureKey: string): boolean => {
    // If still loading, don't assume disabled
    if (loading) {
      console.log(`🔍 hasFeatureAccess(${featureKey}): Still loading, returning false`);
      return false;
    }
    
    // If features array is empty, return false
    if (!features || features.length === 0) {
      console.log(`🔍 hasFeatureAccess(${featureKey}): Features array is empty, returning false`);
      return false;
    }
    
    // Find the feature
    const feature = features.find(f => f.feature_key === featureKey);
    const hasAccess = feature ? feature.is_available : false;
    
    console.log(`🔍 hasFeatureAccess(${featureKey}):`, {
      featureFound: !!feature,
      is_available: feature?.is_available,
      hasAccess,
      totalFeatures: features.length,
      searchedKey: featureKey
    });
    
    return hasAccess;
  };

  const getFeatureInfo = (featureKey: string): StudentFeatureWithAccess | undefined => {
    return features.find(f => f.feature_key === featureKey);
  };

  useEffect(() => {
    if (user?.user_type === 'student') {
      fetchStudentFeatures();
      
      // Set up periodic refresh to catch university feature updates
      const refreshInterval = setInterval(() => {
        fetchStudentFeatures();
      }, 30000); // Refresh every 30 seconds
      
      // Refresh when window gains focus (user returns to tab)
      const handleFocus = () => {
        console.log('🔄 Window focused, refreshing student features...');
        fetchStudentFeatures();
      };
      
      // Refresh when page becomes visible
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          console.log('🔄 Page became visible, refreshing student features...');
          fetchStudentFeatures();
        }
      };
      
      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        clearInterval(refreshInterval);
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [user?.id, user?.user_type]);

  // Add a function to force refresh features
  const forceRefresh = () => {
    console.log('🔄 Force refreshing student features...');
    fetchStudentFeatures();
  };

  return {
    features,
    loading,
    error,
    hasFeatureAccess,
    getFeatureInfo,
    refetch: fetchStudentFeatures
  };
};
