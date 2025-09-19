'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useStudentFeatures } from '@/hooks/useStudentFeatures';
import { apiClient } from '@/lib/api';
import { FeatureAccessResponse } from '@/types/feature-flags';
import { motion } from 'framer-motion';
import { 
  Lock, 
  AlertCircle, 
  ArrowLeft, 
  Settings, 
  Clock,
  Shield,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureGuardProps {
  children: React.ReactNode;
  featureKey: string;
  fallbackComponent?: React.ReactNode;
  showErrorPage?: boolean;
}

export function FeatureGuard({ 
  children, 
  featureKey, 
  fallbackComponent,
  showErrorPage = true 
}: FeatureGuardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { features, loading: featuresLoading } = useStudentFeatures();
  const [accessResponse, setAccessResponse] = useState<FeatureAccessResponse | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkFeatureAccess = async () => {
      if (!user || user.user_type !== 'student') {
        setCheckingAccess(false);
        return;
      }

      // Wait for features to load
      if (featuresLoading) {
        return;
      }

      try {
        setCheckingAccess(true);
        setError(null);

        // Debug logging
        console.log('FeatureGuard: Checking access for feature:', featureKey);
        console.log('FeatureGuard: Available features:', features.map(f => ({
          feature_key: f.feature_key,
          is_enabled_for_university: f.is_enabled_for_university
        })));

        // First check if the feature is enabled for the university
        const feature = features.find(f => f.feature_key === featureKey);
        
        if (!feature) {
          console.log('FeatureGuard: Feature not found:', featureKey);
          setAccessResponse({
            feature_key: featureKey,
            is_available: false,
            reason: 'feature_not_found',
            message: 'This feature is not available in the system.'
          });
          setCheckingAccess(false);
          return;
        }

        console.log('FeatureGuard: Found feature:', {
          feature_key: feature.feature_key,
          is_enabled_for_university: feature.is_enabled_for_university,
          access_reason: (feature as any).access_reason
        });

        if (!feature.is_enabled_for_university) {
          console.log('FeatureGuard: Feature not enabled for university');
          setAccessResponse({
            feature_key: featureKey,
            is_available: false,
            reason: 'university_disabled',
            message: (feature as any).custom_message || 'This feature is not enabled for your university.',
            custom_message: (feature as any).custom_message
          });
          setCheckingAccess(false);
          return;
        }

        // If feature is enabled, check detailed access
        try {
          const response = await apiClient.checkStudentFeatureAccess({
            feature_key: featureKey,
            university_id: user.university_id || undefined,
            user_type: user.user_type
          });
          
          setAccessResponse(response);
        } catch (apiError) {
          // If API check fails, but feature is enabled for university, allow access
          console.warn('Feature access API check failed, allowing access based on university settings:', apiError);
          setAccessResponse({
            feature_key: featureKey,
            is_available: true,
            reason: 'university_enabled'
          });
        }

      } catch (err) {
        console.error('Error checking feature access:', err);
        setError('Failed to check feature access');
        setAccessResponse({
          feature_key: featureKey,
          is_available: false,
          reason: 'error',
          message: 'Unable to verify feature access.'
        });
      } finally {
        setCheckingAccess(false);
      }
    };

    if (!featuresLoading && features.length > 0) {
      checkFeatureAccess();
    }
  }, [user, features, featuresLoading, featureKey]);

  // Show loading state
  if (checkingAccess || featuresLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking feature access...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Access Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => router.push('/dashboard/student')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // If access is not available, show error page
  if (accessResponse && !accessResponse.is_available) {
    if (!showErrorPage) {
      return fallbackComponent || null;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center"
        >
          <div className="mb-6">
            {accessResponse.reason === 'maintenance' ? (
              <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            ) : accessResponse.reason === 'university_disabled' ? (
              <Settings className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            ) : (
              <Lock className="h-16 w-16 text-red-500 mx-auto mb-4" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {accessResponse.reason === 'maintenance' ? 'Feature Under Maintenance' :
             accessResponse.reason === 'university_disabled' ? 'Feature Not Available' :
             'Access Restricted'}
          </h2>

          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {accessResponse.custom_message || accessResponse.message || 
               'This feature is not available for your account.'}
            </p>

            {accessResponse.reason === 'university_disabled' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                      Contact Your University
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Your university administrator can enable this feature for students.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {accessResponse.maintenance_message && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                      Maintenance Notice
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      {accessResponse.maintenance_message}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/dashboard/student')}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/student/profile')}
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              View Available Features
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // If access is available, render children
  return <>{children}</>;
}

