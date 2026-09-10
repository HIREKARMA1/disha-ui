'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import Image from 'next/image'
import { useLoading } from '@/contexts/LoadingContext'
import SSOService from '@/services/ssoService'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
  isSSO?: boolean
  mobilePrimary?: boolean
  group?: 'main' | 'opportunities' | 'tools'
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard/student',
    icon: LayoutDashboard,
    description: 'Overview & Analytics',
    mobilePrimary: true,
    group: 'main',
  },
  {
    label: 'Profile',
    href: '/dashboard/student/profile',
    icon: User,
    description: 'Personal Information',
    mobilePrimary: true,
    group: 'tools',
  },
  {
    label: 'Live Jobs',
    href: '/jobs',
    icon: Briefcase,
    description: 'Find & apply to jobs',
    mobilePrimary: true,
    group: 'opportunities',
  },
  {
    label: 'Campus Drive',
    href: '/dashboard/student/jobs',
    icon: Search,
    description: 'Campus opportunities',
    group: 'opportunities',
  },
  {
    label: 'Applications',
    href: '/dashboard/student/applications',
    icon: ClipboardList,
    description: 'Track your applications',
    mobilePrimary: true,
    group: 'opportunities',
  },
  {
    label: 'Events',
    href: '/events',
    icon: Calendar,
    description: 'Workshops & events',
    group: 'opportunities',
  },
  {
    label: 'Resume Builder',
    href: '/dashboard/student/resume-builder',
    icon: FileText,
    description: 'Create professional resume',
    group: 'tools',
  },
  {
    label: 'Career Align',
    href: '/dashboard/student/career-align',
    icon: Target,
    description: 'Guidance & roadmap',
    group: 'tools',
  },
  {
    label: 'Practice',
    href: '/dashboard/student/practice',
    icon: Brain,
    description: 'Tests & assessments',
    group: 'tools',
  },
  {
    label: 'Mock Tests',
    href: '/dashboard/student/mock-tests',
    icon: ClipboardList,
    description: 'Published mock tests',
    group: 'tools',
  },
  {
    label: 'Library',
    href: '/dashboard/student/library',
    icon: Library,
    description: 'Resources & materials',
    group: 'tools',
  },
  {
    label: 'Video Search',
    href: '/dashboard/student/video-search',
    icon: Search,
    description: 'Learning videos',
    group: 'tools',
  },
]

interface StudentSidebarProps {
  className?: string
  /** Controlled mobile drawer (Hub-style). When provided with onClose, parent owns open state. */
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function StudentSidebar({
  className = '',
  mobileOpen,
  onMobileClose,
}: StudentSidebarProps) {
  const [internalMobileOpen, setInternalMobileOpen] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const [imageError, setImageError] = useState(false)
  const pathname = usePathname()
  const { user, getToken, logout } = useAuth()
  const desktopNavRef = useRef<HTMLDivElement>(null)
  const { startLoading } = useLoading()

  const isControlled = typeof mobileOpen === 'boolean'
  const isMobileMenuOpen = isControlled ? mobileOpen : internalMobileOpen
  const closeMobileMenu = () => {
    if (isControlled) onMobileClose?.()
    else setInternalMobileOpen(false)
  }

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

  const shouldShowCampusDrive = () => true

  const filteredNavItems = navItems.filter((item) => {
    if (item.label === 'Campus Drive') return shouldShowCampusDrive()
    return true
  })

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
      'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
      active
        ? 'bg-gray-200/80 font-semibold text-gray-900 dark:bg-gray-800 dark:text-white'
        : 'text-gray-700 hover:bg-gray-200/60 dark:text-gray-300 dark:hover:bg-gray-800'
    )

  const renderAvatar = (size: 'sm' | 'md' = 'md') => {
    const dim = size === 'sm' ? 'w-9 h-9' : 'w-10 h-10'
    const img = size === 'sm' ? 36 : 40
    return (
      <div
        className={cn(
          dim,
          'flex shrink-0 items-center justify-center overflow-hidden rounded-full',
          'bg-primary-600 ring-1 ring-black/10'
        )}
      >
        {getProfilePicture() && !imageError ? (
          <Image
            src={getProfilePicture()}
            alt="Profile"
            width={img}
            height={img}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-sm font-semibold text-white">
            {getDisplayName().charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    )
  }

  const renderNavGroups = (onNavigate?: () => void) => {
    const groups: { key: string; title: string; items: NavItem[] }[] = [
      {
        key: 'main',
        title: '',
        items: filteredNavItems.filter((i) => i.group === 'main'),
      },
      {
        key: 'opportunities',
        title: 'Opportunities',
        items: filteredNavItems.filter((i) => i.group === 'opportunities'),
      },
      {
        key: 'tools',
        title: 'For students',
        items: filteredNavItems.filter((i) => i.group === 'tools'),
      },
    ]

    return (
      <div className="space-y-1">
        {groups.map((group) => (
          <div key={group.key} className="mb-4">
            {group.title ? (
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {group.title}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isItemActive(item.href)
                const handleClick = (e: React.MouseEvent) => {
                  if (item.isSSO) {
                    e.preventDefault()
                    handleSSORedirect(item)
                  } else if (!active) {
                    startLoading()
                  }
                  onNavigate?.()
                }

                if (item.isSSO) {
                  return (
                    <li key={item.href}>
                      <button
                        type="button"
                        onClick={handleClick}
                        className={navClass(active)}
                        data-sidebar-item={active ? 'active' : 'inactive'}
                      >
                        <item.icon className="h-4 w-4 shrink-0 opacity-80" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </li>
                  )
                }

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={handleClick}
                      data-sidebar-item={active ? 'active' : 'inactive'}
                      className={navClass(active)}
                    >
                      <item.icon className="h-4 w-4 shrink-0 opacity-80" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    )
  }

  const sidebarBody = (opts?: { onNavigate?: () => void; showBrand?: boolean }) => (
    <>
      {opts?.showBrand !== false && (
        <div className="flex h-14 shrink-0 items-center justify-between gap-1 border-b border-gray-200/80 px-3 dark:border-gray-800">
          <BrandLogo href="/" priority className="max-w-[148px]" />
        </div>
      )}

      <div className="border-b border-gray-200/80 p-3 dark:border-gray-800">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900">
          {renderAvatar('md')}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {getDisplayName()}
            </p>
            <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
              {getDisplayEmail()}
            </p>
            <span className="mt-1 inline-flex rounded-md bg-primary-50 px-1.5 py-0.5 text-[10px] font-semibold text-primary-700 dark:bg-primary-950/50 dark:text-primary-300">
              Student
            </span>
          </div>
        </div>
      </div>

      <nav ref={desktopNavRef} className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        {renderNavGroups(opts?.onNavigate)}
      </nav>

      <div className="border-t border-gray-200/80 p-3 dark:border-gray-800">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar — Hub-style full-height sticky rail */}
      <aside
        className={cn(
          'student-sidebar sticky top-0 z-40 hidden h-screen w-56 shrink-0 flex-col',
          'border-r border-gray-200 bg-[#f4f6f8] dark:border-gray-800 dark:bg-gray-950',
          'lg:flex',
          className
        )}
      >
        {sidebarBody()}
      </aside>

      {/* Mobile drawer — Hub-style left slide-in */}
      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
            onClick={closeMobileMenu}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(100%,18rem)] flex-col bg-[#f4f6f8] shadow-xl dark:bg-gray-950">
            <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
              <BrandLogo href="/" />
              <button
                type="button"
                onClick={closeMobileMenu}
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {sidebarBody({ onNavigate: closeMobileMenu, showBrand: false })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
