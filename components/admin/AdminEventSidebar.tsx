"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Plus, List, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const sidebarItems = [
  { label: 'Dashboard', href: '/dashboard/admin', icon: Calendar },
  { label: 'Events', href: '/dashboard/admin/events', icon: List },
  { label: 'Create Event', href: '/dashboard/admin/events/create', icon: Plus },
  { label: 'Statistics', href: '/dashboard/admin/events/statistics', icon: BarChart3 },
]

interface AdminEventSidebarProps {
  className?: string
  onNavigate?: () => void
}

export function AdminEventSidebar({ className, onNavigate }: AdminEventSidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard/admin') {
      return pathname === href
    }
    if (href === '/dashboard/admin/events') {
      return pathname === href || (pathname.startsWith('/dashboard/admin/events/') &&
        !pathname.includes('/create') && !pathname.includes('/statistics') && !pathname.includes('/pending'))
    }
    return pathname.startsWith(href)
  }

  return (
    <div
      className={cn(
        'flex h-full w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
        className
      )}
    >
      <div className="shrink-0 border-b border-gray-200 p-6 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 p-2">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Event Management</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage contests & events</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
              'hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-primary-900/20 dark:hover:text-primary-300',
              isActive(item.href) && 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
