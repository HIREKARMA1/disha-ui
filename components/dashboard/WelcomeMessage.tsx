"use client"

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface WelcomeMessageProps {
    className?: string
    studentName?: string
}

export function WelcomeMessage({ className = '', studentName = 'Student' }: WelcomeMessageProps) {
    const currentHour = new Date().getHours()
    let greeting = 'Good morning'
    let message = 'Ready to explore new opportunities today?'

    if (currentHour >= 12 && currentHour < 17) {
        greeting = 'Good afternoon'
        message = 'Keep momentum — your next opportunity could be one apply away.'
    } else if (currentHour >= 17) {
        greeting = 'Good evening'
        message = 'Review applications and plan tomorrow’s career moves.'
    }

    const dateLabel = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    })

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className={`relative overflow-hidden rounded-2xl border border-primary-200/60 dark:border-primary-700/40 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 text-white p-5 sm:p-6 shadow-lg shadow-primary-500/20 ${className}`}
        >
            <div className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-8 h-44 w-44 rounded-full bg-sky-300/20 blur-3xl" />
            <div className="relative flex items-start gap-3">
                <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/75 mb-1">
                        {dateLabel}
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        {greeting}, {studentName}
                    </h1>
                    <p className="mt-1.5 text-sm sm:text-base text-white/90 max-w-2xl">
                        {message}
                    </p>
                </div>
            </div>
        </motion.div>
    )
}
