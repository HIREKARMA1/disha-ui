"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import {
    LayoutDashboard,
    Building2,
    Briefcase,
    Users,
    FileText,
    Calendar,
    BarChart3,
    Search,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigationItems = [
    {
        name: 'Dashboard',
        href: '/dashboard/corporate',
        icon: LayoutDashboard,
        description: 'Overview and analytics'
    },
    {
        name: 'Profile',
        href: '/dashboard/corporate/profile',
        icon: Building2,
        description: 'Company information'
    },
    {
        name: 'Job Postings',
        href: '/dashboard/corporate/jobs',
        icon: Briefcase,
        description: 'Manage job listings'
    },
    {
        name: 'Candidates',
        href: '/dashboard/corporate/candidates',
        icon: Users,
        description: 'Browse talent pool'
    },
    {
        name: 'Applications',
        href: '/dashboard/corporate/applications',
        icon: FileText,
        description: 'Review applications'
    },
    {
        name: 'Interviews',
        href: '/dashboard/corporate/interviews',
        icon: Calendar,
        description: 'Schedule interviews'
    },
    {
        name: 'Analytics',
        href: '/dashboard/corporate/analytics',
        icon: BarChart3,
        description: 'Hiring insights'
    },
    {
        name: 'Talent Search',
        href: '/dashboard/corporate/talent-search',
        icon: Search,
        description: 'Find candidates'
    },
    {
        name: 'Settings',
        href: '/dashboard/corporate/settings',
        icon: Settings,
        description: 'Account settings'
    }
]

export function CorporateSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const pathname = usePathname()
    const { user, logout } = useAuth()

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed)
    }

    return (
        <motion.div
            initial={false}
            animate={{ width: isCollapsed ? '4rem' : '16rem' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-40 overflow-hidden"
        >
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-center space-x-2"
                        >
                            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Corporate
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Dashboard
                                </p>
                            </div>
                        </motion.div>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleSidebar}
                        className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-4 h-4" />
                        ) : (
                            <ChevronLeft className="w-4 h-4" />
                        )}
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {navigationItems.map((item, index) => {
                        const isActive = pathname === item.href

                        return (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link href={item.href}>
                                    <div
                                        className={cn(
                                            "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                                            isActive
                                                ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                                        )}
                                    >
                                        <item.icon className={cn(
                                            "w-5 h-5 flex-shrink-0",
                                            isActive
                                                ? "text-primary-600 dark:text-primary-400"
                                                : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                                        )} />

                                        {!isCollapsed && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.1 }}
                                                className="flex-1 min-w-0"
                                            >
                                                <div className="text-sm font-medium truncate">
                                                    {item.name}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {item.description}
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </Link>
                            </motion.div>
                        )
                    })}
                </nav>

                {/* User Profile Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                    {!isCollapsed ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-3"
                        >
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {user?.name || 'Corporate User'}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {user?.email || 'corporate@company.com'}
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={logout}
                                className="w-full justify-start text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </Button>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col items-center space-y-2">
                            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={logout}
                                className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
