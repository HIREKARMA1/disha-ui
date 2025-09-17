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
      
      // Get student features from the backend
      // This should return features available to the student's university
      console.log('🎯 Fetching student features for user:', user);
      console.log('🎯 User university_id:', user?.university_id);
      
      const response = await apiClient.getStudentFeatures();
      console.log('🎯 Student features API response:', response);
      console.log('🎯 Response type:', typeof response);
      console.log('🎯 Response length:', Array.isArray(response) ? response.length : 'Not an array');
      
      // Transform the response to match StudentFeatureWithAccess interface
      // The response is an array of UniversityFeatureFlagResponse objects
      const transformedFeatures = response.map((feature: any, index: number) => {
        console.log('🔍 Processing feature:', feature);
        console.log('🔍 Feature is_enabled:', feature.is_enabled);
        console.log('🔍 Feature status:', feature.status);
        console.log('🔍 Feature has feature object:', !!feature.feature);
        
        // Since the API doesn't return a feature object, we'll create one with default values
        // and use the feature_flag_id as the feature key
        const isEnabled = feature.is_enabled || false;
        
        console.log('🔍 Final isEnabled value:', isEnabled);
        
        // Create a mapping of feature_flag_id (UUID) to feature details
        const featureKeyMap: Record<string, any> = {
          '503a4f11-aab9-42db-bce1-2467340a0e8e': { key: 'careeralign', name: 'careeralign', display: 'Career Align', icon: 'Target', category: 'career' },
          'b9bb6975-ee1f-4a64-92ef-83576f396fd6': { key: 'analytics', name: 'analytics', display: 'Analytics Dashboard', icon: 'BarChart3', category: 'analytics' },
          '65582d7c-b1d0-4671-875f-771032075e2e': { key: 'practice', name: 'practice', display: 'Practice Tests', icon: 'BookOpen', category: 'practice' },
          'c18d97eb-d9b8-4737-a3e1-5c06fac74d51': { key: 'video_search', name: 'video_search', display: 'Video Search', icon: 'Search', category: 'video_search' },
          '11d80635-b856-4fad-9b89-855e035560d1': { key: 'library', name: 'library', display: 'Resource Library', icon: 'Library', category: 'library' },
          '3005eece-fb43-481c-a69c-2e71d2b7def5': { key: 'resume', name: 'resume_builder', display: 'Resume Builder', icon: 'FileText', category: 'resume' },
          'fc874a57-d873-4edb-831b-4b62cfca6c11': { key: 'sadhana', name: 'sadhana', display: 'Sadhana Platform', icon: 'Brain', category: 'sadhana' },
          '1e65aabe-aaf0-4706-96e5-f77b76a71c8c': { key: 'sangha', name: 'sangha', display: 'Sangha Community', icon: 'Users', category: 'sangha' }
        };
        
        const featureFlagId = feature.feature_flag_id;
        const featureInfo = featureKeyMap[featureFlagId] || { 
          key: 'unknown',
          name: 'Unknown Feature', 
          display: 'Unknown Feature', 
          icon: 'HelpCircle', 
          category: 'general' 
        };
        
        const transformed: StudentFeatureWithAccess = {
          id: featureFlagId || `feature-${index}`,
          feature_key: featureInfo.key,
          feature_name: featureInfo.name,
          display_name: featureInfo.display,
          description: `Access to ${featureInfo.display} features`,
          icon: featureInfo.icon,
          route: `/${featureInfo.key}`,
          order: index,
          is_active: true,
          category: featureInfo.category,
          requires_auth: true,
          settings: {},
          created_at: feature.created_at || new Date().toISOString(),
          updated_at: feature.updated_at,
          tenant_id: feature.tenant_id || user?.tenant_id || '',
          is_available: isEnabled, // Use the is_enabled field directly
          university_status: {
            access_reason: feature.status || 'university_enabled',
            custom_message: feature.custom_message,
            is_enabled_for_university: isEnabled,
            university_id: user?.university_id || ''
          }
        };
        
        console.log('✅ Transformed feature:', transformed);
        return transformed;
      }) || [];
      
      console.log('🎯 Final transformed features:', transformedFeatures);
      
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
      return false; // Return false during loading to prevent premature access
    }
    
    const feature = features.find(f => f.feature_key === featureKey);
    return feature ? feature.is_available : false;
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
    refetch: fetchStudentFeatures,
    forceRefresh
  };
};
