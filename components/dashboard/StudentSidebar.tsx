"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    User,
    Briefcase,
    FileText,
    Target,
    Search,
    Library,
    X,
    LogOut,
    Brain,
    ClipboardList,
    Calendar,
    MoreHorizontal,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import Image from 'next/image'
import { useLoading } from '@/contexts/LoadingContext'
import SSOService from '@/services/ssoService'
import { cn } from '@/lib/utils'
import { MobileBottomNav, MobileBottomNavAction } from '@/components/ui/MobileBottomNav'

interface NavItem {
    label: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    description?: string
    isSSO?: boolean
    mobilePrimary?: boolean
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard/student',
        icon: LayoutDashboard,
        description: 'Overview & Analytics',
        mobilePrimary: true,
    },
    {
        label: 'Profile',
        href: '/dashboard/student/profile',
        icon: User,
        description: 'Personal Information',
        mobilePrimary: true,
    },
    {
        label: 'Live Jobs',
        href: '/jobs',
        icon: Briefcase,
        description: 'Find & apply to jobs',
        mobilePrimary: true,
    },
    {
        label: 'Campus Drive',
        href: '/dashboard/student/jobs',
        icon: Search,
        description: 'Campus opportunities',
    },
    {
        label: 'Applications',
        href: '/dashboard/student/applications',
        icon: ClipboardList,
        description: 'Track your applications',
        mobilePrimary: true,
    },
    {
        label: 'Resume Builder',
        href: '/dashboard/student/resume-builder',
        icon: FileText,
        description: 'Create professional resume',
    },
    {
        label: 'Career Align',
        href: '/dashboard/student/career-align',
        icon: Target,
        description: 'Guidance & roadmap',
    },
    {
        label: 'Practice',
        href: '/dashboard/student/practice',
        icon: Brain,
        description: 'Tests & assessments',
    },
    {
        label: 'Events',
        href: '/events',
        icon: Calendar,
        description: 'Workshops & events',
    },
    {
        label: 'Library',
        href: '/dashboard/student/library',
        icon: Library,
        description: 'Resources & materials',
    },
    {
        label: 'Video Search',
        href: '/dashboard/student/video-search',
        icon: Search,
        description: 'Learning videos',
    },
]

interface StudentSidebarProps {
    className?: string
}

