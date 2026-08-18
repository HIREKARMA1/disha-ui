'use client'

import Link from 'next/link'
import { Briefcase, Users, Brain, BarChart3, UserPlus, Settings } from 'lucide-react'
import { UniversityGlassCard } from '@/components/university/ui/UniversityGlassCard'
import { cn } from '@/lib/utils'

const actions = [
    {
        label: 'Create Job',
        href: '/dashboard/university/jobs',
        icon: Briefcase,
        color: 'bg-blue-500/15 text-blue-500',
    },
    {
        label: 'Add Students',
        href: '/dashboard/university/students',
        icon: UserPlus,
        color: 'bg-emerald-500/15 text-emerald-500',
    },
    {
        label: 'Practice Tests',
        href: '/dashboard/university/practice',
        icon: Brain,
        color: 'bg-violet-500/15 text-violet-500',
    },
    {
        label: 'Applications',
        href: '/dashboard/university/applications',
        icon: Users,
        color: 'bg-orange-500/15 text-orange-500',
    },
    {
        label: 'Analytics',
        href: '/dashboard/university/analytics',
        icon: BarChart3,
        color: 'bg-teal-500/15 text-teal-500',
    },
    {
        label: 'Settings',
        href: '/dashboard/university/settings',
        icon: Settings,
        color: 'bg-gray-500/15 text-gray-400',
    },
]

export function UniversityQuickActions({ className = '' }: { className?: string }) {
    return (
        <UniversityGlassCard title="Quick Actions" className={className} delay={0.1}>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {actions.map((action) => (
                    <Link
                        key={action.label}
                        href={action.href}
                        className="group flex flex-col items-center gap-1.5 text-center min-w-0 rounded-xl p-2 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
                    >
                        <div
                            className={cn(
                                'w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 group-hover:scale-[1.03] group-hover:shadow-md',
                                action.color
                            )}
                        >
                            <action.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight line-clamp-2">
                            {action.label}
                        </span>
                    </Link>
                ))}
            </div>
        </UniversityGlassCard>
    )
}
