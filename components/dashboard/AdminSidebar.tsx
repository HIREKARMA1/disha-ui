"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    User,
    Users,
    Building2,
    Shield,
    Settings,
    BarChart3,
    Activity,
    Calendar,
    FileText,
    X,
    Menu,
    LogOut,
    Eye,
    Database,
    Server,
    AlertTriangle,
    Briefcase,
    Brain,
    GraduationCap
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import Image from 'next/image'
import { useLoading } from '@/contexts/LoadingContext'
import { adminProfileService } from '@/services/adminProfileService'

interface NavItem {
    label: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    description?: string
    color?: string
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard/admin',
        icon: LayoutDashboard,
        description: 'Overview and analytics',
        color: 'from-blue-500 to-purple-600'
    },
    {
        label: 'Profile',
        href: '/dashboard/admin/profile',
        icon: User,
        description: 'Admin information & settings',
        color: 'from-green-500 to-teal-600'
    },
    {
        label: 'User Management',
        href: '/dashboard/admin/users',
        icon: Users,
        description: 'Manage all users',
        color: 'from-orange-500 to-red-600'
    },
    // {
    //     label: 'Universities',
    //     href: '/dashboard/admin/universities',
    //     icon: Building2,
    //     description: 'Manage universities',
    //     color: 'from-purple-500 to-pink-600'
    // },
    // {
    //     label: 'Corporates',
    //     href: '/dashboard/admin/corporates',
    //     icon: Building2,
    //     description: 'Manage corporates',
    //     color: 'from-cyan-500 to-blue-600'
    // },
    // {
    //     label: 'Student Management',
    //     href: '/dashboard/admin/students',
    //     icon: GraduationCap,
    //     description: 'Manage students across universities',
    //     color: 'from-emerald-500 to-teal-600'
    // },
    {
        label: 'Job Management',
        href: '/dashboard/admin/jobs',
        icon: Briefcase,
        description: 'Manage all job postings',
        color: 'from-indigo-500 to-blue-600'
    },
    {
        label: 'Practice Tests',
        href: '/dashboard/admin/practice',
        icon: Brain,
        description: 'Manage practice tests & questions',
        color: 'from-rose-500 to-pink-600'
    },
    {
        label: 'Assessments',
        href: '/dashboard/admin/assessments',
        icon: FileText,
        description: 'Manage assessments',
        color: 'from-amber-500 to-orange-600'
    },
    {
        label: 'Analytics',
        href: '/dashboard/admin/analytics',
        icon: BarChart3,
        description: 'Platform insights',
        color: 'from-emerald-500 to-green-600'
    },
    {
        label: 'Events',
        href: '/dashboard/admin/events',
        icon: Calendar,
        description: 'Manage events',
        color: 'from-rose-500 to-pink-600'
    },
    {
        label: 'System Monitor',
        href: '/dashboard/admin/monitor',
        icon: Activity,
        description: 'System health monitoring',
        color: 'from-yellow-500 to-orange-600'
    },
    {
        label: 'Reports',
        href: '/dashboard/admin/reports',
        icon: FileText,
        description: 'Generate reports',
        color: 'from-emerald-500 to-green-600'
    },
    {
        label: 'Audit Logs',
        href: '/dashboard/admin/audit',
        icon: Eye,
        description: 'View audit logs',
        color: 'from-cyan-500 to-blue-600'
    },
    {
        label: 'Database',
        href: '/dashboard/admin/database',
        icon: Database,
        description: 'Database management',
        color: 'from-violet-500 to-purple-600'
    },
    {
        label: 'System Settings',
        href: '/dashboard/admin/settings',
        icon: Settings,
        description: 'System configuration',
        color: 'from-gray-500 to-gray-600'
    },
    {
        label: 'Licenses',
        href: '/dashboard/admin/licenses',
        icon: FileText,
        description: 'Manage license requests and licenses',
        color: 'from-indigo-500 to-purple-600'
    }
]

interface AdminSidebarProps {
    className?: string
}

