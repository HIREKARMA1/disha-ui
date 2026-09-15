'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Briefcase,
  Calendar,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  FileText,
  Home,
  Library,
  LayoutDashboard,
  LogIn,
  Brain,
  Search,
  Target,
  User,
  X,
  Newspaper,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAuthLoginModal } from '@/contexts/AuthLoginModalContext'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'disha-hub-sidebar-collapsed'

type NavLink = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  requiresAuth?: boolean
}

/** Public / guest nav — Unstop-like order. */
const GUEST_NAV: NavLink[] = [
  { label: 'Opportunities', href: '/', icon: Home },
  { label: 'Jobs', href: '/jobs', icon: Briefcase },
  { label: 'Events', href: '/events', icon: Calendar },
  { label: 'Mock Tests', href: '/mock-tests', icon: ClipboardList },
  { label: 'Blogs', href: '/blogs', icon: Newspaper },
]

/** Shown to guests as teaser tools — opens login when clicked. */
const GUEST_STUDENT_TOOLS: NavLink[] = [
  { label: 'Practice', href: '/dashboard/student/practice', icon: Brain },
  { label: 'Resume Builder', href: '/dashboard/student/resume-builder', icon: FileText },
  { label: 'Career Align', href: '/dashboard/student/career-align', icon: Target },
  { label: 'Library', href: '/dashboard/student/library', icon: Library },
  { label: 'Applications', href: '/dashboard/student/applications', icon: ClipboardList },
]

