"use client"

import { motion } from 'framer-motion'
import { ArrowRight, Star, TrendingUp, BookOpen, Calendar, Users, Award, Target } from 'lucide-react'
import Link from 'next/link'

interface AdvertisementBannerProps {
    className?: string
}

export function AdvertisementBanner({ className = '' }: AdvertisementBannerProps) {
    const advertisements = [
        {
            id: 1,
            title: "🎓 Resume Workshop",
            subtitle: "Learn to create a standout resume",
            description: "Join our expert-led workshop and get your resume reviewed by industry professionals.",
            cta: "Register Now",
            href: "/dashboard/student/resume-builder",
            bgColor: "from-blue-500 to-purple-600",
            icon: BookOpen,
            date: "Mar 25, 2024",
            participants: "45 students"
        },
        {
            id: 2,
            title: "🚀 Career Fair 2024",
            subtitle: "Connect with top companies",
            description: "Meet recruiters from Google, Microsoft, Amazon and 50+ other companies.",
            cta: "Learn More",
            href: "/dashboard/student/events",
            bgColor: "from-green-500 to-emerald-600",
            icon: TrendingUp,
            date: "Apr 15, 2024",
            participants: "200+ companies"
        }
    ]

    const quickActions = [
        {
            title: "Update Profile",
            description: "Keep your profile current",
            icon: Users,
            href: "/dashboard/student/profile",
            color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
        },
        {
            title: "Skill Assessment",
            description: "Test your technical skills",
            icon: Target,
            href: "/dashboard/student/skills",
            color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
        },
        {
            title: "Interview Prep",
            description: "Practice common questions",
            icon: Award,
            href: "/dashboard/student/interview-prep",
            color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
        }
    ]

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Featured Advertisements */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Events</h3>
                {advertisements.map((ad, index) => (
                    <motion.div
                        key={ad.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                        <Link href={ad.href} className="block group">
                            <div className={`bg-gradient-to-r ${ad.bgColor} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-2">
                                        <Star className="w-4 h-4 text-yellow-300" />
                                        <span className="text-sm font-medium text-yellow-100">Featured</span>
                                    </div>
                                    <div className="text-right text-xs text-blue-100">
                                        <div className="flex items-center space-x-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>{ad.date}</span>
                                        </div>
                                        <div className="flex items-center space-x-1 mt-1">
                                            <Users className="w-3 h-3" />
                                            <span>{ad.participants}</span>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-2">{ad.title}</h3>
                                <p className="text-blue-100 font-medium mb-2">{ad.subtitle}</p>
                                <p className="text-blue-50 text-sm mb-4 opacity-90 leading-relaxed">{ad.description}</p>

                                <div className="flex items-center justify-between">
                                    <div className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 rounded-full px-4 py-2 transition-colors duration-200">
                                        <span className="text-sm font-semibold">{ad.cta}</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                                    </div>
                                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                        <ad.icon className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                    {quickActions.map((action, index) => (
                        <motion.div
                            key={action.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            <Link href={action.href} className="block group">
                                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md bg-white dark:bg-gray-800">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg ${action.color}`}>
                                            <action.icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                {action.title}
                                            </h4>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                {action.description}
                                            </p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all duration-200" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Stats Summary */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Progress</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">85%</div>
                        <div className="text-xs text-blue-700 dark:text-blue-300">Profile Complete</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">12</div>
                        <div className="text-xs text-green-700 dark:text-green-300">Active Applications</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
