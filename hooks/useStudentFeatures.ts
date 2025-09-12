'use client';

import { useState, useEffect, useRef } from 'react';
import { StudentFeatureWithAccess, StudentFeaturesListResponse } from '@/types/student-features';
import { apiClient } from '@/lib/api';

interface UseStudentFeaturesReturn {
  features: StudentFeatureWithAccess[];
  totalCount: number;
  enabledCount: number;
  disabledCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Global cache to prevent multiple API calls
let globalCache: {
  data: StudentFeaturesListResponse | null;
  timestamp: number;
  promise: Promise<StudentFeaturesListResponse> | null;
} = {
  data: null,
  timestamp: 0,
  promise: null
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useStudentFeatures = (): UseStudentFeaturesReturn => {
  const [features, setFeatures] = useState<StudentFeatureWithAccess[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [enabledCount, setEnabledCount] = useState(0);
  const [disabledCount, setDisabledCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we have valid cached data
      const now = Date.now();
      if (globalCache.data && (now - globalCache.timestamp) < CACHE_DURATION) {
        console.log('Using cached student features data');
        setFeatures(globalCache.data.features);
        setTotalCount(globalCache.data.total_count);
        setEnabledCount(globalCache.data.enabled_count);
        setDisabledCount(globalCache.data.disabled_count);
        setLoading(false);
        return;
      }

      // Check if there's already a request in progress
      if (globalCache.promise) {
        console.log('Waiting for existing student features request');
        const response = await globalCache.promise;
        if (mountedRef.current) {
          setFeatures(response.features);
          setTotalCount(response.total_count);
          setEnabledCount(response.enabled_count);
          setDisabledCount(response.disabled_count);
        }
        setLoading(false);
        return;
      }

      // Make new request
      console.log('Fetching fresh student features data');
      globalCache.promise = apiClient.getStudentFeatures();
      const response: StudentFeaturesListResponse = await globalCache.promise;
      
      // Update cache
      globalCache.data = response;
      globalCache.timestamp = now;
      globalCache.promise = null;
      
      // Debug logging
      console.log('Student features API response:', response);
      console.log('Features with access status:', response.features.map(f => ({
        feature_key: f.feature_key,
        display_name: f.display_name,
        is_enabled_for_university: f.is_enabled_for_university,
        access_reason: f.access_reason,
        custom_message: f.custom_message
      })));
      
      // Check if any features are enabled
      const enabledFeatures = response.features.filter(f => f.is_enabled_for_university);
      console.log('Enabled features count:', enabledFeatures.length);
      console.log('Enabled features:', enabledFeatures.map(f => f.feature_key));
      
      if (mountedRef.current) {
        setFeatures(response.features);
        setTotalCount(response.total_count);
        setEnabledCount(response.enabled_count);
        setDisabledCount(response.disabled_count);
      }
      
    } catch (err) {
      console.error('Failed to fetch student features:', err);
      globalCache.promise = null; // Clear promise on error
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch features');
        setFeatures([]);
        setTotalCount(0);
        setEnabledCount(0);
        setDisabledCount(0);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchFeatures();
    
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    features,
    totalCount,
    enabledCount,
    disabledCount,
    loading,
    error,
    refetch: fetchFeatures
  };
};
