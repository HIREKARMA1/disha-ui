'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus, BarChart3, List, Calendar, Megaphone, Inbox } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { navItemIsActive } from '@/lib/adminNav'
import { AdminPageHero } from '@/components/admin/ui/AdminPageHero'
import { adminActiveNav, adminCard } from '@/components/admin/ui/admin-theme'
import { cn } from '@/lib/utils'

const SUB_NAV_ITEMS = [
  { label: 'All Events', href: '/dashboard/admin/events', icon: List },
  { label: 'Create Event', href: '/dashboard/admin/events/create', icon: Plus },
  { label: 'Event Requests', href: '/dashboard/admin/events/requests', icon: Inbox },
  { label: 'Advertisements', href: '/dashboard/admin/events/advertisements', icon: Megaphone },
  { label: 'Statistics', href: '/dashboard/admin/events/statistics', icon: BarChart3 },
] as const

function eventSubNavIsActive(pathname: string, href: string) {
  if (href === '/dashboard/admin/events') {
    return (
      pathname === href ||
      (pathname.startsWith('/dashboard/admin/events/') &&
        !pathname.startsWith('/dashboard/admin/events/create') &&
        !pathname.startsWith('/dashboard/admin/events/statistics') &&
        !pathname.startsWith('/dashboard/admin/events/pending') &&
        !pathname.startsWith('/dashboard/admin/events/requests') &&
        !pathname.startsWith('/dashboard/admin/events/advertisements'))
    )
  }
  return navItemIsActive(pathname, href)
}

export function EventManagementHero() {
  return (
    <AdminPageHero
      title="Event Management"
      subtitle="Manage contests and advertisements on the Events portal."
      chips={[
        { label: 'Events', tone: 'blue', icon: <Calendar className="w-3.5 h-3.5" /> },
        { label: 'Advertisements', tone: 'purple', icon: <Megaphone className="w-3.5 h-3.5" /> },
        { label: 'Analytics', tone: 'teal', icon: <BarChart3 className="w-3.5 h-3.5" /> },
      ]}
      actions={
        <Link href="/dashboard/admin/events/create" className="shrink-0">
          <Button className="bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-md shadow-blue-500/20 hover:opacity-95">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </Link>
      }
    />
  )
}

export function EventManagementSubNav() {
  const pathname = usePathname()

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {SUB_NAV_ITEMS.map((item) => {
        const isActive = eventSubNavIsActive(pathname, item.href)
        const Icon = item.icon
        return (
          <motion.div key={item.href} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Link
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-[18px] border p-4 transition-all duration-200',
                isActive
                  ? cn(adminActiveNav, 'border-transparent')
                  : cn(adminCard, 'hover:border-blue-300/60 dark:hover:border-blue-500/30')
              )}
            >
              <div
                className={cn(
                  'rounded-lg p-2.5',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-gray-300'
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  'text-sm font-semibold',
                  isActive ? 'text-white' : 'text-gray-700 dark:text-gray-200'
                )}
              >
                {item.label}
              </span>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
