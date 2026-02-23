"use client"

import { motion } from 'framer-motion'
import { AdminDashboardData } from '@/types/admin'

interface AdminWelcomeMessageProps {
    adminInfo: AdminDashboardData
}

export function AdminWelcomeMessage({ adminInfo }: AdminWelcomeMessageProps) {
    const currentHour = new Date().getHours()
    const getGreeting = () => {
        if (currentHour < 12) return 'Good Morning'
        if (currentHour < 17) return 'Good Afternoon'
        return 'Good Evening'
    }

    const getCurrentDate = () => {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl shadow-xl border border-primary-200 dark:border-primary-700 p-8 text-white"
        >
            <div>
                <div className="mb-6">
                    <h1 className="text-2xl lg:text-3xl font-bold">
                        {getGreeting()}, Admin!
                    </h1>
                    <p className="text-white/90 text-sm lg:text-base mt-1">
                        Welcome to your admin dashboard
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <span className="text-sm font-medium block mb-2">Today</span>
                        <p className="text-lg font-semibold">{getCurrentDate()}</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <span className="text-sm font-medium block mb-2">Platform Status</span>
                        <p className="text-lg font-semibold text-green-200">All Systems Operational</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <span className="text-sm font-medium block mb-2">Total Users</span>
                        <p className="text-lg font-semibold">{adminInfo.total_users.toLocaleString()}</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <span className="text-sm font-medium block mb-2">Active Jobs</span>
                        <p className="text-lg font-semibold">{adminInfo.active_jobs.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
