'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, AlertCircle, Users, Settings } from 'lucide-react';

interface FeatureAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  featureDescription?: string;
  customMessage?: string;
  maintenanceMessage?: string;
  isMaintenanceMode?: boolean;
}

export function FeatureAccessModal({
  isOpen,
  onClose,
  featureName,
  featureDescription,
  customMessage,
  maintenanceMessage,
  isMaintenanceMode = false
}: FeatureAccessModalProps) {
  if (!isOpen) return null;

  const getModalContent = () => {
    if (isMaintenanceMode) {
      return {
        icon: Settings,
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
        title: 'Feature Under Maintenance',
        message: maintenanceMessage || `The ${featureName} feature is currently under maintenance and will be available soon.`,
        buttonText: 'Got it'
      };
    }

    return {
      icon: Lock,
      iconColor: 'text-red-600 dark:text-red-400',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      title: 'Feature Not Accessible',
      message: customMessage || `The ${featureName} feature is not accessible. Please request your university admin to enable it.`,
      buttonText: 'Understood'
    };
  };

  const content = getModalContent();
  const IconComponent = content.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-6 pt-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className={`p-4 rounded-full ${content.iconBg}`}>
                <IconComponent className={`w-8 h-8 ${content.iconColor}`} />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-3">
              {content.title}
            </h3>

            {/* Feature Name */}
            <div className="text-center mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                {featureName}
              </span>
            </div>

            {/* Message */}
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
              {content.message}
            </p>

            {/* Feature Description */}
            {featureDescription && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>About this feature:</strong> {featureDescription}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                {content.buttonText}
              </button>
              
              {!isMaintenanceMode && (
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>Contact your university admin to enable this feature</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
