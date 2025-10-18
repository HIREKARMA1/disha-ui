"use client"

import { Fragment } from 'react'
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface ToastProps {
    id: string
    title: string
    message?: string
    type: 'success' | 'error' | 'warning' | 'info'
    duration?: number
    onClose: (id: string) => void
}

export function Toast({ id, title, message, type, duration = 5000, onClose }: ToastProps) {
    const getToastStyles = () => {
        switch (type) {
            case 'success':
                return {
                    icon: CheckCircle,
                    iconColor: 'text-green-400',
                    bgColor: 'bg-green-50 dark:bg-green-900/20',
                    borderColor: 'border-green-200 dark:border-green-800',
                    titleColor: 'text-green-800 dark:text-green-200'
                }
            case 'error':
                return {
                    icon: AlertTriangle,
                    iconColor: 'text-red-400',
                    bgColor: 'bg-red-50 dark:bg-red-900/20',
                    borderColor: 'border-red-200 dark:border-red-800',
                    titleColor: 'text-red-800 dark:text-red-200'
                }
            case 'warning':
                return {
                    icon: AlertTriangle,
                    iconColor: 'text-yellow-400',
                    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
                    borderColor: 'border-yellow-200 dark:border-yellow-800',
                    titleColor: 'text-yellow-800 dark:text-yellow-200'
                }
            case 'info':
                return {
                    icon: Info,
                    iconColor: 'text-blue-400',
                    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                    borderColor: 'border-blue-200 dark:border-blue-800',
                    titleColor: 'text-blue-800 dark:text-blue-200'
                }
        }
    }

    const styles = getToastStyles()
    const Icon = styles.icon

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`max-w-sm w-full ${styles.bgColor} ${styles.borderColor} border rounded-lg shadow-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden`}
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <Icon className={`h-6 w-6 ${styles.iconColor}`} aria-hidden="true" />
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className={`text-sm font-medium ${styles.titleColor}`}>
                            {title}
                        </p>
                        {message && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {message}
                            </p>
                        )}
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            className={`${styles.bgColor} rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                            onClick={() => onClose(id)}
                        >
                            <span className="sr-only">Close</span>
                            <X className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

interface ToastContainerProps {
    toasts: ToastProps[]
    onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
    return (
        <div
            aria-live="assertive"
            className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
        >
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <Toast key={toast.id} {...toast} onClose={onClose} />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}

// Toast hook for easy usage
export function useToast() {
    const showToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
        // This would typically integrate with a toast management system
        // For now, we'll use the existing react-hot-toast
        const { toast: hotToast } = require('react-hot-toast')
        
        switch (toast.type) {
            case 'success':
                hotToast.success(toast.title, { description: toast.message })
                break
            case 'error':
                hotToast.error(toast.title, { description: toast.message })
                break
            case 'warning':
                hotToast(toast.title, { 
                    description: toast.message,
                    icon: '⚠️',
                    style: {
                        background: '#fef3c7',
                        color: '#92400e',
                        border: '1px solid #f59e0b'
                    }
                })
                break
            case 'info':
                hotToast(toast.title, { 
                    description: toast.message,
                    icon: 'ℹ️',
                    style: {
                        background: '#dbeafe',
                        color: '#1e40af',
                        border: '1px solid #3b82f6'
                    }
                })
                break
        }
    }

    return { showToast }
}
