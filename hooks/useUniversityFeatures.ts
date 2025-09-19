'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
// Define the correct interface based on backend response
interface FeatureFlagWithUniversityStatus {
  id: string;
  feature_name: string;
  feature_category: string;
  feature_key: string;
  display_name: string;
  description?: string;
  icon?: string;
  order: number;
  is_global: boolean;
  is_active: boolean;
  requires_auth: boolean;
  settings?: Record<string, any>;
  maintenance_message?: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  tenant_id: string;
  university_status?: {
    id: string;
    feature_flag_id: string;
    university_id: string;
    status: string;
    custom_settings?: Record<string, any>;
    custom_message?: string;
    allowed_user_types?: string[];
    allowed_roles?: string[];
    created_at: string;
    updated_at?: string;
    enabled_at?: string;
    disabled_at?: string;
    tenant_id: string;
  };
  is_available: boolean;
}
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';

interface UseUniversityFeaturesReturn {
  features: FeatureFlagWithUniversityStatus[];
  enabledFeatures: FeatureFlagWithUniversityStatus[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasFeatureAccess: (featureKey: string) => boolean;
}

export const useUniversityFeatures = (): UseUniversityFeaturesReturn => {
  const [features, setFeatures] = useState<FeatureFlagWithUniversityStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchFeatures = async () => {
    console.log('🔍 User object in useUniversityFeatures:', user);
    console.log('🔍 User id:', user?.id);
    console.log('🔍 User user_type:', user?.user_type);
    
    if (!user?.id || user?.user_type !== 'university') {
      setError('No university ID found or user is not a university');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get university features from the backend
      const response = await apiClient.getUniversityFeatures();
      console.log('🎯 University features loaded:', response);
      console.log('📊 Features count:', response.length);
      console.log('✅ Available features:', response.filter(f => f.is_available).length);
      console.log('🔍 First feature structure:', response[0]);
      setFeatures(response);
      
    } catch (err) {
      console.error('Failed to fetch university features:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch features');
      setFeatures([]);
    } finally {
      setLoading(false);
    }
  };

  const hasFeatureAccess = (featureKey: string): boolean => {
    const feature = features.find(f => f.feature_key === featureKey);
    if (!feature) return false;
    
    // Check if feature is available for this university
    return feature.is_available;
  };

  useEffect(() => {
    if (user?.user_type === 'university') {
      fetchFeatures();
    }
  }, [user?.id, user?.user_type]);

  const enabledFeatures = features.filter(f => f.is_available);

  return {
    features,
    enabledFeatures,
    loading,
    error,
    refetch: fetchFeatures,
    hasFeatureAccess
  };
};
