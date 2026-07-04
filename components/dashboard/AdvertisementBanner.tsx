"use client"

import { motion } from 'framer-motion'
import { ArrowRight, Star, TrendingUp, BookOpen, Calendar, Users, Clock } from 'lucide-react'
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

    return (
        <div className={`space-y-4 ${className}`}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upcoming Events
            </h3>

            <div className="relative rounded-2xl">
                <div className="space-y-4">
                    {advertisements.map((ad, index) => (
                        <motion.div
                            key={ad.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            <Link href={ad.href} className="block group pointer-events-none">
                                <div
                                    className={`bg-gradient-to-r ${ad.bgColor} rounded-2xl p-5 sm:p-6 text-white shadow-lg`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Star className="w-4 h-4 text-yellow-300 shrink-0" />
                                            <span className="text-sm font-medium text-yellow-100">Featured</span>
                                        </div>
                                        <div className="text-xs text-white/90 space-y-1 shrink-0">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 shrink-0" />
                                                <span>{ad.date}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5 shrink-0" />
                                                <span>{ad.participants}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-lg sm:text-xl font-bold mb-1.5 break-words leading-snug">
                                                {ad.title}
                                            </h4>
                                            <p className="text-white/90 font-medium mb-1.5 break-words">
                                                {ad.subtitle}
                                            </p>
                                            <p className="text-white/80 text-sm leading-relaxed break-words">
                                                {ad.description}
                                            </p>
                                            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mt-4">
                                                <span className="text-sm font-semibold">{ad.cta}</span>
                                                <ArrowRight className="w-4 h-4 shrink-0" />
                                            </div>
                                        </div>
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center shrink-0 self-start sm:self-end">
                                            <ad.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="absolute inset-0 flex items-center justify-center bg-white/75 dark:bg-gray-900/75 backdrop-blur-[2px] rounded-2xl pointer-events-none">
                    <div className="text-center px-4 py-6 max-w-xs">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 dark:bg-primary-900/40 rounded-full mb-3">
                            <Clock className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">
                            Coming Soon
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            Upcoming Events functionality is under development. Stay tuned for exciting updates!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
