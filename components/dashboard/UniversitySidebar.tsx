'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    User,
    Users,
    Briefcase,
    FileText,
    X,
    LogOut,
    Brain,
    BarChart3,
    Award,
    Settings,
    MoreHorizontal,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import Image from 'next/image'
import { useLoading } from '@/contexts/LoadingContext'
import { uniActiveNav, uniBadgeUniversity, uniSidebar } from '@/components/university/ui/university-theme'
import { cn } from '@/lib/utils'

interface NavItem {
    label: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    description?: string
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard/university',
        icon: LayoutDashboard,
        description: 'Overview and analytics',
    },
    {
        label: 'Profile',
        href: '/dashboard/university/profile',
        icon: User,
        description: 'University information & settings',
    },
    {
        label: 'Student Management',
        href: '/dashboard/university/students',
        icon: Users,
        description: 'Manage student profiles',
    },
    {
        label: 'Jobs',
        href: '/dashboard/university/jobs',
        icon: Briefcase,
        description: 'Browse and manage job opportunities',
    },
    {
        label: 'Practice Tests',
        href: '/dashboard/university/practice',
        icon: Brain,
        description: 'Manage practice tests & questions',
    },
    {
        label: 'Applications',
        href: '/dashboard/university/applications',
        icon: FileText,
        description: 'Track student applications',
    },
    {
        label: 'Analytics',
        href: '/dashboard/university/analytics',
        icon: BarChart3,
        description: 'Placement insights & reports',
    },
    {
        label: 'Licenses',
        href: '/dashboard/university/licenses',
        icon: Award,
        description: 'View and manage student licenses',
    },
    {
        label: 'Settings',
        href: '/dashboard/university/settings',
        icon: Settings,
        description: 'Account settings',
    },
]

interface UniversitySidebarProps {
    className?: string
}

