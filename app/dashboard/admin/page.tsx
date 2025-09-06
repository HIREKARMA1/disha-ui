"use client"

import { motion } from 'framer-motion'
import { Shield, Users, Settings, TrendingUp, Activity, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/ui/navbar'
import Link from 'next/link'

export default function AdminDashboard() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Unified Navbar */}
            <Navbar variant="solid" />

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 pt-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-8"
                >
                    {/* Welcome Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl mb-6">
                                <Shield className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                Welcome to Your Admin Dashboard!
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                                Your admin account has been created successfully. Welcome to HireKarma!
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Button className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700">
                                    System Overview
                                </Button>
                                <Button variant="outline">
                                    User Management
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Link href="/dashboard/admin/events" className="block">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-xl transition-shadow cursor-pointer">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Event Management</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Manage all events</p>
                            </div>
                        </Link>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">User Management</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Manage all users</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">System Monitor</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Monitor system health</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Analytics</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Platform insights</p>
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                            Next Steps
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Complete Admin Profile</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Set up your admin preferences</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">System Overview</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Review platform statistics and health</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    )
}
