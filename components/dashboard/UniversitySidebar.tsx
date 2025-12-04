"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    User,
    Users,
    Briefcase,
    FileText,
    X,
    Menu,
    LogOut,
    Brain,
    Award
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import Image from 'next/image'
import { useLoading } from '@/contexts/LoadingContext'

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
        href: '/dashboard/university',
        icon: LayoutDashboard,
        description: 'Overview and analytics',
        color: 'from-blue-500 to-purple-600'
    },
    {
        label: 'Profile',
        href: '/dashboard/university/profile',
        icon: User,
        description: 'University information & settings',
        color: 'from-green-500 to-teal-600'
    },
    {
        label: 'Students',
        href: '/dashboard/university/students',
        icon: Users,
        description: 'Manage student profiles',
        color: 'from-orange-500 to-red-600'
    },
    {
        label: 'Jobs',
        href: '/dashboard/university/jobs',
        icon: Briefcase,
        description: 'Browse and manage job opportunities',
        color: 'from-purple-500 to-pink-600'
    },
    // TODO: Uncomment when practice module bugs are fixed
    {
        label: 'Practice Tests',
        href: '/dashboard/university/practice',
        icon: Brain,
        description: 'Manage practice tests & questions',
        color: 'from-rose-500 to-pink-600'
    },
    {
        label: 'Applications',
        href: '/dashboard/university/applications',
        icon: FileText,
        description: 'Track student applications',
        color: 'from-indigo-500 to-blue-600'
    },
    {
        label: 'Licenses',
        href: '/dashboard/university/licenses',
        icon: Award,
        description: 'View your licenses',
        color: 'from-yellow-500 to-amber-600'
    }
]

interface UniversitySidebarProps {
    className?: string
}

export function UniversitySidebar({ className = '' }: UniversitySidebarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [profileData, setProfileData] = useState<any>(null)
    const [isLoadingProfile, setIsLoadingProfile] = useState(false)
    const [imageError, setImageError] = useState(false)
    const pathname = usePathname()
    const { user, logout } = useAuth()

    // Fetch profile data when component mounts
    useEffect(() => {
        const fetchProfile = async () => {
            // Debug: Check what's in localStorage
            const userData = localStorage.getItem('user_data')
            const token = localStorage.getItem('access_token')
            console.log('LocalStorage user_data:', userData)
            console.log('LocalStorage token:', token ? 'exists' : 'missing')

            if (user?.user_type === 'university') {
                setIsLoadingProfile(true)
                try {
                    const data = await apiClient.getUniversityProfile()
                    console.log('University profile data:', data)

                    // Map the API response to ensure we have the right field names
                    const mappedData = {
                        ...data,
                        name: data.name || data.university_name || user?.name || 'University Name',
                        university_name: data.name || user?.name || 'University Name',
                        email: data.email || user?.email || 'university@example.edu'
                    }
                    console.log('Mapped profile data:', mappedData)
                    setProfileData(mappedData)
                } catch (error) {
                    console.error('Failed to fetch profile:', error)
                    // Don't set fallback data, let it remain null
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

    // Get display name from profile data
    const getDisplayName = () => {
        console.log('Profile data for name:', profileData)
        console.log('User data for name:', user)
        return profileData?.name || profileData?.university_name || user?.name || 'Loading...'
    }

    // Get display email
    const getDisplayEmail = () => {
        return profileData?.email || user?.email || 'Loading...'
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
                            ) : getDisplayName() !== 'University Name' ? (
                                <span className="text-white font-semibold text-lg">
                                    {getDisplayName().charAt(0).toUpperCase()}
                                </span>
                            ) : (
                                <User className="w-6 h-6 text-white" />
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
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
                                className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 w-full max-w-[25%] ${isActive
                                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </Link>
                        )
                    })}
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
                            className="absolute right-0 top-0 h-full w-80 bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-500 to-secondary-500">
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
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
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
                                        ) : getDisplayName() !== 'University Name' ? (
                                            <span className="text-white font-semibold text-sm">
                                                {getDisplayName().charAt(0).toUpperCase()}
                                            </span>
                                        ) : (
                                            <User className="w-5 h-5 text-white" />
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

                            {/* Navigation */}
                            <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
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
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
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






