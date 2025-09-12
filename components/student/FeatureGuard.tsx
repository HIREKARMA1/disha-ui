'use client';

import React from 'react';
import { useFeatureAccessWithKey } from '@/hooks/useFeatureAccess';
import FeatureNotEnabled from './FeatureNotEnabled';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface FeatureGuardProps {
  featureKey: string;
  children: React.ReactNode;
  fallbackComponent?: React.ComponentType<{ featureName: string; featureDescription?: string; customMessage?: string }>;
}

const FeatureGuard: React.FC<FeatureGuardProps> = ({
  featureKey,
  children,
  fallbackComponent: FallbackComponent = FeatureNotEnabled
}) => {
  const { hasAccess, loading, error, feature } = useFeatureAccessWithKey(featureKey);

  // Show loading spinner while checking access
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Checking feature access...
          </p>
        </div>
      </div>
    );
  }

  // Show error if there was a problem checking access
  if (error) {
    return (
      <div className="flex items-center justify-center py-12 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Access Check Failed
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If user has access, render the protected content
  if (hasAccess && feature) {
    return <>{children}</>;
  }

  // If user doesn't have access, show the fallback component
  if (feature) {
    return (
      <FallbackComponent
        featureName={feature.display_name}
        featureDescription={feature.description}
        customMessage={feature.custom_message}
      />
    );
  }

  // Fallback if feature is not found
  return (
    <FallbackComponent
      featureName={featureKey}
      featureDescription="This feature is not available"
      customMessage="This feature is not available in your current setup."
    />
  );
};

export default FeatureGuard;
