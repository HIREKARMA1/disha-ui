'use client';

import React from 'react';
import { X, AlertCircle, Mail, Phone } from 'lucide-react';
import { StudentFeatureWithAccess } from '@/types/student-features';

interface FeatureAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: StudentFeatureWithAccess | null;
}

const FeatureAccessModal: React.FC<FeatureAccessModalProps> = ({
  isOpen,
  onClose,
  feature
}) => {
  if (!isOpen || !feature) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Feature Not Available
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {feature.display_name}
            </h4>
            <p className="text-gray-600 text-sm">
              {feature.description || 'This feature is currently not available for your university.'}
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-orange-800 font-medium text-sm mb-1">
                  Access Restricted
                </p>
                <p className="text-orange-700 text-sm">
                  {feature.custom_message || "This feature is not enabled. Please contact your university admin."}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="font-medium text-gray-900 text-sm">Contact Your University Admin:</h5>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>admin@youruniversity.edu</span>
              </div>
              
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              // You can add functionality to open email client or contact form
              window.open('mailto:admin@youruniversity.edu?subject=Feature Access Request', '_blank');
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Contact Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureAccessModal;
