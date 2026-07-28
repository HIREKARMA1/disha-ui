"use client"

import Link from 'next/link'
import {
    Briefcase,
    ClipboardList,
    FileText,
    Target,
    User,
    Brain,
    Calendar,
} from 'lucide-react'
import { SectionHeader } from '@/components/student/ui/SectionHeader'

const actions = [
    { label: 'Live Jobs', href: '/jobs', icon: Briefcase, tint: 'from-sky-500 to-blue-600' },
    { label: 'Applications', href: '/dashboard/student/applications', icon: ClipboardList, tint: 'from-indigo-500 to-violet-600' },
    { label: 'Profile', href: '/dashboard/student/profile', icon: User, tint: 'from-emerald-500 to-teal-600' },
    { label: 'Resume', href: '/dashboard/student/resume-builder', icon: FileText, tint: 'from-orange-500 to-amber-600' },
    { label: 'Career Align', href: '/dashboard/student/career-align', icon: Target, tint: 'from-pink-500 to-rose-600' },
    { label: 'Practice', href: '/dashboard/student/practice', icon: Brain, tint: 'from-purple-500 to-fuchsia-600' },
    { label: 'Events', href: '/events', icon: Calendar, tint: 'from-cyan-500 to-teal-600' },
]

export function StudentQuickActions({ className = '' }: { className?: string }) {
    return (
        <div
            className={`rounded-2xl border border-gray-200/80 dark:border-gray-700/70 bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-5 shadow-sm ${className}`}
        >
            <SectionHeader title="Quick Actions" subtitle="Jump to your most used tools" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {actions.map((action) => (
                    <Link
                        key={action.href}
                        href={action.href}
                        className="group flex items-center gap-2.5 rounded-xl border border-gray-200/80 dark:border-gray-700/70 bg-gray-50/70 dark:bg-gray-900/40 px-3 py-2.5 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200"
                    >
                        <div
                            className={`h-8 w-8 rounded-lg bg-gradient-to-br ${action.tint} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
                        >
                            <action.icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                            {action.label}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    )
}
