"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { AlertTriangle, Trash2, X } from 'lucide-react'

interface CorporateDeleteConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    companyName: string
    isDeleting?: boolean
}

export function CorporateDeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    companyName,
    isDeleting = false
}: CorporateDeleteConfirmationModalProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!isOpen || !mounted) return null

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    const handleConfirm = () => {
        onConfirm()
    }

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop - Full Screen */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={handleBackdropClick}
            />
            
            {/* Modal Content */}
            <motion.div
                className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Delete Corporate
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                This action cannot be undone
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                        disabled={isDeleting}
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="flex-1">
                            <p className="text-gray-900 dark:text-white mb-2">
                                Are you sure you want to <strong>delete</strong> <span className="font-semibold text-red-600 dark:text-red-400">{companyName}</span>?
                            </p>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                                <p>• All job postings will be permanently deleted</p>
                                <p>• All job applications will be lost</p>
                                <p>• All shortlisted candidates will be removed</p>
                                <p>• All internships will be deleted</p>
                                <p>• This action cannot be undone</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isDeleting}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    Delete Corporate
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )

    return createPortal(modalContent, document.body)
}