export function AdminSidebar({ className = '' }: AdminSidebarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [profileData, setProfileData] = useState<any>(null)
    const [isLoadingProfile, setIsLoadingProfile] = useState(false)
    const [imageError, setImageError] = useState(false)
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const desktopNavRef = useRef<HTMLDivElement>(null)

    // Fetch profile data when component mounts
    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.user_type === 'admin') {
                setIsLoadingProfile(true)
                try {
                    const data = await adminProfileService.getProfile()
                    setProfileData(data)
                } catch (error) {
                    console.error('Failed to fetch profile:', error)
                    // Set profileData to null on error so it falls back to user object
                    setProfileData(null)
                } finally {
                    setIsLoadingProfile(false)
                }
            }
        }

        fetchProfile()
    }, [user])

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
    }

    const handleLogout = () => {
        logout()
        closeMobileMenu()
    }

    useEffect(() => {
        if (!desktopNavRef.current) return
        const activeItem = desktopNavRef.current.querySelector('[data-sidebar-item="active"]')
        if (activeItem instanceof HTMLElement) {
            activeItem.scrollIntoView({
                block: 'nearest',
                inline: 'nearest',
                behavior: 'smooth'
            })
        }
    }, [pathname])

    // Get display name from profile data
    const getDisplayName = () => {
        // Prioritize profile data name
        if (profileData?.name && profileData.name.trim()) {
            return profileData.name
        }
        // Fall back to user name, but only if it's not an email
        if (user?.name && user.name.trim() && !user.name.includes('@')) {
            return user.name
        }
        // If user.name is email or missing, use a default
        return 'Admin'
    }

    // Get display email
    const getDisplayEmail = () => {
        return profileData?.email || user?.email || 'admin@hirekarma.com'
    }

    // Get profile picture
    const getProfilePicture = () => {
        return profileData?.profile_picture || null
    }

    // Handle profile picture error
    const handleImageError = () => {
        setImageError(true)
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <div className={`hidden lg:flex flex-col w-64 bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border-r border-gray-200 dark:border-gray-700 fixed top-16 left-0 h-[calc(100vh-4rem)] z-40 ${className}`}>
                {/* User Profile Section */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-500 to-secondary-500">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 overflow-hidden">
                            {getProfilePicture() && !imageError ? (
                                <Image
                                    src={getProfilePicture()}
                                    alt="Profile"
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                    onError={handleImageError}
                                />
                            ) : getDisplayName() !== 'Admin Name' ? (
                                <span className="text-white font-semibold text-lg">
                                    {getDisplayName().charAt(0).toUpperCase()}
                                </span>
                            ) : (
                                <Shield className="w-6 h-6 text-white" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                                {getDisplayName()}
                            </p>
                            <p className="text-xs text-white/80 truncate">
                                {getDisplayEmail()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav ref={desktopNavRef} className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const { startLoading } = useLoading()

                        const handleClick = () => {
                            if (!isActive) {
                                startLoading()
                            }
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={handleClick}
                                data-sidebar-item={isActive ? 'active' : 'inactive'}
                                className={`group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg ${isActive
                                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105`
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${isActive
                                    ? 'bg-white/20 backdrop-blur-sm'
                                    : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-white/50 dark:group-hover:bg-gray-600/50'
                                    }`}>
                                    <item.icon className={`w-5 h-5 ${isActive
                                        ? 'text-white'
                                        : 'text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                                        }`} />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">{item.label}</div>
                                    {item.description && (
                                        <div className={`text-xs mt-0.5 ${isActive
                                            ? 'text-white/90'
                                            : 'text-gray-600 dark:text-gray-300'
                                            }`}>
                                            {item.description}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </nav>

                {/* Logout Section */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 group"
                    >
                        <div className="p-2 rounded-lg mr-3 bg-red-100 dark:bg-red-900/20 group-hover:bg-red-200 dark:group-hover:bg-red-900/30 transition-colors">
                            <LogOut className="w-5 h-5" />
                        </div>
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 shadow-lg pb-safe" style={{ touchAction: 'none' }}>
                <div className="flex justify-around items-center py-1.5 px-1 w-full">
                    {navItems.slice(0, 5).map((item) => {
                        const isActive = pathname === item.href
                        const { startLoading } = useLoading()

                        const handleClick = () => {
                            if (!isActive) {
                                startLoading()
                            }
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={handleClick}
                                className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 w-full max-w-[20%] ${isActive
                                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </Link>
                        )
                    })}
                    <button
                        onClick={toggleMobileMenu}
                        className="flex items-center justify-center p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 w-full max-w-[20%]"
                    >
                        <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
                        onClick={closeMobileMenu}
                    >
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute right-0 top-0 h-full w-80 bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 shadow-xl flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-500 to-secondary-500 flex-shrink-0">
                                <h2 className="text-lg font-semibold text-white">
                                    Menu
                                </h2>
                                <button
                                    onClick={closeMobileMenu}
                                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            {/* User Profile in Mobile */}
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center overflow-hidden">
                                        {getProfilePicture() && !imageError ? (
                                            <Image
                                                src={getProfilePicture()}
                                                alt="Profile"
                                                width={40}
                                                height={40}
                                                className="w-full h-full object-cover"
                                                onError={handleImageError}
                                            />
                                        ) : getDisplayName() !== 'Admin Name' ? (
                                            <span className="text-white font-semibold text-sm">
                                                {getDisplayName().charAt(0).toUpperCase()}
                                            </span>
                                        ) : (
                                            <Shield className="w-5 h-5 text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {getDisplayName()}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {getDisplayEmail()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation - Scrollable */}
                            <nav className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href
                                    const { startLoading } = useLoading()

                                    const handleClick = () => {
                                        closeMobileMenu()
                                        if (!isActive) {
                                            startLoading()
                                        }
                                    }

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={handleClick}
                                            className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                                ? `bg-gradient-to-r ${item.color} text-white`
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                                }`}
                                        >
                                            <item.icon className="w-5 h-5 mr-3" />
                                            <div>
                                                <div className="font-medium">{item.label}</div>
                                                {item.description && (
                                                    <div className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                                                        {item.description}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    )
                                })}
                            </nav>

                            {/* Logout in Mobile */}
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                                >
                                    <LogOut className="w-5 h-5 mr-3" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
