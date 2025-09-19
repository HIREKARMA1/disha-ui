'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Mail, Phone } from 'lucide-react';

interface FeatureNotEnabledProps {
  featureName: string;
  featureDescription?: string;
  customMessage?: string;
}

const FeatureNotEnabled: React.FC<FeatureNotEnabledProps> = ({
  featureName,
  featureDescription,
  customMessage
}) => {
  const router = useRouter();

  const handleGoBack = () => {
    router.push('/dashboard/student');
  };

  const handleContactAdmin = () => {
    // Open email client with pre-filled subject
    window.open('mailto:admin@youruniversity.edu?subject=Feature Access Request', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Error Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-orange-50 dark:bg-orange-900/20 px-6 py-4 border-b border-orange-200 dark:border-orange-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h1 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                Feature Not Enabled
              </h1>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {featureName}
              </h2>
              {featureDescription && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {featureDescription}
                </p>
              )}
              
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <p className="text-orange-800 dark:text-orange-200 text-sm">
                  {customMessage || "This feature has not been enabled by your university. Please contact your admin to access it."}
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Contact Your University Admin:
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>admin@youruniversity.edu</span>
                </div>
                
                <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>+1 (555) 123-4567</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleGoBack}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Go Back to Dashboard</span>
              </button>
              
              <button
                onClick={handleContactAdmin}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Contact Admin
              </button>
            </div>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Need help? Check our{' '}
            <a 
              href="#" 
              className="text-blue-600 dark:text-blue-400 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                // You can add help documentation link here
              }}
            >
              help center
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeatureNotEnabled;
