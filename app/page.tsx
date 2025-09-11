"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { User, Building2, GraduationCap, Shield, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Navbar } from '@/components/ui/navbar'
import { useAuth } from '@/hooks/useAuth'
import { RotatingText, AnimatedCounter } from '@/components/ui/animated-text'
import { PentagonGrid } from '@/components/ui/pentagon-grid'

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
                <div className="container mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[600px]">
                        {/* Left Side - Text Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-8"
                        >
                            {/* Sub-heading with animated counter */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="inline-flex items-center px-4 py-2 bg-primary-500/10 dark:bg-primary-500/20 rounded-full border border-primary-500/20"
                            >
                                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                    <AnimatedCounter end={200000} suffix="+" className="font-bold" /> Students Impacted
                                </span>
                            </motion.div>

                            {/* Main heading with rotating text */}
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
                            >
                                <RotatingText
                                    words={['Solutions', 'Upskilling', 'Hiring', 'Growth']}
                                    className="block"
                                />
                            </motion.h1>

                            {/* Sub-heading */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                                className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-medium"
                            >
                                Upskill • Connect • Apply • Get Hired
                            </motion.div>

                            {/* Description */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.8 }}
                                className="text-lg text-gray-600 dark:text-gray-400 max-w-lg"
                            >
                                Simplify campus recruitment with HireKarma — India's leading platform for end-to-end hiring, upskilling, and staffing solutions.
                            </motion.p>

                            {/* CTA Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 1.0 }}
                                className="flex flex-col sm:flex-row gap-4"
                            >
                                {isAuthenticated && user ? (
                                    <Link href={`/dashboard/${user.user_type}`}>
                                        <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600">
                                            Go to Dashboard
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link href="/auth/register">
                                            <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600">
                                                Explore Now
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
                            </motion.div>

                            {/* Social Proof */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 1.2 }}
                                className="flex items-center gap-4 pt-4"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">4.9</span>
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-500">Over 500+ reviews</span>
                            </motion.div>
                        </motion.div>

                        {/* Right Side - Visual Animation */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="relative h-[500px] lg:h-[600px]"
                        >
                            <PentagonGrid className="w-full h-full" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* User Type Selection */}
            <section className="py-20 px-4">
                <div className="container mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Choose Your Path
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            Join thousands of students, universities, and companies who trust HireKarma
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        {userTypes.map((type, index) => (
                            <motion.div
                                key={type.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                                className={`p-8 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${activeTab === type.id
                                    ? 'border-primary-500 bg-white dark:bg-gray-800 shadow-lg'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                                    }`}
                                onClick={() => setActiveTab(type.id as 'student' | 'corporate' | 'university')}
                            >
                                <div className="relative z-10">
                                    <div className={`w-16 h-16 bg-gradient-to-r ${type.color} rounded-xl flex items-center justify-center mb-6 mx-auto`}>
                                        <type.icon className="w-8 h-8 text-white" />
                                    </div>

                                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 text-center">
                                        {type.title}
                                    </h3>

                                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                                        {type.description}
                                    </p>

                                    <ul className="space-y-3 text-left">
                                        {type.features.map((feature, index) => (
                                            <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                <Sparkles className="w-4 h-4 text-primary-500 mr-3 flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        {isAuthenticated && user ? (
                            <Link href={`/dashboard/${user.user_type}`}>
                                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600">
                                    Go to Dashboard
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        ) : (
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