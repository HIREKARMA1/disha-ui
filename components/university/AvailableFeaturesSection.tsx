'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Settings, RefreshCw } from 'lucide-react';
import { StudentFeatureWithAccess } from '@/types/student-features';
import { toast } from 'react-hot-toast';

interface AvailableFeaturesSectionProps {
  features: StudentFeatureWithAccess[];
  onFeatureToggle?: (feature: StudentFeatureWithAccess) => void;
  onRefresh?: () => void;
  loading?: boolean;
}

const AvailableFeaturesSection: React.FC<AvailableFeaturesSectionProps> = ({
  features,
  onFeatureToggle,
  onRefresh,
  loading = false
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const enabledCount = features.filter(f => f.is_enabled_for_university).length;
  const totalCount = features.length;

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="space-y-2">
      {/* Section Header - Matching sidebar navigation style */}
      <div 
        className="group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="p-2 rounded-lg mr-3 transition-all duration-300 bg-gray-100 dark:bg-gray-700 group-hover:bg-white/50 dark:group-hover:bg-gray-600/50">
          <Settings className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
        </div>
        <div className="flex-1">
          <div className="font-medium">Available Features</div>
          <div className="text-xs mt-0.5 text-gray-600 dark:text-gray-300">
            {enabledCount} of {totalCount} features enabled
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {onRefresh && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRefresh();
              }}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Refresh features"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
          
          <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Features List - Matching sidebar navigation style */}
      {isExpanded && (
        <div className="space-y-2">
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center px-4 py-3 rounded-xl">
                    <div className="p-2 rounded-lg mr-3 bg-gray-200 dark:bg-gray-700">
                      <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : features.length > 0 ? (
            <div className="space-y-2">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                >
                  <div className="p-2 rounded-lg mr-3 transition-all duration-300 bg-gray-100 dark:bg-gray-700 group-hover:bg-white/50 dark:group-hover:bg-gray-600/50">
                    <span className="text-lg">{feature.icon || '⚙️'}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{feature.display_name}</div>
                    {feature.description && (
                      <div className="text-xs mt-0.5 text-gray-600 dark:text-gray-300">
                        {feature.description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      feature.is_enabled_for_university 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {feature.is_enabled_for_university ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <Settings className="h-6 w-6 text-gray-400" />
              </div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                No Features Available
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                No features are configured for this university.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AvailableFeaturesSection;
