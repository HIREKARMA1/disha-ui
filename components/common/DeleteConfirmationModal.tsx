"use client"

import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

interface DeleteConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    isDeleting?: boolean
}

export function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    isDeleting = false
}: DeleteConfirmationModalProps) {
    if (!isOpen) return null

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                                <button
                                    onClick={onClose}
                                    disabled={isDeleting}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                {message}
                            </p>

                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl p-4 mb-6">
                                <div className="flex gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                                            Permanent Action
                                        </h4>
                                        <p className="text-sm text-red-700 dark:text-red-300">
                                            This action cannot be undone. All associated data will be permanently deleted.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Deleting...</span>
                                        </>
                                    ) : (
                                        <span>Delete</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )

    return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}
