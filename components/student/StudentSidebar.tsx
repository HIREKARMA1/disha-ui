'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  Briefcase, 
  FileText, 
  BookOpen, 
  Video, 
  Library, 
  BarChart3, 
  User,
  Lock
} from 'lucide-react';
import { StudentFeatureWithAccess } from '@/types/student-features';
import FeatureAccessModal from './FeatureAccessModal';

interface StudentSidebarProps {
  features: StudentFeatureWithAccess[];
  currentPath?: string;
}

// Icon mapping for common features
const iconMap: Record<string, React.ComponentType<any>> = {
  'Home': Home,
  'Briefcase': Briefcase,
  'FileText': FileText,
  'BookOpen': BookOpen,
  'Video': Video,
  'Library': Library,
  'BarChart3': BarChart3,
  'User': User,
  'Lock': Lock,
};

const StudentSidebar: React.FC<StudentSidebarProps> = ({ 
  features, 
  currentPath = '' 
}) => {
  const router = useRouter();
  const [selectedFeature, setSelectedFeature] = useState<StudentFeatureWithAccess | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sort features by order
  const sortedFeatures = [...features].sort((a, b) => a.order - b.order);

  const handleFeatureClick = (feature: StudentFeatureWithAccess, e: React.MouseEvent) => {
    if (!feature.is_enabled_for_university) {
      e.preventDefault();
      setSelectedFeature(feature);
      setIsModalOpen(true);
      return;
    }

    // If feature is enabled, navigate normally
    if (feature.route) {
      router.push(feature.route);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFeature(null);
  };

  const getIcon = (iconName?: string) => {
    if (!iconName) return Home;
    return iconMap[iconName] || Home;
  };

  const isCurrentPath = (route?: string) => {
    if (!route) return false;
    return currentPath.startsWith(route);
  };

  return (
    <>
      <div className="w-64 bg-white shadow-lg h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Student Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">
            {features.filter(f => f.is_enabled_for_university).length} of {features.length} features available
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sortedFeatures.map((feature) => {
            const IconComponent = getIcon(feature.icon);
            const isActive = isCurrentPath(feature.route);
            const isDisabled = !feature.is_enabled_for_university;

            return (
              <div key={feature.id}>
                <button
                  onClick={(e) => handleFeatureClick(feature, e)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                      : isDisabled
                        ? 'text-gray-400 hover:bg-gray-50 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  disabled={isDisabled}
                >
                  <div className="flex-shrink-0">
                    <IconComponent 
                      className={`h-5 w-5 ${
                        isActive 
                          ? 'text-blue-600' 
                          : isDisabled 
                            ? 'text-gray-400' 
                            : 'text-gray-500'
                      }`} 
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      isActive 
                        ? 'text-blue-700' 
                        : isDisabled 
                          ? 'text-gray-400' 
                          : 'text-gray-700'
                    }`}>
                      {feature.display_name}
                    </p>
                    {feature.description && (
                      <p className={`text-xs truncate ${
                        isActive 
                          ? 'text-blue-600' 
                          : isDisabled 
                            ? 'text-gray-400' 
                            : 'text-gray-500'
                      }`}>
                        {feature.description}
                      </p>
                    )}
                  </div>

                  {isDisabled && (
                    <div className="flex-shrink-0">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </button>

                {/* Disabled feature indicator */}
                {isDisabled && (
                  <div className="ml-12 mt-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Not Available
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>Need access to a feature?</p>
            <button 
              onClick={() => {
                // You can add functionality to open contact form
                window.open('mailto:admin@youruniversity.edu?subject=Feature Access Request', '_blank');
              }}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Contact your admin
            </button>
          </div>
        </div>
      </div>

      {/* Feature Access Modal */}
      <FeatureAccessModal
        isOpen={isModalOpen}
        onClose={closeModal}
        feature={selectedFeature}
      />
    </>
  );
};

export default StudentSidebar;
