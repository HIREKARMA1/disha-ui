"use client"

import Link from 'next/link'
import { Linkedin, Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { config } from '@/lib/config'

export function Footer() {
    return (
        <footer className="border-t border-gray-200 bg-white pb-8 pt-8 dark:border-gray-800 dark:bg-gray-900 md:pb-10 md:pt-14">
            <div className="container mx-auto px-5 sm:px-8 lg:px-10">
                <div className="mb-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:mb-12 lg:grid-cols-4 lg:gap-12">
                    {/* Brand — full width on mobile so columns stay aligned */}
                    <div className="flex flex-col items-start space-y-3 sm:col-span-2 lg:col-span-1">
                        <BrandLogo imageClassName="h-9 w-auto object-contain md:h-10" />
                        <p className="max-w-sm text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                            A unified platform built for modern campus recruitment. Support available for students,
                            universities, and recruiters across India.
                        </p>
                        <div className="flex space-x-1 pt-1">
                            <a
                                href="https://x.com/hirekarma"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary-500 dark:hover:bg-white/10"
                                aria-label="X"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                                </svg>
                            </a>
                            <a
                                href="https://www.linkedin.com/company/hirekarma-pvt-ltd"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary-500 dark:hover:bg-white/10"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a
                                href="https://facebook.com/hirekarma"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary-500 dark:hover:bg-white/10"
                                aria-label="Facebook"
                            >
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a
                                href="https://instagram.com/hirekarma"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary-500 dark:hover:bg-white/10"
                                aria-label="Instagram"
                            >
                                <Instagram className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="text-left">
                        <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">Quick Links</h3>
                        <ul className="space-y-2.5">
                            <li>
                                <Link
                                    href="/"
                                    className="text-sm text-gray-600 transition-colors hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/jobs"
                                    className="text-sm text-gray-600 transition-colors hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                                >
                                    Jobs
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/events"
                                    className="text-sm text-gray-600 transition-colors hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                                >
                                    Upcoming Events
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/auth/login"
                                    className="text-sm text-gray-600 transition-colors hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                                >
                                    Sign In
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/auth/register"
                                    className="text-sm text-gray-600 transition-colors hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                                >
                                    Sign Up
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="text-left">
                        <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">Resources</h3>
                        <ul className="space-y-2.5">
                            <li>
                                <a
                                    href="https://hirekarma.in/about-us/our-story"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-gray-600 transition-colors hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                                >
                                    Our Story
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://hirekarma.in/about-us/mission-value"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-gray-600 transition-colors hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                                >
                                    Mission & Value
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://hirekarma.in/about-us/people"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-gray-600 transition-colors hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                                >
                                    People
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/contact"
                                    className="text-sm text-gray-600 transition-colors hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                                >
                                    Get in Touch
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="text-left sm:col-span-2 lg:col-span-1">
                        <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">Contact Us</h3>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="mailto:info@hirekarma.in"
                                    className="flex items-start gap-3 text-sm text-gray-600 transition-colors hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                                >
                                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                                    <span>info@hirekarma.in</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href={`tel:+${config.whatsapp.number}`}
                                    className="flex items-start gap-3 text-sm text-gray-600 transition-colors hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                                >
                                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                                    <span>{config.support.phoneDisplay}</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://www.google.com/maps/search/?api=1&query=2nd+Floor%2C+SS+Niwas%2C+Hirekarma+Private+Limited%2C+Raghunathpur%2C+Bhubaneswar%2C+Odisha+751024"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start gap-3 text-sm text-gray-600 transition-colors hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                                >
                                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                                    <span className="text-left leading-relaxed">
                                        2nd Floor, SS Niwas, Hirekarma Private Limited, Raghunathpur, Bhubaneswar, Odisha
                                        751024
                                    </span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col items-start justify-between gap-3 border-t border-gray-200 pt-6 dark:border-gray-800 sm:flex-row sm:items-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        © {new Date().getFullYear()} HireKarma. All rights reserved.
                    </p>
                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                        <a
                            href="https://hirekarma.in/PrivacyPolicy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-500 transition-colors hover:text-primary-500 dark:text-gray-400"
                        >
                            Privacy Policy
                        </a>
                        <a
                            href="https://hirekarma.in/TermsofService"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-500 transition-colors hover:text-primary-500 dark:text-gray-400"
                        >
                            Terms of Service
                        </a>
                        <a
                            href="https://www.hirekarma.in/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-500 transition-colors hover:text-primary-500 dark:text-gray-400"
                        >
                            HireKarma Pvt Ltd
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