/** Shown after login (students on the hub). */
const STUDENT_TOOLS: NavLink[] = [
  { label: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
  { label: 'Profile', href: '/dashboard/student/profile', icon: User },
  { label: 'Campus Drive', href: '/dashboard/student/jobs', icon: Search },
  { label: 'Applications', href: '/dashboard/student/applications', icon: ClipboardList },
  { label: 'Resume Builder', href: '/dashboard/student/resume-builder', icon: FileText },
  { label: 'Career Align', href: '/dashboard/student/career-align', icon: Target },
  { label: 'Practice', href: '/dashboard/student/practice', icon: Brain },
  { label: 'Mock Tests', href: '/dashboard/student/mock-tests', icon: ClipboardList },
  { label: 'Library', href: '/dashboard/student/library', icon: Library },
  { label: 'Video Search', href: '/dashboard/student/video-search', icon: Search },
]

function NavGroup({
  title,
  items,
  collapsed,
  onNavigate,
  onItemClick,
  onAuthItemClick,
}: {
  title: string
  items: NavLink[]
  collapsed?: boolean
  onNavigate?: () => void
  /** If set, intercepts navigation (e.g. open login for guests). */
  onItemClick?: (item: NavLink) => void
  /** If set, intercepts items marked requiresAuth (e.g. Jobs / Events for guests). */
  onAuthItemClick?: (item: NavLink) => void
}) {
  const pathname = usePathname()

  return (
    <div className={cn('mb-4', collapsed && 'mb-2')}>
      {!collapsed && title && (
        <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-[#5B6684] dark:tracking-[0.06em]">
          {title}
        </p>
      )}
      <ul className="space-y-0.5">
        {items.map((item) => {
          const pathOnly = item.href.split('#')[0]
          const active =
            pathOnly === '/'
              ? pathname === '/'
              : pathname === pathOnly || pathname.startsWith(`${pathOnly}/`)
          const Icon = item.icon
          const className = cn(
            'flex w-full items-center rounded-lg text-left text-sm transition-colors',
            collapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-3 py-2',
            active
              ? "relative bg-gray-200/80 font-semibold text-gray-900 dark:bg-[rgba(0,162,229,0.12)] dark:text-[#5FCBF5] dark:before:absolute dark:before:left-[-8px] dark:before:top-1/2 dark:before:h-[18px] dark:before:w-[3px] dark:before:-translate-y-1/2 dark:before:rounded-r-sm dark:before:bg-[#00A2E5] dark:before:content-['']"
              : 'text-gray-700 hover:bg-gray-200/60 dark:text-[#93A0BD] dark:hover:bg-[#141A29] dark:hover:text-[#F4F6FA]'
          )

          const intercept =
            onItemClick || (item.requiresAuth && onAuthItemClick ? onAuthItemClick : undefined)

          if (intercept) {
            return (
              <li key={item.href}>
                <button
                  type="button"
                  title={collapsed ? item.label : undefined}
                  onClick={() => {
                    onNavigate?.()
                    intercept(item)
                  }}
                  className={className}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-80" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              </li>
            )
          }

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={className}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function HubSidebarNav({
  onNavigate,
  collapsed = false,
}: {
  onNavigate?: () => void
  collapsed?: boolean
}) {
  const { isAuthenticated, user } = useAuth()
  const { openLoginModal } = useAuthLoginModal()
  const showStudentTools = isAuthenticated && user?.user_type === 'student'

  return (
    <nav
      className={cn(
        'flex h-full flex-col overflow-y-auto py-3',
        collapsed ? 'px-1.5' : 'px-2'
      )}
    >
      <NavGroup
        title=""
        items={GUEST_NAV}
        collapsed={collapsed}
        onNavigate={onNavigate}
        onAuthItemClick={
          !isAuthenticated
            ? (item) =>
                openLoginModal({
                  redirect: item.href,
                  preferredType: 'student',
                })
            : undefined
        }
      />

      {showStudentTools ? (
        <NavGroup
          title="Student tools"
          items={STUDENT_TOOLS}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      ) : !isAuthenticated ? (
        <NavGroup
          title="For students"
          items={GUEST_STUDENT_TOOLS}
          collapsed={collapsed}
          onNavigate={onNavigate}
          onItemClick={(item) => {
            openLoginModal({
              redirect: item.href,
              preferredType: 'student',
            })
          }}
        />
      ) : null}

      {!isAuthenticated && (
        <button
          type="button"
          onClick={() => {
            onNavigate?.()
            openLoginModal()
          }}
          title={collapsed ? 'Login / Sign up' : undefined}
          className={cn(
            'mt-auto flex items-center justify-center gap-2 rounded-lg bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700',
            'dark:bg-gradient-to-br dark:from-[#24B4F0] dark:to-[#0C79A8] dark:text-[#04141C] dark:shadow-[0_4px_14px_rgba(0,162,229,0.25)] dark:hover:brightness-110 dark:hover:bg-transparent',
            collapsed ? 'mx-1 mb-2 p-2.5' : 'mx-2 px-3 py-2.5'
          )}
        >
          <LogIn className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Login / Sign up</span>}
        </button>
      )}
    </nav>
  )
}

export function HubSidebarDesktop() {
  const reduceMotion = useReducedMotion()
  const [collapsed, setCollapsed] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === '1') setCollapsed(true)
    } catch {
      /* ignore */
    }
    setHydrated(true)
  }, [])

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 224 }}
      transition={
        reduceMotion || !hydrated
          ? { duration: 0 }
          : { type: 'spring', stiffness: 320, damping: 32 }
      }
      className="sticky top-0 z-40 hidden h-screen shrink-0 border-r border-gray-200 bg-[#f4f6f8] dark:border-[#1A2233] dark:bg-[#0F1420] lg:flex lg:flex-col"
    >
      <div
        className={cn(
          'relative flex h-14 shrink-0 items-center border-b border-gray-200/80 dark:border-[#1A2233]',
          collapsed ? 'justify-center px-1' : 'justify-between gap-1 pl-3 pr-2'
        )}
      >
        {!collapsed && <BrandLogo href="/" priority className="max-w-[176px]" />}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          title={collapsed ? 'Expand menu' : 'Collapse menu'}
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500',
            'transition hover:bg-gray-200/80 hover:text-gray-800',
            'dark:hover:bg-[#141A29] dark:hover:text-[#F4F6FA]'
          )}
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4" strokeWidth={2.5} />
          ) : (
            <ChevronsLeft className="h-4 w-4" strokeWidth={2.5} />
          )}
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <HubSidebarNav collapsed={collapsed} />
      </div>
    </motion.aside>
  )
}

export function HubSidebarDrawer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <button
        type="button"
        aria-label="Close menu"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 left-0 flex w-[min(100%,18rem)] flex-col bg-[#f4f6f8] shadow-xl dark:bg-[#0F1420]">
        <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4 dark:border-[#1A2233]">
          <BrandLogo href="/" />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <HubSidebarNav onNavigate={onClose} />
      </div>
    </div>
  )
}
