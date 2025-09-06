"use client"

import { motion } from 'framer-motion'
import { GraduationCap, Shield, Users, TrendingUp } from 'lucide-react'
import { UniversityInfo } from '@/types/university'

interface UniversityWelcomeMessageProps {
    className?: string
    universityInfo?: UniversityInfo
}

export function UniversityWelcomeMessage({
    className = '',
    universityInfo
}: UniversityWelcomeMessageProps) {
    const currentHour = new Date().getHours()
    let greeting = 'Good morning'
    let message = 'Ready to manage placements and student opportunities?'

    if (currentHour >= 12 && currentHour < 17) {
        greeting = 'Good afternoon'
        message = 'Keep up the excellent work in student placement management!'
    } else if (currentHour >= 17) {
        greeting = 'Good evening'
        message = 'Great progress today! Let\'s continue building student success.'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-700 ${className}`}
        >
            <div className="flex items-start space-x-4">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {greeting}, {universityInfo?.university_name || 'University'}! 🎓
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                        {message}
                    </p>

                    {/* University Info Tags */}
                    <div className="flex flex-wrap gap-2">
                        <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-900/40 transition-colors cursor-pointer"
                        >
                            🎯 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </motion.span>

                        <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
                        >
                            <GraduationCap className="w-4 h-4 mr-1" />
                            {universityInfo?.institute_type ? universityInfo.institute_type.charAt(0).toUpperCase() + universityInfo.institute_type.slice(1) : 'University'}
                        </motion.span>

                        {universityInfo?.verified && (
                            <motion.span
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors cursor-pointer"
                            >
                                <Shield className="w-4 h-4 mr-1" />
                                Verified
                            </motion.span>
                        )}

                        {universityInfo?.total_students && (
                            <motion.span
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors cursor-pointer"
                            >
                                <Users className="w-4 h-4 mr-1" />
                                {universityInfo.total_students.toLocaleString()} Students
                            </motion.span>
                        )}

                        <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-900/40 transition-colors cursor-pointer"
                        >
                            <TrendingUp className="w-4 h-4 mr-1" />
                            Placement Hub
                        </motion.span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
