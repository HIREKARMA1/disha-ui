"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Button } from '@/components/ui/button'
import {
    Shield,
    User,
    Building2,
    GraduationCap,
    LogOut,
    Menu,
    X,
    Home,
    Briefcase,
    BookOpen,
    Settings
} from 'lucide-react'

interface NavbarProps {
    variant?: 'default' | 'transparent' | 'solid'
    showHomeLink?: boolean
    className?: string
}

export function Navbar({
    variant = 'default',
    showHomeLink = true,
    className = ""
}: NavbarProps) {
    const { user, isAuthenticated, isLoading, logout } = useAuth()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)



    // Force re-check auth status when component mounts
    useEffect(() => {
        // Small delay to ensure auth hook has initialized
        const timer = setTimeout(() => {
            // This will trigger a re-render if auth state changes
        }, 100)
        return () => clearTimeout(timer)
    }, [isAuthenticated, user])

    const handleLogout = () => {
        logout()
        setIsMobileMenuOpen(false)
    }

    const getDashboardPath = () => {
        if (!user) return '/dashboard'
        return `/dashboard/${user.user_type}`
    }

    const getLogoLink = () => {
        // If user is authenticated, logo should go to their dashboard
        // If not authenticated, logo should go to home page
        return isAuthenticated && user ? getDashboardPath() : '/'
    }

    const getUserTypeIcon = () => {
        switch (user?.user_type) {
            case 'student':
                return User
            case 'corporate':
                return Building2
            case 'university':
                return GraduationCap
            case 'admin':
                return Shield
            default:
                return Shield
        }
    }

    const getUserTypeLabel = () => {
        switch (user?.user_type) {
            case 'student':
                return 'Student'
            case 'corporate':
                return 'Corporate'
            case 'university':
                return 'University'
            case 'admin':
                return 'Admin'
            default:
                return 'User'
        }
    }

    const getNavbarClasses = () => {
        const baseClasses = "w-full z-50 transition-all duration-300 fixed top-0 left-0 right-0"

        switch (variant) {
            case 'transparent':
                return `${baseClasses}`
            case 'solid':
                return `${baseClasses} bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700`
            default:
                return `${baseClasses} bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-700/50`
        }
    }

    // Don't render until auth state is determined
    if (isLoading) {
        return (
            <nav className={`${getNavbarClasses()} ${className}`}>
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center space-x-2">
                            <Link href="/" className="flex items-center space-x-2">
                                <Image
                                    src="/images/HireKarmaLogo.png"
                                    alt="HireKarma Logo"
                                    width={120}
                                    height={40}
                                    className="h-10 w-auto"
                                    priority
                                />
                            </Link>
                        </div>

                        {/* Loading state */}
                        <div className="flex items-center space-x-4">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin"></div>
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </nav>
        )
    }

    return (
        <nav className={`${getNavbarClasses()} ${className}`}>


            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <Link href={getLogoLink()} className="flex items-center space-x-2">
                            <Image
                                src="/images/HireKarmaLogo.png"
                                alt="HireKarma Logo"
                                width={120}
                                height={40}
                                className="h-10 w-auto"
                                priority
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        {showHomeLink && (
                            <Link href="/">
                                <Button variant="ghost" className="flex items-center space-x-2">
                                    <Home className="w-4 h-4" />
                                    <span>Home</span>
                                </Button>
                            </Link>
                        )}

                        {isAuthenticated && user ? (
                            <>
                                <Link href={getDashboardPath()}>
                                    <Button variant="outline" className="flex items-center space-x-2">
                                        {(() => {
                                            const IconComponent = getUserTypeIcon()
                                            return <IconComponent className="w-4 h-4" />
                                        })()}
                                        <span>Dashboard</span>
                                    </Button>
                                </Link>

                                {/* User Menu */}
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                                        {(() => {
                                            const IconComponent = getUserTypeIcon()
                                            return <IconComponent className="w-4 h-4 text-secondary-500" />
                                        })()}
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {getUserTypeLabel()}
                                        </span>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        onClick={handleLogout}
                                        className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Logout</span>
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link href="/auth/login">
                                    <Button variant="ghost">Sign In</Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button>Get Started</Button>
                                </Link>
                            </div>
                        )}

                        <ThemeToggle />
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col space-y-3 pt-4">
                            {showHomeLink && (
                                <Link href="/">
                                    <Button variant="ghost" className="w-full justify-start">
                                        <Home className="w-4 h-4 mr-2" />
                                        Home
                                    </Button>
                                </Link>
                            )}

                            {isAuthenticated && user ? (
                                <>
                                    <Link href={getDashboardPath()}>
                                        <Button variant="outline" className="w-full justify-start">
                                            {(() => {
                                                const IconComponent = getUserTypeIcon()
                                                return <IconComponent className="w-4 h-4 mr-2" />
                                            })()}
                                            Dashboard
                                        </Button>
                                    </Link>

                                    <div className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                                        <div className="flex items-center space-x-2">
                                            {(() => {
                                                const IconComponent = getUserTypeIcon()
                                                return <IconComponent className="w-4 h-4 text-secondary-500" />
                                            })()}
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {getUserTypeLabel()}
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        onClick={handleLogout}
                                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link href="/auth/login">
                                        <Button variant="ghost" className="w-full justify-start">
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link href="/auth/register">
                                        <Button className="w-full justify-start">
                                            Get Started
                                        </Button>
                                    </Link>
                                </>
                            )}

                            <div className="pt-2">
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
