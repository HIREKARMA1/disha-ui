"use client"

import Link from 'next/link'
import { Linkedin, Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { config } from '@/lib/config'

export function Footer() {
    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-10 md:pt-16 pb-8 md:pb-10">
            <div className="container mx-auto px-6 sm:px-8 lg:px-10 py-2">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 lg:gap-16 mb-10 md:mb-14">
                    {/* Brand Section */}
                    <div className="space-y-5 text-center md:text-left flex flex-col items-center md:items-start">
                        <BrandLogo imageClassName="h-10 w-auto object-contain" />
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                            A unified platform built for modern campus recruitment.
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                            Support available for students, universities, and recruiters across India.
                        </p>
                        <div className="flex space-x-2 pt-2 justify-center md:justify-start">
                            <a href="https://x.com/hirekarma" target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary-500 dark:hover:bg-white/10" aria-label="X">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                                </svg>
                            </a>
                            <a href="https://www.linkedin.com/company/hirekarma-pvt-ltd" target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary-500 dark:hover:bg-white/10" aria-label="LinkedIn">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="https://facebook.com/hirekarma" target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary-500 dark:hover:bg-white/10" aria-label="Facebook">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="https://instagram.com/hirekarma" target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary-500 dark:hover:bg-white/10" aria-label="Instagram">
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="text-center md:text-left flex flex-col items-center md:items-start">
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
                                <Link href="/events" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors">
                                    Upcoming Events
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
                    <div className="text-center md:text-left flex flex-col items-center md:items-start">
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
                                <a href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors">
                                    Get in Touch
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="text-center md:text-left flex flex-col items-center md:items-start">
                        <h3 className="text-gray-900 dark:text-white font-semibold mb-5 text-lg">Contact Us</h3>
                        <ul className="space-y-4 flex flex-col items-center md:items-start">
                            <li>
                                <a
                                    href="mailto:info@hirekarma.in"
                                    className="flex items-center justify-center md:justify-start space-x-3 text-gray-600 dark:text-gray-400 text-sm hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                                >
                                    <Mail className="w-5 h-5 text-primary-500 shrink-0" />
                                    <span>info@hirekarma.in</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href={`tel:+${config.whatsapp.number}`}
                                    className="flex items-center justify-center md:justify-start space-x-3 text-gray-600 dark:text-gray-400 text-sm hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                                >
                                    <Phone className="w-5 h-5 text-primary-500 shrink-0" />
                                    <span>{config.support.phoneDisplay}</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://www.google.com/maps/search/?api=1&query=2nd+Floor%2C+SS+Niwas%2C+Hirekarma+Private+Limited%2C+Raghunathpur%2C+Bhubaneswar%2C+Odisha+751024"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center md:justify-start space-x-3 text-gray-600 dark:text-gray-400 text-sm hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                                >
                                    <MapPin className="w-5 h-5 text-primary-500 shrink-0" />
                                    <span className="text-center md:text-left">2nd Floor, SS Niwas, Hirekarma Private Limited, Raghunathpur, Bhubaneswar, Odisha 751024</span>
                                </a>
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
