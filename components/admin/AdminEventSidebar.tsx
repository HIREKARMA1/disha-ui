"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Calendar,
    Plus,
    List,
    CheckCircle,
    Clock,
    BarChart3,
    Settings,
    Users,
    FileText,
    Upload,
    Archive,
    ChevronDown,
    ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarItem {
    label: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    badge?: number
    children?: SidebarItem[]
}

const sidebarItems: SidebarItem[] = [
    {
        label: 'Create Event',
        href: '/dashboard/admin/events/create',
        icon: Plus
    },
    {
        label: 'All Events',
        href: '/dashboard/admin/events',
        icon: List
    },
    {
        label: 'Pending Approval',
        href: '/dashboard/admin/events/pending',
        icon: Clock,
        badge: 0 // This will be updated dynamically
    },
    {
        label: 'Approved Events',
        href: '/dashboard/admin/events/approved',
        icon: CheckCircle
    },
    {
        label: 'Event Statistics',
        href: '/dashboard/admin/events/statistics',
        icon: BarChart3
    },
    {
        label: 'File Management',
        href: '/dashboard/admin/events/files',
        icon: Upload
    },
    {
        label: 'Archived Events',
        href: '/dashboard/admin/events/archived',
        icon: Archive
    }
]

interface AdminEventSidebarProps {
    className?: string
}

export function AdminEventSidebar({ className }: AdminEventSidebarProps) {
    const pathname = usePathname()
    const [expandedItems, setExpandedItems] = useState<string[]>([])

    const toggleExpanded = (href: string) => {
        setExpandedItems(prev =>
            prev.includes(href)
                ? prev.filter(item => item !== href)
                : [...prev, href]
        )
    }

    const isActive = (href: string) => {
        if (href === '/dashboard/admin/events') {
            return pathname === href
        }
        return pathname.startsWith(href)
    }

    const renderSidebarItem = (item: SidebarItem, level = 0) => {
        const hasChildren = item.children && item.children.length > 0
        const isExpanded = expandedItems.includes(item.href)
        const active = isActive(item.href)

        return (
            <div key={item.href}>
                <Link
                    href={item.href}
                    className={cn(
                        "flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group",
                        "hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-primary-900/20 dark:hover:text-primary-300",
                        active && "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300",
                        level > 0 && "ml-4"
                    )}
                    onClick={() => hasChildren && toggleExpanded(item.href)}
                >
                    <div className="flex items-center space-x-3">
                        <item.icon className={cn(
                            "w-5 h-5 transition-colors",
                            active
                                ? "text-primary-600 dark:text-primary-400"
                                : "text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400"
                        )} />
                        <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        {item.badge !== undefined && item.badge > 0 && (
                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                                {item.badge}
                            </span>
                        )}
                        {hasChildren && (
                            <motion.div
                                animate={{ rotate: isExpanded ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            </motion.div>
                        )}
                    </div>
                </Link>

                {hasChildren && isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-1 space-y-1"
                    >
                        {item.children?.map(child => renderSidebarItem(child, level + 1))}
                    </motion.div>
                )}
            </div>
        )
    }

    return (
        <div className={cn("w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full", className)}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg">
                        <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Event Management
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage all events
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
                {sidebarItems.map(item => renderSidebarItem(item))}
            </nav>

            {/* Quick Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Quick Actions
                </h3>
                <div className="space-y-2">
                    <Link
                        href="/dashboard/admin/events/create"
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Event</span>
                    </Link>
                    <Link
                        href="/dashboard/admin/events/pending"
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                    >
                        <Clock className="w-4 h-4" />
                        <span>Review Pending</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
