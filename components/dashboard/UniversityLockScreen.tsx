"use client"

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, Lock } from 'lucide-react'

interface UniversityLockScreenProps {
    isOpen: boolean
    universityName?: string
    email?: string
}

export function UniversityLockScreen({ isOpen, universityName, email }: UniversityLockScreenProps) {
    // Prevent copying, selecting, and screen capture when lock screen is active
    useEffect(() => {
        if (!isOpen) return

        // Prevent copy, cut, and select events
        const preventCopy = (e: ClipboardEvent) => {
            e.preventDefault()
            return false
        }

        const preventSelect = (e: Event) => {
            e.preventDefault()
            return false
        }

        const preventKeyboardShortcuts = (e: KeyboardEvent) => {
            // Prevent Ctrl+C, Ctrl+X, Ctrl+A, Ctrl+P, PrintScreen
            if (e.ctrlKey && (e.key === 'c' || e.key === 'x' || e.key === 'a' || e.key === 'p' || e.key === 'C' || e.key === 'X' || e.key === 'A' || e.key === 'P')) {
                e.preventDefault()
                return false
            }
            // Prevent PrintScreen
            if (e.key === 'PrintScreen') {
                e.preventDefault()
                return false
            }
            // Prevent Ctrl+Shift+I (DevTools)
            if (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I')) {
                e.preventDefault()
                return false
            }
        }

        const preventContextMenu = (e: MouseEvent) => {
            e.preventDefault()
            return false
        }

        // Add CSS to prevent text selection
        document.body.style.userSelect = 'none'
            ; (document.body.style as any).webkitUserSelect = 'none'

        // Add event listeners
        document.addEventListener('copy', preventCopy)
        document.addEventListener('cut', preventCopy)
        document.addEventListener('selectstart', preventSelect)
        document.addEventListener('keydown', preventKeyboardShortcuts)
        document.addEventListener('contextmenu', preventContextMenu)

        return () => {
            // Cleanup: restore normal behavior
            document.body.style.userSelect = ''
                ; (document.body.style as any).webkitUserSelect = ''

            document.removeEventListener('copy', preventCopy)
            document.removeEventListener('cut', preventCopy)
            document.removeEventListener('selectstart', preventSelect)
            document.removeEventListener('keydown', preventKeyboardShortcuts)
            document.removeEventListener('contextmenu', preventContextMenu)
        }
    }, [isOpen])

    if (!isOpen) return null

    // Admin contact information
    const adminEmail = "info@hirekarma.in"
    const adminPhone = "+91  90786 83876"

    const handleContactClick = () => {
        window.location.href = `mailto:${adminEmail}?subject=Access Request for ${universityName || 'University Dashboard'}`
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Full-screen backdrop with heavy blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 backdrop-blur-[3px] bg-white/30 dark:bg-gray-900/30"
                        style={{
                            marginLeft: '256px',  // Account for sidebar width (lg:w-64 = 256px)
                            marginTop: '64px',    // Account for navbar height
                        }}
                    />

                    {/* Centered lock content */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed top-1/2 left-[calc(50%+8rem)] transform -translate-x-[70%] -translate-y-1/2 z-50 flex items-center justify-center"
                    >
                        {/* Middle content area - styled like subscription overlay */}
                        <div className="flex flex-col items-center gap-4">
                            {/* Lock icon */}
                            <motion.button
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                onClick={handleContactClick}
                                className="p-4 bg-teal-700 dark:bg-teal-800 hover:bg-teal-800 dark:hover:bg-teal-900 rounded-full hover:scale-110 transition-all duration-200 cursor-pointer shadow-lg"
                            >
                                <Lock className="w-12 h-12 text-white" />
                            </motion.button>

                            {/* Alternative text below button */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-sm text-gray-700 dark:text-gray-300 text-center font-medium"
                            >
                                Please connect with the admin to access the feature?{' '}
                                {/* <button 
                                onClick={handleContactClick}
                                className="font-semibold underline text-gray-600 dark:text-gray-200 hover:text-gray-800 dark:hover:text-white transition-colors"
                            >
                                Contact Admin
                            </button> */}
                            </motion.div>

                            {/* Contact information */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col items-center gap-2 mt-2"
                            >
                                <a
                                    href={`mailto:${adminEmail}`}
                                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                                >
                                    <Mail className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                                    <span>{adminEmail}</span>
                                </a>
                                <a
                                    href={`tel:${adminPhone.replace(/\s/g, '')}`}
                                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                                >
                                    <Phone className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                                    <span>{adminPhone}</span>
                                </a>
                            </motion.div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

