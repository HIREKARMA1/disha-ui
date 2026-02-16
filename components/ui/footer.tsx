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
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="space-y-4">
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
                        <div className="flex space-x-4 pt-2">
                            <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-gray-900 dark:text-white font-semibold mb-4 text-lg">Quick Links</h3>
                        <ul className="space-y-3">
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
                    <div>
                        <h3 className="text-gray-900 dark:text-white font-semibold mb-4 text-lg">Resources</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-gray-900 dark:text-white font-semibold mb-4 text-lg">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start space-x-3 text-gray-600 dark:text-gray-400 text-sm">
                                <Mail className="w-5 h-5 text-primary-500 shrink-0" />
                                <span>support@hirekarma.com</span>
                            </li>
                            <li className="flex items-start space-x-3 text-gray-600 dark:text-gray-400 text-sm">
                                <Phone className="w-5 h-5 text-primary-500 shrink-0" />
                                <span>+91 123 456 7890</span>
                            </li>
                            <li className="flex items-start space-x-3 text-gray-600 dark:text-gray-400 text-sm">
                                <MapPin className="w-5 h-5 text-primary-500 shrink-0" />
                                <span>123, Tech Park, Bangalore, India</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center md:text-left">
                        © {new Date().getFullYear()} HireKarma. All rights reserved.
                    </p>
                    <div className="flex space-x-6">
                        <Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-500 text-sm transition-colors">
                            Privacy
                        </Link>
                        <Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-500 text-sm transition-colors">
                            Terms
                        </Link>
                        <Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-500 text-sm transition-colors">
                            Cookies
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
