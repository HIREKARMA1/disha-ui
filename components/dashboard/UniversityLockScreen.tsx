"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, Lock } from 'lucide-react'

interface UniversityLockScreenProps {
    isOpen: boolean
    universityName?: string
    email?: string
}

export function UniversityLockScreen({ isOpen, universityName, email }: UniversityLockScreenProps) {

    if (!isOpen) return null

    // Admin contact information
    const adminEmail = "info@hirekarma.in"
    const adminPhone = "+91  90786 83876"

    const handleContactClick = () => {
        window.location.href = `mailto:${adminEmail}?subject=Access Request for ${universityName || 'University Dashboard'}`
    }

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed top-1/2 left-[calc(50%+3rem)] transform -translate-x-1/2 -translate-y-1/2 z-50 flex items-center justify-center backdrop-blur-xl pointer-events-auto"
                    >
                        {/* Middle content area - styled like subscription overlay */}
                        <div className="flex flex-col items-center gap-4 backdrop-blur-xl">
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
                                className="text-sm text-gray-700 dark:text-gray-300 text-center font-medium mb-4"
                            >
                                Please connect with the admin to access the feature
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
                )}
            </AnimatePresence>
        </>
    )
}

