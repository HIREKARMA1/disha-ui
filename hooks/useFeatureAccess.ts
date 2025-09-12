'use client';

import { useState, useEffect } from 'react';
import { StudentFeatureWithAccess } from '@/types/student-features';
import { toast } from 'react-hot-toast';
import { useStudentFeatures } from './useStudentFeatures';

interface UseFeatureAccessReturn {
  checkFeatureAccess: (feature: StudentFeatureWithAccess) => boolean;
  showAccessError: (feature: StudentFeatureWithAccess) => void;
  canAccessFeature: (featureKey: string, features: StudentFeatureWithAccess[]) => boolean;
}

interface UseFeatureAccessWithKeyReturn {
  hasAccess: boolean;
  loading: boolean;
  error: string | null;
  feature: StudentFeatureWithAccess | null;
}

export const useFeatureAccess = (): UseFeatureAccessReturn => {
  const [accessErrors, setAccessErrors] = useState<Set<string>>(new Set());

  const checkFeatureAccess = (feature: StudentFeatureWithAccess): boolean => {
    return feature.is_enabled_for_university;
  };

  const showAccessError = (feature: StudentFeatureWithAccess) => {
    const errorKey = feature.feature_key;
    
    // Prevent showing the same error multiple times in quick succession
    if (accessErrors.has(errorKey)) {
      return;
    }

    setAccessErrors(prev => new Set(prev).add(errorKey));
    
    // Clear the error after 3 seconds
    setTimeout(() => {
      setAccessErrors(prev => {
        const newSet = new Set(prev);
        newSet.delete(errorKey);
        return newSet;
      });
    }, 3000);

    // Show error toast
    const errorMessage = feature.custom_message || 
      `This feature (${feature.display_name}) is not available for your university. Please contact your university administrator to enable this feature.`;
    
    toast.error(errorMessage, {
      duration: 5000,
      position: 'top-center',
      style: {
        background: '#fee2e2',
        color: '#dc2626',
        border: '1px solid #fecaca',
        borderRadius: '12px',
        padding: '16px',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '400px',
      },
      icon: '🚫',
    });
  };

  const canAccessFeature = (featureKey: string, features: StudentFeatureWithAccess[]): boolean => {
    const feature = features.find(f => f.feature_key === featureKey);
    return feature ? feature.is_enabled_for_university : false;
  };

  return {
    checkFeatureAccess,
    showAccessError,
    canAccessFeature,
  };
};

// Hook for FeatureGuard component that takes a featureKey
export const useFeatureAccessWithKey = (featureKey: string): UseFeatureAccessWithKeyReturn => {
  const { features, loading, error: featuresError } = useStudentFeatures();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (featuresError) {
      setError(featuresError);
    } else {
      setError(null);
    }
  }, [featuresError]);

  // Find the specific feature
  const feature = features.find(f => f.feature_key === featureKey) || null;
  
  // Check if user has access to this feature
  const hasAccess = feature ? feature.is_enabled_for_university : false;

  return {
    hasAccess,
    loading,
    error,
    feature,
  };
};