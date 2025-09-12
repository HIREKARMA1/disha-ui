"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    User,
    Briefcase,
    BookOpen,
    Users,
    FileText,
    Target,
    Search,
    Library,
    X,
    Menu,
    LogOut,
    Brain,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import Image from 'next/image'
import { useLoading } from '@/contexts/LoadingContext'

// Icon mapping for features
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'Home': LayoutDashboard,
    'Briefcase': Briefcase,
    'FileText': FileText,
    'BookOpen': BookOpen,
    'Video': Search,
    'Library': Library,
    'BarChart3': Target,
    'User': User,
    'Brain': Brain,
    'Users': Users,
    'Search': Search,
    'Target': Target,
    'Lock': Lock,
}

interface StudentSidebarProps {
    className?: string
}

export function StudentSidebar({ className = '' }: StudentSidebarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [profileData, setProfileData] = useState<any>(null)
    const [isLoadingProfile, setIsLoadingProfile] = useState(false)
    const [imageError, setImageError] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const { user, logout } = useAuth()
    
    // Simple navigation items - no complex feature access control
    const navigationItems = [
        {
            id: 'dashboard',
            name: 'Dashboard',
            description: 'Overview and analytics',
            icon: 'Home',
            route: '/dashboard/student',
            order: 1
        },
        {
            id: 'profile',
            name: 'Profile',
            description: 'Personal information & settings',
            icon: 'User',
            route: '/dashboard/student/profile',
            order: 2
        },
        {
            id: 'jobs',
            name: 'Job Opportunities',
            description: 'Browse and apply for jobs',
            icon: 'Briefcase',
            route: '/dashboard/student/jobs',
            order: 3
        },
        {
            id: 'resume_builder',
            name: 'Resume Builder',
            description: 'Create professional resume',
            icon: 'FileText',
            route: '/dashboard/student/resume-builder',
            order: 4
        },
        {
            id: 'career_align',
            name: 'Career Align',
            description: 'Career guidance and planning',
            icon: 'Target',
            route: '/dashboard/student/career-align',
            order: 5
        },
        {
            id: 'practice',
            name: 'Practice',
            description: 'Practice tests and assessments',
            icon: 'Brain',
            route: '/dashboard/student/practice',
            order: 6
        },
        {
            id: 'video_search',
            name: 'Video Search',
            description: 'Educational videos and tutorials',
            icon: 'Search',
            route: '/dashboard/student/video-search',
            order: 7
        },
        {
            id: 'library',
            name: 'Library',
            description: 'Resources and materials',
            icon: 'Library',
            route: '/dashboard/student/library',
            order: 8
        },
        {
            id: 'sangha',
            name: 'Sangha',
            description: 'Community and networking',
            icon: 'Users',
            route: '/dashboard/student/sangha',
            order: 9
        }
    ]
    

    // Fetch profile data when component mounts
    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.user_type === 'student') {
                setIsLoadingProfile(true)
                try {
                    const data = await apiClient.getStudentProfile()
                    setProfileData(data)
                } catch (error) {
                    console.error('Failed to fetch profile:', error)
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

    const handleNavigation = (route: string) => {
        router.push(route)
    }


    const getIcon = (iconName?: string) => {
        if (!iconName) return LayoutDashboard
        return iconMap[iconName] || LayoutDashboard
    }

    const getItemColor = (itemId: string) => {
        // Generate consistent colors based on item id
        const colors = [
            'from-blue-500 to-purple-600',
            'from-green-500 to-teal-600',
            'from-orange-500 to-red-600',
            'from-purple-500 to-pink-600',
            'from-indigo-500 to-blue-600',
            'from-rose-500 to-pink-600',
            'from-yellow-500 to-orange-600',
            'from-emerald-500 to-green-600',
            'from-cyan-500 to-blue-600',
            'from-violet-500 to-purple-600'
        ]
        const index = itemId.length % colors.length
        return colors[index]
    }

    // Get display name from profile data
    const getDisplayName = () => {
        if (profileData?.name && profileData.name.trim()) {
            return profileData.name
        }
        return user?.name || 'Student Name'
    }

    // Get display email
    const getDisplayEmail = () => {
        return profileData?.email || user?.email || 'student@university.edu'
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
                            ) : getDisplayName() !== 'Student Name' ? (
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
                    {navigationItems.map((item) => {
                        const isActive = pathname === item.route
                        const IconComponent = getIcon(item.icon)
                        const color = getItemColor(item.id)
                        const { startLoading } = useLoading()

                        const handleClick = () => {
                            if (!isActive) {
                                startLoading()
                            }
                            handleNavigation(item.route)
                        }

                        return (
                            <button
                                key={item.id}
                                onClick={handleClick}
                                className={`group w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg ${
                                    isActive
                                        ? `bg-gradient-to-r ${color} text-white shadow-lg transform scale-105`
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                                    isActive
                                        ? 'bg-white/20 backdrop-blur-sm'
                                        : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-white/50 dark:group-hover:bg-gray-600/50'
                                }`}>
                                    <IconComponent className={`w-5 h-5 ${
                                        isActive
                                            ? 'text-white'
                                            : 'text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                                    }`} />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium">
                                        {item.name}
                                    </div>
                                    {item.description && (
                                        <div className={`text-xs mt-0.5 ${
                                            isActive
                                                ? 'text-white/90'
                                                : 'text-gray-600 dark:text-gray-300'
                                        }`}>
                                            {item.description}
                                        </div>
                                    )}
                                </div>
                            </button>
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
                    {navigationItems.slice(0, 4).map((item) => {
                        const isActive = pathname === item.route
                        const IconComponent = getIcon(item.icon)
                        const { startLoading } = useLoading()

                        const handleClick = () => {
                            if (!isActive) {
                                startLoading()
                            }
                            handleNavigation(item.route)
                        }

                        return (
                            <button
                                key={item.id}
                                onClick={handleClick}
                                className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 w-full max-w-[20%] ${
                                    isActive
                                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
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
                                        ) : getDisplayName() !== 'Student Name' ? (
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
                                {navigationItems.map((item) => {
                                    const isActive = pathname === item.route
                                    const IconComponent = getIcon(item.icon)
                                    const color = getItemColor(item.id)
                                    const { startLoading } = useLoading()

                                    const handleClick = () => {
                                        closeMobileMenu()
                                        if (!isActive) {
                                            startLoading()
                                        }
                                        handleNavigation(item.route)
                                    }

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={handleClick}
                                            className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                isActive
                                                    ? `bg-gradient-to-r ${color} text-white`
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                        >
                                            <IconComponent className="w-5 h-5 mr-3" />
                                            <div className="flex-1 text-left">
                                                <div className="font-medium">
                                                    {item.name}
                                                </div>
                                                {item.description && (
                                                    <div className={`text-xs mt-0.5 ${
                                                        isActive
                                                            ? 'text-white/90'
                                                            : 'text-gray-600 dark:text-gray-300'
                                                    }`}>
                                                        {item.description}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
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
