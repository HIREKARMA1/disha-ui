'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    User,
    Users,
    Building2,
    Settings,
    BarChart3,
    Activity,
    Calendar,
    FileText,
    X,
    LogOut,
    Eye,
    Database,
    Briefcase,
    Brain,
    Library,
    Mail,
    MessageCircle,
    GraduationCap,
    MoreHorizontal,
    KeyRound,
    Shield,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Image from 'next/image'
import { useLoading } from '@/contexts/LoadingContext'
import { adminProfileService } from '@/services/adminProfileService'
import { navItemIsActive } from '@/lib/adminNav'
import { adminActiveNav, adminBadgeAdmin, adminSidebar } from '@/components/admin/ui/admin-theme'
import { cn } from '@/lib/utils'

interface NavItem {
    label: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    description?: string
}

interface NavSection {
    title: string
    items: NavItem[]
}

const navSections: NavSection[] = [
    {
        title: 'Main',
        items: [
            {
                label: 'Dashboard',
                href: '/dashboard/admin',
                icon: LayoutDashboard,
                description: 'Overview & insights',
            },
            {
                label: 'Profile',
                href: '/dashboard/admin/profile',
                icon: User,
                description: 'Admin account',
            },
            {
                label: 'Analytics',
                href: '/dashboard/admin/analytics',
                icon: BarChart3,
                description: 'Platform insights',
            },
        ],
    },
    {
        title: 'Management',
        items: [
            {
                label: 'User Management',
                href: '/dashboard/admin/users',
                icon: Users,
                description: 'Manage all users',
            },
            {
                label: 'Students',
                href: '/dashboard/admin/students',
                icon: GraduationCap,
                description: 'Import, export & onboard',
            },
            {
                label: 'Universities',
                href: '/dashboard/admin/universities',
                icon: Building2,
                description: 'Manage universities',
            },
            {
                label: 'Corporates',
                href: '/dashboard/admin/corporates',
                icon: Building2,
                description: 'Manage corporates',
            },
            {
                label: 'Jobs',
                href: '/dashboard/admin/jobs',
                icon: Briefcase,
                description: 'Manage job postings',
            },
            {
                label: 'Events',
                href: '/dashboard/admin/events',
                icon: Calendar,
                description: 'Manage events',
            },
            {
                label: 'Practice Tests',
                href: '/dashboard/admin/practice',
                icon: Brain,
                description: 'Tests & questions',
            },
            {
                label: 'Assessments',
                href: '/dashboard/admin/assessments',
                icon: FileText,
                description: 'Manage assessments',
            },
            {
                label: 'Coding Questions',
                href: '/dashboard/admin/coding-questions',
                icon: Brain,
                description: 'Coding question bank',
            },
            {
                label: 'Lookup tables',
                href: '/dashboard/admin/lookups',
                icon: Library,
                description: 'Reference data',
            },
            {
                label: 'Licenses',
                href: '/dashboard/admin/licenses',
                icon: KeyRound,
                description: 'License requests',
            },
        ],
    },
    {
        title: 'Communications',
        items: [
            {
                label: 'Bulk Email',
                href: '/dashboard/admin/bulk-email',
                icon: Mail,
                description: 'Send bulk emails',
            },
            {
                label: 'Bulk WhatsApp',
                href: '/dashboard/admin/bulk-whatsapp',
                icon: MessageCircle,
                description: 'Send WhatsApp messages',
            },
        ],
    },
    {
        title: 'System',
        items: [
            {
                label: 'System Monitor',
                href: '/dashboard/admin/monitor',
                icon: Activity,
                description: 'System health',
            },
            {
                label: 'Reports',
                href: '/dashboard/admin/reports',
                icon: FileText,
                description: 'Generate reports',
            },
            {
                label: 'Audit Logs',
                href: '/dashboard/admin/audit',
                icon: Eye,
                description: 'View audit logs',
            },
            {
                label: 'Database',
                href: '/dashboard/admin/database',
                icon: Database,
                description: 'Database management',
            },
            {
                label: 'Settings',
                href: '/dashboard/admin/settings',
                icon: Settings,
                description: 'System configuration',
            },
        ],
    },
]

const allNavItems = navSections.flatMap((s) => s.items)

