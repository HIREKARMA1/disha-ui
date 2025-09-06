"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { User, Building2, GraduationCap, Shield, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Navbar } from '@/components/ui/navbar'
import { useAuth } from '@/hooks/useAuth'

export default function HomePage() {
    const [activeTab, setActiveTab] = useState<'student' | 'corporate' | 'university'>('student')
    const { user, isAuthenticated, isLoading } = useAuth()

    const userTypes = [
        {
            id: 'student',
            title: 'Student',
            description: 'Find internships, jobs, and build your career',
            icon: User,
            color: 'from-primary-500 to-secondary-500',
            features: ['Job matching', 'Skill development', 'Career guidance', 'Resume builder']
        },
        {
            id: 'corporate',
            title: 'Corporate',
            description: 'Hire talented students and grow your team',
            icon: Building2,
            color: 'from-accent-green-500 to-accent-green-600',
            features: ['Talent pool', 'Smart matching', 'Analytics dashboard', 'Quick hiring']
        },
        {
            id: 'university',
            title: 'University',
            description: 'Connect students with opportunities',
            icon: GraduationCap,
            color: 'from-accent-orange-500 to-accent-orange-600',
            features: ['Student placement', 'Industry connections', 'Career services', 'Alumni network']
        }
    ]

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <Navbar variant="transparent" />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <Navbar variant="transparent" />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4">
                <div className="container mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
                            Your Career
                            <span className="block gradient-text">Destiny Awaits</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                            Connect with opportunities that match your skills and aspirations.
                            <span className="text-primary-500 font-semibold"> It all depends upon your karma.</span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                            {isAuthenticated && user ? (
                                // Show Dashboard button for logged-in users
                                <Link href={`/dashboard/${user.user_type}`}>
                                    <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600">
                                        Go to Dashboard
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>
                            ) : (
                                // Show Get Started and Sign In buttons for non-logged-in users
                                <>
                                    <Link href="/auth/register">
                                        <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600">
                                            Get Started
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </Button>
                                    </Link>
                                    <Link href="/auth/login">
                                        <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                                            Sign In
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>

                    {/* User Type Selection */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-4xl mx-auto"
                    >
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                            Choose Your Path
                        </h2>

                        <div className="grid md:grid-cols-3 gap-6 mb-12">
                            {userTypes.map((type, index) => (
                                <motion.div
                                    key={type.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${activeTab === type.id
                                        ? 'border-primary-500 bg-white dark:bg-gray-800 shadow-lg'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                                        }`}
                                    onClick={() => setActiveTab(type.id as 'student' | 'corporate' | 'university')}
                                >
                                    <div className="relative z-10">
                                        <div className={`w-16 h-16 bg-gradient-to-r ${type.color} rounded-xl flex items-center justify-center mb-4 mx-auto`}>
                                            <type.icon className="w-8 h-8 text-white" />
                                        </div>

                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                            {type.title}
                                        </h3>

                                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                                            {type.description}
                                        </p>

                                        <ul className="space-y-2 text-left">
                                            {type.features.map((feature, index) => (
                                                <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                    <Sparkles className="w-4 h-4 text-primary-500 mr-2 flex-shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {isAuthenticated && user ? (
                                // Show Dashboard button for logged-in users
                                <Link href={`/dashboard/${user.user_type}`}>
                                    <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600">
                                        Go to Dashboard
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>
                            ) : (
                                // Show Sign In and Create Account buttons for non-logged-in users
                                <>
                                    <Link href={`/auth/login?type=${activeTab}`}>
                                        <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600">
                                            Sign In as {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </Button>
                                    </Link>
                                    <Link href={`/auth/register?type=${activeTab}`}>
                                        <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                                            Create Account
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 bg-white dark:bg-gray-900">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Why Choose HireKarma?
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            We're building the future of career development and job matching
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Sparkles,
                                title: "Smart Matching",
                                description: "AI-powered job and candidate matching for optimal results"
                            },
                            {
                                icon: Shield,
                                title: "Secure & Private",
                                description: "Your data is protected with enterprise-grade security"
                            },
                            {
                                icon: User,
                                title: "Personalized Experience",
                                description: "Tailored recommendations based on your skills and goals"
                            }
                        ].map((feature: { icon: any; title: string; description: string }, index: number) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center p-6"
                            >
                                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <feature.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
