"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import {
    ChevronDown,
    Menu,
    X,
    User,
    Building2,
    GraduationCap,
    Shield,
    LogOut,
    Home,
    Target,
    Eye,
    Users,
    BookOpen,
    TrendingUp,
    Calendar,
    BarChart3,
    Briefcase,
    GraduationCap as Cap,
    Wrench,
    Users2
} from 'lucide-react'

interface NavbarProps {
    variant?: 'default' | 'transparent' | 'solid'
    className?: string
}

export function Navbar({
    variant = 'default',
    className = ""
}: NavbarProps) {
    const { user, isAuthenticated, isLoading, logout } = useAuth()
    const { theme, resolvedTheme } = useTheme()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isAboutOpen, setIsAboutOpen] = useState(false)
    const [isSolutionsOpen, setIsSolutionsOpen] = useState(false)
    const [isResourcesOpen, setIsResourcesOpen] = useState(false)
    const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)

    const handleLogout = () => {
        logout()
        setIsMobileMenuOpen(false)
    }

    const handleDropdownEnter = (dropdownType: 'about' | 'solutions' | 'resources') => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout)
            setHoverTimeout(null)
        }

        // Close all other dropdowns first
        setIsAboutOpen(false)
        setIsSolutionsOpen(false)
        setIsResourcesOpen(false)

        // Then open the selected one
        switch (dropdownType) {
            case 'about':
                setIsAboutOpen(true)
                break
            case 'solutions':
                setIsSolutionsOpen(true)
                break
            case 'resources':
                setIsResourcesOpen(true)
                break
        }
    }

    const handleDropdownLeave = (dropdownType: 'about' | 'solutions' | 'resources') => {
        const timeout = setTimeout(() => {
            switch (dropdownType) {
                case 'about':
                    setIsAboutOpen(false)
                    break
                case 'solutions':
                    setIsSolutionsOpen(false)
                    break
                case 'resources':
                    setIsResourcesOpen(false)
                    break
            }
        }, 150) // 150ms delay before closing

        setHoverTimeout(timeout)
    }

    const getDashboardPath = () => {
        if (!user) return '/dashboard'
        return `/dashboard/${user.user_type}`
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
                return `${baseClasses} bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-700/50`
            case 'solid':
                return `${baseClasses} bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700`
            default:
                return `${baseClasses} bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-700/50`
        }
    }

    // Determine which logo to use based on theme
    const getLogoSrc = () => {
        const isDark = resolvedTheme === 'dark' || (resolvedTheme === 'system' && theme === 'dark')
        return isDark ? '/images/HKlogowhite.png' : '/images/HKlogoblack.png'
    }

    // Don't render until auth state is determined
    if (isLoading) {
        return (
            <nav className={`main-navbar ${getNavbarClasses()} ${className}`}>
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center space-x-2">
                            <Link href="/auth/login" className="flex items-center space-x-2">
                                <Image
                                    src={getLogoSrc()}
                                    alt="HireKarma Logo"
                                    width={160}
                                    height={50}
                                    className="h-12 w-auto"
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
        <nav className={`main-navbar ${getNavbarClasses()} ${className}`}>
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <Link href={isAuthenticated ? getDashboardPath() : "/auth/login"} className="flex items-center space-x-2">
                            <Image
                                src={getLogoSrc()}
                                alt="HireKarma Logo"
                                width={150}
                                height={50}
                                priority
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-8">
                        {/* About Dropdown */}
                        {/* <div className="relative group">
                            <Button
                                variant="ghost"
                                className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400"
                                onMouseEnter={() => handleDropdownEnter('about')}
                                onMouseLeave={() => handleDropdownLeave('about')}
                            >
                                <span>About</span>
                                <ChevronDown className="w-4 h-4" />
                            </Button>

                            {isAboutOpen && (
                                <div
                                    className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                                    onMouseEnter={() => handleDropdownEnter('about')}
                                    onMouseLeave={() => handleDropdownLeave('about')}
                                >
                                    <Link href="/about/why-hirekarma" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-500 dark:hover:text-primary-400">
                                        <div className="flex items-center space-x-2">
                                            <Target className="w-4 h-4" />
                                            <span>Why HireKarma</span>
                                        </div>
                                    </Link>
                                    <Link href="/about/mission-vision" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-500 dark:hover:text-primary-400">
                                        <div className="flex items-center space-x-2">
                                            <Eye className="w-4 h-4" />
                                            <span>Mission & Vision</span>
                                        </div>
                                    </Link>
                                </div>
                            )}
                        </div> */}

                        {/* Solutions Dropdown */}
                        {/* <div className="relative group">
                            <Button
                                variant="ghost"
                                className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400"
                                onMouseEnter={() => handleDropdownEnter('solutions')}
                                onMouseLeave={() => handleDropdownLeave('solutions')}
                            >
                                <span>Solutions</span>
                                <ChevronDown className="w-4 h-4" />
                            </Button>

                            {isSolutionsOpen && (
                                <div
                                    className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                                    onMouseEnter={() => handleDropdownEnter('solutions')}
                                    onMouseLeave={() => handleDropdownLeave('solutions')}
                                >
                                    <Link href="/solutions/campus-placement" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-500 dark:hover:text-primary-400">
                                        <div className="flex items-center space-x-2">
                                            <Cap className="w-4 h-4" />
                                            <div>
                                                <div className="font-medium">Campus Placement</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Hire the best from top colleges</div>
                                            </div>
                                        </div>
                                    </Link>
                                    <Link href="/solutions/skill-development" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-500 dark:hover:text-primary-400">
                                        <div className="flex items-center space-x-2">
                                            <BookOpen className="w-4 h-4" />
                                            <div>
                                                <div className="font-medium">Skill Development</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Upskilling talent with job-ready skills</div>
                                            </div>
                                        </div>
                                    </Link>
                                    <Link href="/solutions/lateral-hiring" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-500 dark:hover:text-primary-400">
                                        <div className="flex items-center space-x-2">
                                            <Users className="w-4 h-4" />
                                            <div>
                                                <div className="font-medium">Lateral Hiring</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Hire experienced talent with ease</div>
                                            </div>
                                        </div>
                                    </Link>
                                    <Link href="/solutions/general-staffing" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-500 dark:hover:text-primary-400">
                                        <div className="flex items-center space-x-2">
                                            <Wrench className="w-4 h-4" />
                                            <div>
                                                <div className="font-medium">General Staffing</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">On-demand staffing for all business needs</div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            )}
                        </div> */}

                        {/* Resources Dropdown */}
                        {/* <div className="relative group">
                            <Button
                                variant="ghost"
                                className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400"
                                onMouseEnter={() => handleDropdownEnter('resources')}
                                onMouseLeave={() => handleDropdownLeave('resources')}
                            >
                                <span>Resources</span>
                                <ChevronDown className="w-4 h-4" />
                            </Button>

                            {isResourcesOpen && (
                                <div
                                    className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                                    onMouseEnter={() => handleDropdownEnter('resources')}
                                    onMouseLeave={() => handleDropdownLeave('resources')}
                                >
                                    <Link href="/resources/moments-corner" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-500 dark:hover:text-primary-400">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>Moments Corner</span>
                                        </div>
                                    </Link>
                                    <Link href="/resources/insights" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-500 dark:hover:text-primary-400">
                                        <div className="flex items-center space-x-2">
                                            <BarChart3 className="w-4 h-4" />
                                            <span>Insights</span>
                                        </div>
                                    </Link>
                                </div>
                            )}
                        </div> */}

                        {/* Auth Buttons */}
                        {isAuthenticated && user ? (
                            <div className="flex items-center space-x-3">
                                <Link href={getDashboardPath()}>
                                    <Button className="flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600">
                                        {(() => {
                                            const IconComponent = getUserTypeIcon()
                                            return <IconComponent className="w-4 h-4" />
                                        })()}
                                        <span>Dashboard</span>
                                    </Button>
                                </Link>

                                <Button
                                    variant="ghost"
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link href="/auth/register">
                                    <Button variant="outline">Sign Up</Button>
                                </Link>
                                <Link href="/auth/login">
                                    <Button>Sign In</Button>
                                </Link>
                            </div>
                        )}

                        <ThemeToggle />
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden flex items-center space-x-2">
                        <ThemeToggle />
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
                    <div className="lg:hidden absolute left-0 right-0 top-full bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col space-y-3 p-4">
                            {/* About Section */}
                            {/* <div className="space-y-2">
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">About</div>
                                <Link href="/about/why-hirekarma" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start">
                                        <Target className="w-4 h-4 mr-2" />
                                        Why HireKarma
                                    </Button>
                                </Link>
                                <Link href="/about/mission-vision" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start">
                                        <Eye className="w-4 h-4 mr-2" />
                                        Mission & Vision
                                    </Button>
                                </Link>
                            </div> */}

                            {/* Solutions Section */}
                            {/* <div className="space-y-2">
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Solutions</div>
                                <Link href="/solutions/campus-placement" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start">
                                        <Cap className="w-4 h-4 mr-2" />
                                        Campus Placement
                                    </Button>
                                </Link>
                                <Link href="/solutions/skill-development" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start">
                                        <BookOpen className="w-4 h-4 mr-2" />
                                        Skill Development
                                    </Button>
                                </Link>
                                <Link href="/solutions/lateral-hiring" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start">
                                        <Users className="w-4 h-4 mr-2" />
                                        Lateral Hiring
                                    </Button>
                                </Link>
                                <Link href="/solutions/general-staffing" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start">
                                        <Wrench className="w-4 h-4 mr-2" />
                                        General Staffing
                                    </Button>
                                </Link>
                            </div> */}

                            {/* Resources Section */}
                            {/* <div className="space-y-2">
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Resources</div>
                                <Link href="/resources/moments-corner" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Moments Corner
                                    </Button>
                                </Link>
                                <Link href="/resources/insights" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start">
                                        <BarChart3 className="w-4 h-4 mr-2" />
                                        Insights
                                    </Button>
                                </Link>
                            </div> */}

                            {/* Auth Section */}
                            {isAuthenticated && user ? (
                                <>
                                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <Link href={getDashboardPath()} onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button className="w-full justify-start bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600">
                                                {(() => {
                                                    const IconComponent = getUserTypeIcon()
                                                    return <IconComponent className="w-4 h-4 mr-2" />
                                                })()}
                                                Dashboard
                                            </Button>
                                        </Link>
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
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-6">
                                    <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full justify-start mb-4">
                                            Sign Up
                                        </Button>
                                    </Link>
                                    <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button className="w-full justify-start">
                                            Sign In
                                        </Button>
                                    </Link>
                                </div>
                            )}
                    </div>
                    </div>
                )}
        </div>
        </nav >
    )
}
