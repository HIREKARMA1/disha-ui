'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { StudentFeatureWithAccess } from '@/types/student-features';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';

interface UseUniversityStudentFeaturesReturn {
  features: StudentFeatureWithAccess[];
  enabledCount: number;
  totalCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  toggleFeature: (featureKey: string) => Promise<void>;
}

export const useUniversityStudentFeatures = (): UseUniversityStudentFeaturesReturn => {
  const [features, setFeatures] = useState<StudentFeatureWithAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchFeatures = async () => {
    if (!user?.university_id) {
      setError('No university ID found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getUniversityStudentFeatures(user.university_id);
      setFeatures(response.features);
      
    } catch (err) {
      console.error('Failed to fetch university student features:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch features');
      setFeatures([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = async (featureKey: string) => {
    if (!user?.university_id) {
      toast.error('No university ID found');
      return;
    }

    try {
      const result = await apiClient.toggleUniversityStudentFeature(user.university_id, featureKey);
      
      // Update the local state
      setFeatures(prevFeatures => 
        prevFeatures.map(feature => 
          feature.feature_key === featureKey 
            ? { ...feature, is_enabled_for_university: result.enabled }
            : feature
        )
      );
      
      toast.success(result.message);
      
    } catch (err) {
      console.error('Failed to toggle feature:', err);
      toast.error('Failed to update feature status');
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, [user?.university_id]);

  const enabledCount = features.filter(f => f.is_enabled_for_university).length;
  const totalCount = features.length;

  return {
    features,
    enabledCount,
    totalCount,
    loading,
    error,
    refetch: fetchFeatures,
    toggleFeature
  };
};