export function UniversitySidebar({ className = '' }: UniversitySidebarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [profileData, setProfileData] = useState<any>(null)
    const [imageError, setImageError] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [isMobileViewport, setIsMobileViewport] = useState(false)
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const desktopNavRef = useRef<HTMLDivElement>(null)
    const { startLoading } = useLoading()

    useEffect(() => {
        setMounted(true)
        const mq = window.matchMedia('(max-width: 1023px)')
        const sync = () => setIsMobileViewport(mq.matches)
        sync()
        mq.addEventListener('change', sync)
        return () => mq.removeEventListener('change', sync)
    }, [])

    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.user_type === 'university') {
                try {
                    const data = await apiClient.getUniversityProfile()
                    const mappedData = {
                        ...data,
                        name: data.name || data.university_name || user?.name || 'University',
                        university_name: data.name || user?.name || 'University',
                        email: data.email || user?.email || 'university@example.edu',
                    }
                    setProfileData(mappedData)
                } catch (error) {
                    console.error('Failed to fetch profile:', error)
                }
            }
        }
        fetchProfile()
    }, [user])

    useEffect(() => {
        if (!desktopNavRef.current) return
        const activeItem = desktopNavRef.current.querySelector('[data-sidebar-item="active"]')
        if (activeItem instanceof HTMLElement) {
            activeItem.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
        }
    }, [pathname])

    useEffect(() => {
        const openMenu = () => setIsMobileMenuOpen(true)
        window.addEventListener('university-open-menu', openMenu)
        return () => window.removeEventListener('university-open-menu', openMenu)
    }, [])

    const closeMobileMenu = () => setIsMobileMenuOpen(false)

    const handleLogout = () => {
        logout()
        closeMobileMenu()
    }

    const getDisplayName = () =>
        profileData?.name || profileData?.university_name || user?.name || 'University'
    const getDisplayEmail = () => profileData?.email || user?.email || 'university@example.edu'
    const getProfilePicture = () => profileData?.profile_picture || null

    const isItemActive = (href: string) => {
        if (href === '/dashboard/university') return pathname === href
        return pathname === href || pathname?.startsWith(`${href}/`)
    }

    const NavLink = ({
        item,
        onNavigate,
        compact = false,
    }: {
        item: NavItem
        onNavigate?: () => void
        compact?: boolean
    }) => {
        const active = isItemActive(item.href)
        const handleClick = () => {
            onNavigate?.()
            if (!active) startLoading()
        }

        return (
            <Link
                href={item.href}
                onClick={handleClick}
                data-sidebar-item={active ? 'active' : 'inactive'}
                className={cn(
                    'group flex items-center rounded-xl text-sm font-medium transition-all duration-300',
                    compact ? 'px-3 py-3' : 'px-3.5 py-3',
                    active
                        ? uniActiveNav
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-white'
                )}
            >
                <div
                    className={cn(
                        'p-2 rounded-lg mr-3 transition-all duration-300',
                        active
                            ? 'bg-white/20'
                            : 'bg-gray-100 dark:bg-white/[0.06] group-hover:bg-white/60 dark:group-hover:bg-white/10'
                    )}
                >
                    <item.icon
                        className={cn(
                            'w-5 h-5',
                            active
                                ? 'text-white'
                                : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                        )}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{item.label}</div>
                    {item.description && (
                        <div
                            className={cn(
                                'text-[11px] mt-0.5 truncate',
                                active ? 'text-white/85' : 'text-gray-500 dark:text-gray-400'
                            )}
                        >
                            {item.description}
                        </div>
                    )}
                </div>
            </Link>
        )
    }

    const ProfileBlock = ({ mobile = false }: { mobile?: boolean }) => (
        <div className={cn('border-b border-gray-200 dark:border-white/[0.06]', mobile ? 'p-4' : 'p-5')}>
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center overflow-hidden ring-2 ring-blue-500/30 flex-shrink-0">
                    {getProfilePicture() && !imageError ? (
                        <Image
                            src={getProfilePicture()}
                            alt="University Logo"
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <span className="text-white font-bold text-lg">
                            {getDisplayName().charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {getDisplayName()}
                        </p>
                        <span className={uniBadgeUniversity}>University</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {getDisplayEmail()}
                    </p>
                </div>
            </div>
        </div>
    )

    return (
        <>
            <div
                className={cn(
                    'hidden lg:flex flex-col w-64 fixed top-16 left-0 h-[calc(100vh-4rem)] z-40',
                    uniSidebar,
                    className
                )}
            >
                <ProfileBlock />

                <nav ref={desktopNavRef} className="flex-1 p-3 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink key={item.href} item={item} />
                    ))}
                </nav>

                <div className="p-3 border-t border-gray-200 dark:border-white/[0.06]">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-3.5 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300 group"
                    >
                        <div className="p-2 rounded-lg mr-3 bg-red-100 dark:bg-red-500/15 group-hover:bg-red-200 dark:group-hover:bg-red-500/25 transition-colors">
                            <LogOut className="w-5 h-5" />
                        </div>
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {mounted &&
                isMobileViewport &&
                createPortal(
                    <nav
                        aria-label="University mobile navigation"
                        style={{
                            position: 'fixed',
                            left: 12,
                            right: 12,
                            bottom: 12,
                            zIndex: 9999,
                            touchAction: 'none',
                        }}
                    >
                        <div
                            className="rounded-2xl border border-white/10 bg-[#0B1220]/92 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.55)]"
                            style={{ paddingBottom: 'max(4px, env(safe-area-inset-bottom))' }}
                        >
                            <div className="flex justify-around items-center px-1 py-2">
                                {(
                                    [
                                        { label: 'Dashboard', href: '/dashboard/university', icon: LayoutDashboard },
                                        { label: 'Students', href: '/dashboard/university/students', icon: Users },
                                        { label: 'Jobs', href: '/dashboard/university/jobs', icon: Briefcase },
                                        { label: 'Apps', href: '/dashboard/university/applications', icon: FileText },
                                    ] as const
                                ).map((item) => {
                                    const active = isItemActive(item.href)
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => {
                                                if (!active) startLoading()
                                            }}
                                            className={cn(
                                                'relative flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1 transition-colors',
                                                active ? 'text-blue-400' : 'text-gray-400'
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'flex h-9 w-9 items-center justify-center rounded-xl transition-all',
                                                    active &&
                                                        'bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-md shadow-blue-500/35'
                                                )}
                                            >
                                                <item.icon className="h-[18px] w-[18px]" />
                                            </span>
                                            <span className="max-w-full truncate text-[10px] font-medium leading-tight">
                                                {item.label}
                                            </span>
                                            {active && (
                                                <span className="absolute -bottom-0.5 w-5 h-0.5 rounded-full bg-blue-500" />
                                            )}
                                        </Link>
                                    )
                                })}
                                <button
                                    type="button"
                                    onClick={() => setIsMobileMenuOpen(true)}
                                    className="relative flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1 text-gray-400"
                                >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl">
                                        <MoreHorizontal className="h-[18px] w-[18px]" />
                                    </span>
                                    <span className="text-[10px] font-medium leading-tight">More</span>
                                </button>
                            </div>
                        </div>
                    </nav>,
                    document.body
                )}

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-[10000] backdrop-blur-sm"
                        style={{ position: 'fixed' }}
                        onClick={closeMobileMenu}
                    >
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                            className={cn('absolute right-0 top-0 h-full w-80 shadow-2xl flex flex-col', uniSidebar)}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-white/[0.06] bg-gradient-to-r from-blue-500 to-violet-600 flex-shrink-0">
                                <h2 className="text-lg font-semibold text-white">Menu</h2>
                                <button
                                    onClick={closeMobileMenu}
                                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            <ProfileBlock mobile />

                            <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-0">
                                {navItems.map((item) => (
                                    <NavLink key={item.href} item={item} onNavigate={closeMobileMenu} compact />
                                ))}
                            </nav>

                            <div className="p-3 border-t border-gray-200 dark:border-white/[0.06] flex-shrink-0">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center px-3 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
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
