"use client"

import Link from 'next/link'
import { Linkedin, Facebook, Instagram } from 'lucide-react'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { config } from '@/lib/config'
import { buildAuthPath } from '@/lib/authLinks'

const MAPS_DIRECTIONS_URL =
    'https://www.google.com/maps/search/?api=1&query=2nd+Floor%2C+SS+Niwas%2C+Hirekarma+Private+Limited%2C+Raghunathpur%2C+Bhubaneswar%2C+Odisha+751024'

const MAPS_EMBED_URL =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3739.9763807315003!2d85.8203458793457!3d20.383863700000006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a19096e0259fc7f%3A0x7ad66a4df8112eda!2sHireKarma%20Private%20Limited!5e0!3m2!1sen!2sin!4v1789020372578!5m2!1sen!2sin'

const footerLinkClass =
    'text-sm text-gray-600 transition-colors hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400'

export function Footer() {
    return (
        <footer id="hub-contact" className="scroll-mt-28 border-t border-gray-200 bg-white pb-8 pt-8 dark:border-[#1A2233] dark:bg-[#0A0D14] md:pb-10 md:pt-14">
            <div className="container mx-auto px-5 sm:px-8 lg:px-10">
                <div className="mb-8 grid grid-cols-1 items-start gap-8 sm:grid-cols-2 lg:mb-12 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-10">
                    {/* Brand — full width on mobile so columns stay aligned */}
                    <div className="flex flex-col items-start space-y-3 sm:col-span-2 lg:col-span-3">
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
                    <div className="text-left lg:col-span-2">
                        <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Quick Links</h3>
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
                                <Link href="/jobs" className={footerLinkClass}>
                                    Jobs
                                </Link>
                            </li>
                            <li>
                                <Link href="/events" className={footerLinkClass}>
                                    Upcoming Events
                                </Link>
                            </li>
                            <li>
                                <Link href="/mock-tests" className={footerLinkClass}>
                                    Mock Tests
                                </Link>
                            </li>
                            <li>
                                <Link href={buildAuthPath('/auth/login')} className={footerLinkClass}>
                                    Sign In
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={buildAuthPath('/auth/register')}
                                    className="text-sm text-gray-600 transition-colors hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                                >
                                    Sign Up
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="text-left lg:col-span-2">
                        <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Resources</h3>
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
                                    Contact &amp; Support
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info + map embed */}
                    <div className="text-left sm:col-span-2 lg:col-span-5">
                        <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-[minmax(0,1fr)_210px]">
                            <div>
                                <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Contact Us</h3>
                                <dl className="grid grid-cols-[4.75rem_minmax(0,1fr)] gap-x-3 gap-y-3 text-sm">
                                    <dt className="pt-0.5 font-medium text-gray-900 dark:text-white">Email</dt>
                                    <dd>
                                        <a
                                            href="mailto:info@hirekarma.in"
                                            className="text-gray-600 transition-colors hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                                        >
                                            info@hirekarma.in
                                        </a>
                                    </dd>
                                    <dt className="pt-0.5 font-medium text-gray-900 dark:text-white">Contact</dt>
                                    <dd>
                                        <a
                                            href={`tel:+${config.whatsapp.number}`}
                                            className="text-gray-600 transition-colors hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                                        >
                                            {config.support.phoneDisplay}
                                        </a>
                                    </dd>
                                    <dt className="pt-0.5 font-medium text-gray-900 dark:text-white">Location</dt>
                                    <dd>
                                        <a
                                            href={MAPS_DIRECTIONS_URL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block leading-relaxed text-gray-600 transition-colors hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                                        >
                                            2nd Floor, SS Niwas, Hirekarma Private Limited, Raghunathpur, Bhubaneswar, Odisha
                                            751024
                                        </a>
                                    </dd>
                                </dl>
                            </div>
                            <a
                                href={MAPS_DIRECTIONS_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-700"
                                aria-label="Open HireKarma location in Google Maps"
                            >
                                <iframe
                                    title="HireKarma Private Limited location"
                                    src={MAPS_EMBED_URL}
                                    className="pointer-events-none h-[168px] w-full border-0"
                                    loading="lazy"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                />
                            </a>
                        </div>
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
