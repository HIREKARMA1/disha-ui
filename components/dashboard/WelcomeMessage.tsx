"use client"

import { motion } from 'framer-motion'
import { Sun, Coffee, Rocket } from 'lucide-react'

interface WelcomeMessageProps {
    className?: string
    studentName?: string
}

export function WelcomeMessage({ className = '', studentName = 'Student' }: WelcomeMessageProps) {
    const currentHour = new Date().getHours()
    let greeting = 'Good morning'
    let icon = Sun
    let message = 'Ready to start your day with some amazing opportunities?'

    if (currentHour >= 12 && currentHour < 17) {
        greeting = 'Good afternoon'
        icon = Coffee
        message = 'Keep up the great work! New opportunities await you.'
    } else if (currentHour >= 17) {
        greeting = 'Good evening'
        icon = Rocket
        message = 'Great job today! Let\'s plan for tomorrow\'s success.'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-700 ${className}`}
        >
            <div className="flex items-start space-x-4">
                {/* <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
                        <icon className="w-6 h-6 text-white" />
                    </div>
                </div> */}
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {greeting}, {studentName}! 👋
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                        {message}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                            🎯 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                            📈 Career Growth
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                            🚀 New Opportunities
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