const mobileQuickLinks: NavItem[] = [
    allNavItems.find((i) => i.href === '/dashboard/admin')!,
    allNavItems.find((i) => i.href === '/dashboard/admin/students')!,
    allNavItems.find((i) => i.href === '/dashboard/admin/jobs')!,
    allNavItems.find((i) => i.href === '/dashboard/admin/events')!,
]

interface AdminSidebarProps {
    className?: string
}

export function AdminSidebar({ className = '' }: AdminSidebarProps) {
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
            if (user?.user_type === 'admin') {
                try {
                    const data = await adminProfileService.getProfile()
                    setProfileData(data)
                } catch (error) {
                    console.error('Failed to fetch profile:', error)
                    setProfileData(null)
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
        window.addEventListener('admin-open-menu', openMenu)
        return () => window.removeEventListener('admin-open-menu', openMenu)
    }, [])

    const closeMobileMenu = () => setIsMobileMenuOpen(false)

    const handleLogout = () => {
        logout()
        closeMobileMenu()
    }

    const getDisplayName = () => {
        if (profileData?.name && profileData.name.trim()) return profileData.name
        if (user?.name && user.name.trim() && !user.name.includes('@')) return user.name
        return 'Admin'
    }

    const getDisplayEmail = () => profileData?.email || user?.email || 'admin@hirekarma.com'
    const getProfilePicture = () => profileData?.profile_picture || null

    const NavLink = ({
        item,
        onNavigate,
        compact = false,
    }: {
        item: NavItem
        onNavigate?: () => void
        compact?: boolean
    }) => {
        const active = navItemIsActive(pathname || '', item.href)
        const handleClick = () => {
            onNavigate?.()
            if (!active) startLoading()
        }

        return (
            <Link
                key={item.href}
                href={item.href}
                onClick={handleClick}
                data-sidebar-item={active ? 'active' : 'inactive'}
                className={cn(
                    'group flex items-center rounded-xl text-sm font-medium transition-all duration-300',
                    compact ? 'px-3 py-3' : 'px-3.5 py-3',
                    active
                        ? adminActiveNav
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

    const NavSections = ({ onNavigate, compact = false }: { onNavigate?: () => void; compact?: boolean }) => (
        <>
            {navSections.map((section) => (
                <div key={section.title} className="mb-3">
                    <p className="px-3.5 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        {section.title}
                    </p>
                    <div className="space-y-1">
                        {section.items.map((item) => (
                            <NavLink key={item.href} item={item} onNavigate={onNavigate} compact={compact} />
                        ))}
                    </div>
                </div>
            ))}
        </>
    )

    const ProfileBlock = ({ mobile = false }: { mobile?: boolean }) => (
        <div
            className={cn(
                'border-b border-gray-200 dark:border-white/[0.06]',
                mobile ? 'p-4' : 'p-5'
            )}
        >
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center overflow-hidden ring-2 ring-blue-500/30 flex-shrink-0">
                    {getProfilePicture() && !imageError ? (
                        <Image
                            src={getProfilePicture()}
                            alt="Profile"
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
                        <span className={adminBadgeAdmin}>Admin</span>
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
            {/* Desktop Sidebar */}
            <div
                className={cn(
                    'hidden lg:flex flex-col w-64 fixed top-16 left-0 h-[calc(100vh-4rem)] z-40',
                    adminSidebar,
                    className
                )}
            >
                <ProfileBlock />

                <nav ref={desktopNavRef} className="flex-1 p-3 overflow-y-auto">
                    <NavSections />
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

            {/* Mobile Bottom Navigation */}
            {mounted &&
                isMobileViewport &&
                createPortal(
                    <nav
                        aria-label="Admin mobile navigation"
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
                                {mobileQuickLinks.map((item) => {
                                    const active = navItemIsActive(pathname || '', item.href)
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
                                                {item.label.split(' ')[0]}
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

            {/* Mobile Menu Overlay */}
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
                            className={cn('absolute right-0 top-0 h-full w-80 shadow-2xl flex flex-col', adminSidebar)}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-white/[0.06] bg-gradient-to-r from-blue-500 to-violet-600 flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-white" />
                                    <h2 className="text-lg font-semibold text-white">Admin Menu</h2>
                                </div>
                                <button
                                    onClick={closeMobileMenu}
                                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                                    aria-label="Close menu"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            <ProfileBlock mobile />

                            <nav className="flex-1 overflow-y-auto p-3 min-h-0">
                                <NavSections onNavigate={closeMobileMenu} compact />
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
