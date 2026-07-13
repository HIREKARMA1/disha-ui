"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus, BarChart3, List } from 'lucide-react'
import { motion } from 'framer-motion'
import { navItemIsActive } from '@/lib/adminNav'

const SUB_NAV_ITEMS = [
  { label: 'All Events', href: '/dashboard/admin/events', icon: List },
  { label: 'Create Event', href: '/dashboard/admin/events/create', icon: Plus },
  { label: 'Statistics', href: '/dashboard/admin/events/statistics', icon: BarChart3 },
] as const

function eventSubNavIsActive(pathname: string, href: string) {
  if (href === '/dashboard/admin/events') {
    return (
      pathname === href ||
      (pathname.startsWith('/dashboard/admin/events/') &&
        !pathname.startsWith('/dashboard/admin/events/create') &&
        !pathname.startsWith('/dashboard/admin/events/statistics') &&
        !pathname.startsWith('/dashboard/admin/events/pending'))
    )
  }
  return navItemIsActive(pathname, href)
}

export function EventManagementHero() {
  return (
    <div className="rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 p-6 dark:border-rose-800/50 dark:from-rose-950/30 dark:via-orange-950/20 dark:to-amber-950/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            Event Management
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300 md:text-lg">
            Create and manage contests, placement drives, hackathons, and workshops across the platform.
          </p>
        </div>
        <Link
          href="/dashboard/admin/events/create"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg hover:brightness-105"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Link>
      </div>
    </div>
  )
}

export function EventManagementSubNav() {
  const pathname = usePathname()

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {SUB_NAV_ITEMS.map((item) => {
        const isActive = eventSubNavIsActive(pathname, item.href)
        const Icon = item.icon
        return (
          <motion.div key={item.href} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 rounded-xl border p-4 transition-all duration-200 ${
                isActive
                  ? 'border-primary-500 bg-white shadow-md ring-2 ring-primary-500/20 dark:bg-gray-800'
                  : 'border-gray-200 bg-white hover:border-primary-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-700'
              }`}
            >
              <div
                className={`rounded-lg p-2.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={`text-sm font-semibold ${
                  isActive ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-200'
                }`}
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
