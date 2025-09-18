'use client';

import React from 'react';
import { CheckCircle, XCircle, Settings, Eye } from 'lucide-react';
import { StudentFeatureWithAccess } from '@/types/student-features';

interface FeatureStatusCardProps {
  feature: StudentFeatureWithAccess;
  onToggle?: (feature: StudentFeatureWithAccess) => void;
  onView?: (feature: StudentFeatureWithAccess) => void;
  showActions?: boolean;
}

const FeatureStatusCard: React.FC<FeatureStatusCardProps> = ({
  feature,
  onToggle,
  onView,
  showActions = true
}) => {
  const isEnabled = feature.is_enabled_for_university;
  
  const handleToggle = () => {
    if (onToggle) {
      onToggle(feature);
    }
  };

  const handleView = () => {
    if (onView) {
      onView(feature);
    }
  };

  return (
    <div className={`relative bg-white dark:bg-gray-800 rounded-lg border transition-all duration-200 hover:shadow-md ${
      isEnabled 
        ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10' 
        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
    }`}>
      {/* Status Indicator */}
      <div className={`absolute top-3 right-3 p-1 rounded-full ${
        isEnabled 
          ? 'bg-green-100 dark:bg-green-900/30' 
          : 'bg-gray-100 dark:bg-gray-700'
      }`}>
        {isEnabled ? (
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : (
          <XCircle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        )}
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Feature Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {feature.display_name}
            </h3>
            {feature.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {feature.description}
              </p>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isEnabled
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            {isEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {/* Feature Details */}
        <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center justify-between">
            <span>Category:</span>
            <span className="font-medium capitalize">{feature.category || 'General'}</span>
          </div>
          
          {feature.route && (
            <div className="flex items-center justify-between">
              <span>Route:</span>
              <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">
                {feature.route.split('/').pop() || feature.route}
              </span>
            </div>
          )}

          {(feature as any).access_reason && (
            <div className="flex items-center justify-between">
              <span>Access:</span>
              <span className="font-medium capitalize">
                {(feature as any).access_reason.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="mt-4 flex gap-2">
            {onToggle && (
              <button
                onClick={handleToggle}
                className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                  isEnabled
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                    : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                }`}
              >
                <Settings className="h-3 w-3" />
                {isEnabled ? 'Disable' : 'Enable'}
              </button>
            )}
            
            {onView && (
              <button
                onClick={handleView}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                <Eye className="h-3 w-3" />
                View
              </button>
            )}
          </div>
        )}

        {/* Custom Message */}
        {(feature as any).custom_message && (
          <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-xs text-orange-800 dark:text-orange-200">
            <strong>Note:</strong> {(feature as any).custom_message}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeatureStatusCard;
