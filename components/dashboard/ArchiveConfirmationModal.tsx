"use client"

import { motion } from 'framer-motion'
import { AlertTriangle, Archive, Eye, X } from 'lucide-react'

interface ArchiveConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    studentName: string
    isArchiving: boolean // true if archiving, false if unarchiving
    isLoading?: boolean
}

export function ArchiveConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    studentName,
    isArchiving,
    isLoading = false
}: ArchiveConfirmationModalProps) {
    if (!isOpen) return null

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    const handleConfirm = () => {
        onConfirm()
    }

    return (
        <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
        >
            <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isArchiving
                            ? 'bg-orange-100 dark:bg-orange-900/20'
                            : 'bg-green-100 dark:bg-green-900/20'
                            }`}>
                            {isArchiving ? (
                                <Archive className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            ) : (
                                <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {isArchiving ? 'Archive Student' : 'Unarchive Student'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Confirm this action
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                        disabled={isLoading}
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex-shrink-0">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-gray-900 dark:text-white mb-2">
                                {isArchiving ? (
                                    <>
                                        Are you sure you want to <strong>archive</strong> <span className="font-semibold text-orange-600 dark:text-orange-400">{studentName}</span>?
                                    </>
                                ) : (
                                    <>
                                        Are you sure you want to <strong>unarchive</strong> <span className="font-semibold text-green-600 dark:text-green-400">{studentName}</span>?
                                    </>
                                )}
                            </p>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                {isArchiving ? (
                                    <>
                                        <p>• The student will be moved to archived status</p>
                                        <p>• They won't appear in active student lists by default</p>
                                        <p>• You can unarchive them later if needed</p>
                                    </>
                                ) : (
                                    <>
                                        <p>• The student will be restored to active status</p>
                                        <p>• They will appear in active student lists</p>
                                        <p>• All their data will remain intact</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${isArchiving
                                    ? 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700'
                                    : 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    {isArchiving ? 'Archiving...' : 'Unarchiving...'}
                                </>
                            ) : (
                                <>
                                    {isArchiving ? (
                                        <>
                                            <Archive className="w-4 h-4" />
                                            Archive Student
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="w-4 h-4" />
                                            Unarchive Student
                                        </>
                                    )}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}
