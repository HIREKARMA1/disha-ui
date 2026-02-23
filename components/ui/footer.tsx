"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { Twitter, Linkedin, Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
    const { theme, resolvedTheme } = useTheme()

    const getLogoSrc = () => {
        const isDark = resolvedTheme === 'dark' || (resolvedTheme === 'system' && theme === 'dark')
        return isDark ? '/images/HKlogowhite.png' : '/images/HKlogoblack.png'
    }

    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-16 pb-10">
            <div className="container mx-auto px-6 sm:px-8 lg:px-10 py-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14 md:gap-12 lg:gap-16 mb-14">
                    {/* Brand Section */}
                    <div className="space-y-5 text-center md:text-left flex flex-col items-center md:items-start px-2 md:px-0">
                        <Link href="/" className="inline-block">
                            <Image
                                src={getLogoSrc()}
                                alt="HireKarma Logo"
                                width={150}
                                height={50}
                                className="h-10 w-auto object-contain"
                            />
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                            A unified platform built for modern campus recruitment.
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                            Support available for students, universities, and recruiters across India.
                        </p>
                        <div className="flex space-x-4 pt-2 justify-center md:justify-start">
                            <a href="https://twitter.com/hirekarma" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-500 transition-colors" aria-label="Twitter">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="https://www.linkedin.com/company/hirekarma-pvt-ltd" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-500 transition-colors" aria-label="LinkedIn">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="https://facebook.com/hirekarma" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-500 transition-colors" aria-label="Facebook">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="https://instagram.com/hirekarma" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-500 transition-colors" aria-label="Instagram">
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="text-center md:text-left flex flex-col items-center md:items-start px-2 md:px-0">
                        <h3 className="text-gray-900 dark:text-white font-semibold mb-5 text-lg">Quick Links</h3>
                        <ul className="space-y-4 flex flex-col items-center md:items-start">
                            <li>
                                <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/jobs" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors">
                                    Jobs
                                </Link>
                            </li>
                            <li>
                                <Link href="/auth/login" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors">
                                    Sign In
                                </Link>
                            </li>
                            <li>
                                <Link href="/auth/register" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors">
                                    Sign Up
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="text-center md:text-left flex flex-col items-center md:items-start px-2 md:px-0">
                        <h3 className="text-gray-900 dark:text-white font-semibold mb-5 text-lg">Resources</h3>
                        <ul className="space-y-4 flex flex-col items-center md:items-start">
                            <li>
                                <a href="https://hirekarma.in/about-us/our-story" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors">
                                    Our Story
                                </a>
                            </li>
                            <li>
                                <a href="https://hirekarma.in/about-us/mission-value" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors">
                                    Mission & Value
                                </a>
                            </li>
                            <li>
                                <a href="https://hirekarma.in/about-us/people" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors">
                                    People
                                </a>
                            </li>
                            <li>
                                <a href="https://hirekarma.in/contact" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors">
                                    Get in Touch
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="text-center md:text-left flex flex-col items-center md:items-start px-2 md:px-0">
                        <h3 className="text-gray-900 dark:text-white font-semibold mb-5 text-lg">Contact Us</h3>
                        <ul className="space-y-4 flex flex-col items-center md:items-start">
                            <li className="flex items-center justify-center md:justify-start space-x-3 text-gray-600 dark:text-gray-400 text-sm">
                                <Mail className="w-5 h-5 text-primary-500 shrink-0" />
                                <span>info@hirekarma.in</span>
                            </li>
                            <li className="flex items-center justify-center md:justify-start space-x-3 text-gray-600 dark:text-gray-400 text-sm">
                                <Phone className="w-5 h-5 text-primary-500 shrink-0" />
                                <span>+91 90786 83876</span>
                            </li>
                            <li className="flex items-center justify-center md:justify-start space-x-3 text-gray-600 dark:text-gray-400 text-sm">
                                <MapPin className="w-5 h-5 text-primary-500 shrink-0" />
                                <span className="text-center md:text-left">2nd Floor, SS Niwas, Hirekarma Private Limited, Raghunathpur, Bhubaneswar, Odisha 751024</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-10 pb-2 flex flex-col md:flex-row justify-between items-center gap-6 px-2 md:px-0">
                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center md:text-left">
                        © {new Date().getFullYear()} HireKarma. All rights reserved.
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start space-x-6">
                        <a href="https://hirekarma.in/PrivacyPolicy" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-primary-500 text-sm transition-colors">
                            Privacy Policy
                        </a>
                        <a href="https://hirekarma.in/TermsofService" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-primary-500 text-sm transition-colors">
                            Terms of Service
                        </a>
                        <a href="https://www.hirekarma.in/" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-primary-500 text-sm transition-colors">
                            HireKarma Pvt Ltd
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