export function StudentSidebar({ className = '' }: StudentSidebarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [profileData, setProfileData] = useState<any>(null)
    const [imageError, setImageError] = useState(false)
    const pathname = usePathname()
    const { user, getToken, logout } = useAuth()
    const desktopNavRef = useRef<HTMLDivElement>(null)
    const { startLoading } = useLoading()

    const fetchProfile = useCallback(async () => {
        if (user?.user_type === 'student') {
            try {
                const data = await apiClient.getStudentProfile()
                setProfileData(data)
                setImageError(false)
            } catch (error) {
                console.error('Failed to fetch profile:', error)
            }
        }
    }, [user])

    useEffect(() => {
        fetchProfile()
    }, [fetchProfile])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleProfileUpdate = () => {
                void fetchProfile()
            }
            window.addEventListener('profile-updated', handleProfileUpdate)
            return () => {
                window.removeEventListener('profile-updated', handleProfileUpdate)
            }
        }
    }, [fetchProfile])

    const closeMobileMenu = () => setIsMobileMenuOpen(false)

    const handleLogout = () => {
        logout()
        closeMobileMenu()
    }

    useEffect(() => {
        if (!desktopNavRef.current) return
        const activeItem = desktopNavRef.current.querySelector('[data-sidebar-item="active"]')
        if (activeItem && 'scrollIntoView' in activeItem) {
            activeItem.scrollIntoView({
                block: 'nearest',
                inline: 'nearest',
                behavior: 'smooth',
            })
        }
    }, [pathname])

    const getDisplayName = () => {
        if (profileData?.name && profileData.name.trim()) return profileData.name
        return user?.name || 'Student'
    }

    const getDisplayEmail = () => profileData?.email || user?.email || 'student@university.edu'
    const getProfilePicture = () => profileData?.profile_picture || null

    const shouldShowCampusDrive = () => {
        if (!profileData) return true
        if (typeof profileData.license_status_reason === 'string') {
            const reason = profileData.license_status_reason.toLowerCase()
            if (reason.includes('university not found')) return false
        }
        if (!profileData.university_id) return false
        return true
    }

    const filteredNavItems = navItems.filter((item) => {
        if (item.label === 'Campus Drive') return shouldShowCampusDrive()
        return true
    })

    const mobilePrimaryItems = filteredNavItems.filter((item) => item.mobilePrimary)

    const handleSSORedirect = async (item: NavItem) => {
        const token = getToken()
        if (!token) {
            alert('Please log in to access Sangha Community')
            return
        }
        try {
            const ssoService = new SSOService(token)
            await ssoService.redirectToSangha()
        } catch (error) {
            console.error('SSO Error:', error)
            alert('Failed to connect to Sangha Community. Please try again.')
        }
    }

    const isItemActive = (href: string) => {
        if (href === '/dashboard/student') return pathname === href
        return pathname === href || pathname.startsWith(href + '/')
    }

    const navClass = (active: boolean) =>
        cn(
            'group flex items-start gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200',
            active
                ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/25'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
        )

    const renderAvatar = (size: 'sm' | 'md' = 'md') => {
        const dim = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11'
        const img = size === 'sm' ? 36 : 44
        return (
            <div className={cn(dim, 'rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center border-2 border-white/20 overflow-hidden shrink-0')}>
                {getProfilePicture() && !imageError ? (
                    <Image
                        src={getProfilePicture()}
                        alt="Profile"
                        width={img}
                        height={img}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <span className="text-white font-semibold text-sm">
                        {getDisplayName().charAt(0).toUpperCase()}
                    </span>
                )}
            </div>
        )
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    'student-sidebar hidden lg:flex flex-col w-64 bg-white dark:bg-[#0b0e14] border-r border-gray-200/80 dark:border-white/10 fixed top-16 left-0 h-[calc(100vh-4rem)] z-40',
                    className
                )}
            >
                <div className="p-4 border-b border-gray-200/80 dark:border-white/10">
                    <div className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-gray-50 dark:bg-[#151b2b] p-3.5">
                        <div className="flex items-center gap-3">
                            {renderAvatar('md')}
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{getDisplayName()}</p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{getDisplayEmail()}</p>
                                <span className="mt-1 inline-flex px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-violet-500/15 text-violet-400">
                                    Student
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <nav ref={desktopNavRef} className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {filteredNavItems.map((item) => {
                        const active = isItemActive(item.href)
                        const handleClick = (e: React.MouseEvent) => {
                            if (item.isSSO) {
                                e.preventDefault()
                                handleSSORedirect(item)
                            } else if (!active) {
                                startLoading()
                            }
                        }

                        if (item.isSSO) {
                            return (
                                <button
                                    key={item.href}
                                    onClick={handleClick}
                                    className={cn(navClass(active), 'w-full text-left')}
                                    data-sidebar-item={active ? 'active' : 'inactive'}
                                >
                                    <item.icon className={cn('w-5 h-5 shrink-0 mt-0.5', active ? 'text-white' : '')} />
                                    <span className="min-w-0 flex flex-col items-start">
                                        <span className={cn('font-semibold leading-tight', active && 'text-white')}>{item.label}</span>
                                        {item.description && (
                                            <span className={cn('text-[10px] leading-tight mt-0.5', active ? 'text-white/80' : 'text-gray-500 dark:text-gray-500')}>
                                                {item.description}
                                            </span>
                                        )}
                                    </span>
                                </button>
                            )
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={handleClick}
                                data-sidebar-item={active ? 'active' : 'inactive'}
                                className={navClass(active)}
                            >
                                <item.icon className={cn('w-5 h-5 shrink-0 mt-0.5', active ? 'text-white' : '')} />
                                <span className="min-w-0 flex flex-col items-start">
                                    <span className={cn('font-semibold leading-tight', active && 'text-white')}>{item.label}</span>
                                    {item.description && (
                                        <span className={cn('text-[10px] leading-tight mt-0.5', active ? 'text-white/80' : 'text-gray-500 dark:text-gray-500')}>
                                            {item.description}
                                        </span>
                                    )}
                                </span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-3 border-t border-gray-200/80 dark:border-gray-700/70">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav
                aria-label="Student mobile navigation"
                items={mobilePrimaryItems.map((item) => ({
                    href: item.href,
                    label: item.label,
                    shortLabel:
                        item.label === 'Applications'
                            ? 'Apps'
                            : item.label === 'Live Jobs'
                              ? 'Jobs'
                              : item.label.split(' ')[0],
                    icon: item.icon,
                    active: isItemActive(item.href),
                    onNavigate: startLoading,
                }))}
                trailing={
                    <MobileBottomNavAction
                        label="More"
                        icon={MoreHorizontal}
                        onClick={() => setIsMobileMenuOpen(true)}
                    />
                }
            />

            {/* Mobile More Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 bg-black/50 z-50"
                        onClick={closeMobileMenu}
                    >
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                            className="absolute right-0 top-0 h-full w-[min(20rem,88vw)] bg-white dark:bg-gray-900 shadow-xl flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-500 to-secondary-500">
                                <h2 className="text-base font-semibold text-white">Menu</h2>
                                <button
                                    onClick={closeMobileMenu}
                                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                                    aria-label="Close menu"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center overflow-hidden">
                                        {getProfilePicture() && !imageError ? (
                                            <Image
                                                src={getProfilePicture()}
                                                alt="Profile"
                                                width={40}
                                                height={40}
                                                className="w-full h-full object-cover"
                                                onError={() => setImageError(true)}
                                            />
                                        ) : (
                                            <span className="text-white font-semibold text-sm">
                                                {getDisplayName().charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {getDisplayName()}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {getDisplayEmail()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                                {filteredNavItems.map((item) => {
                                    const active = isItemActive(item.href)
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => {
                                                closeMobileMenu()
                                                if (!active) startLoading()
                                            }}
                                            className={navClass(active)}
                                        >
                                            <item.icon className="w-5 h-5 shrink-0" />
                                            <span>{item.label}</span>
                                        </Link>
                                    )
                                })}
                            </nav>

                            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
