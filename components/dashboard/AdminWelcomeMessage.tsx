"use client"

import { motion } from 'framer-motion'
import { Shield, Calendar, Clock } from 'lucide-react'
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
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold">
                                {getGreeting()}, Admin!
                            </h1>
                            <p className="text-white/90 text-sm lg:text-base">
                                Welcome to your admin dashboard
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm font-medium">Today</span>
                            </div>
                            <p className="text-lg font-semibold">{getCurrentDate()}</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-medium">Platform Status</span>
                            </div>
                            <p className="text-lg font-semibold text-green-200">All Systems Operational</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 lg:mt-0 lg:ml-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                        <h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-2xl font-bold">{adminInfo.total_users.toLocaleString()}</p>
                                <p className="text-sm text-white/80">Total Users</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{adminInfo.total_jobs.toLocaleString()}</p>
                                <p className="text-sm text-white/80">Active Jobs</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
