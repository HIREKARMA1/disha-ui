"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, Lock } from 'lucide-react'

interface StudentLockScreenProps {
    isOpen: boolean
    universityName?: string
    universityEmail?: string
    reason?: string
}

export function StudentLockScreen({ isOpen, universityName, universityEmail, reason }: StudentLockScreenProps) {
    if (!isOpen) return null

    const handleContactClick = () => {
        if (universityEmail) {
            window.location.href = `mailto:${universityEmail}?subject=License Access Request`
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed top-1/2 left-[calc(50%+3rem)] transform -translate-x-1/2 -translate-y-1/2 z-50 flex items-center justify-center backdrop-blur-xl"
                >
                    <div className="flex flex-col items-center gap-4 backdrop-blur-xl">
                        <motion.button
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            onClick={handleContactClick}
                            className="p-4 bg-teal-700 dark:bg-teal-800 hover:bg-teal-800 dark:hover:bg-teal-900 rounded-full hover:scale-110 transition-all duration-200 cursor-pointer shadow-lg"
                        >
                            <Lock className="w-12 h-12 text-white" />
                        </motion.button>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-sm text-gray-700 dark:text-gray-300 text-center font-medium max-w-md"
                        >
                            {reason || "Your university license has expired. Please contact your university administrator."}
                        </motion.div>

                        {universityName && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col items-center gap-2 mt-2"
                            >
                                {universityEmail && (
                                    <a
                                        href={`mailto:${universityEmail}`}
                                        className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                                    >
                                        <Mail className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                                        <span>{universityEmail}</span>
                                    </a>
                                )}
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Contact: {universityName}
                                </p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

