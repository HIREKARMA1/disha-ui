"use client"

import { motion } from 'framer-motion'
import { Home, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LogoutButton } from '@/components/ui/logout-button'
import Link from 'next/link'

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                                <Home className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Welcome to HireKarma</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <ThemeToggle />
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-8"
                >
                    {/* Welcome Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl mb-6">
                                <Home className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                Welcome to HireKarma!
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                                Your account has been created successfully. Please check your email for verification.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href="/">
                                    <Button className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600">
                                        Go to Home
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                                <Button variant="outline">
                                    Complete Profile
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Home className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Home</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Return to main page</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-accent-green-100 dark:bg-accent-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <ArrowRight className="w-6 h-6 text-accent-green-600 dark:text-accent-green-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Get Started</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Begin your journey</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Home className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Explore</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Discover opportunities</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-accent-orange-100 dark:bg-accent-orange-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <ArrowRight className="w-6 h-6 text-accent-orange-600 dark:text-accent-orange-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Learn More</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">About the platform</p>
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
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Verify Your Email</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Check your inbox and click the verification link</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Complete Your Profile</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Add your personal information</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Start Exploring</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Discover what HireKarma offers</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    )
}
