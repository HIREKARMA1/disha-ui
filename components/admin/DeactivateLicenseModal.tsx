"use client"

import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, ShieldOff } from 'lucide-react'

interface DeactivateLicenseModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    universityName: string
    batch: string
    isDeactivating?: boolean
}

export function DeactivateLicenseModal({
    isOpen,
    onClose,
    onConfirm,
    universityName,
    batch,
    isDeactivating = false
}: DeactivateLicenseModalProps) {
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
                                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                                    <ShieldOff className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <button
                                    onClick={onClose}
                                    disabled={isDeactivating}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Deactivate License
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Are you sure you want to deactivate the license for <strong>{universityName}</strong> (Batch: <strong>{batch}</strong>)?
                            </p>

                            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700/50 rounded-xl p-4 mb-6">
                                <div className="flex gap-3">
                                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-1">
                                            Warning
                                        </h4>
                                        <p className="text-sm text-orange-700 dark:text-orange-300">
                                            Students associated with this license will lose access to the platform. This action can be reversed by reactivating the license.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    disabled={isDeactivating}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={isDeactivating}
                                    className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isDeactivating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Deactivating...</span>
                                        </>
                                    ) : (
                                        <span>Deactivate</span>
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
