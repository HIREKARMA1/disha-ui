'use client'

import {
    Users,
    Building2,
    GraduationCap,
    Briefcase,
    FileText,
    CheckCircle,
    Clock,
} from 'lucide-react'
import { AdminUserStats, AdminJobStats } from '@/types/admin'
import { AdminStatCard } from '@/components/admin/ui/AdminStatCard'
import type { StatAccent } from '@/components/admin/ui/admin-theme'

interface AdminDashboardStatsProps {
    userStats: AdminUserStats
    jobStats: AdminJobStats
    isLoading: boolean
}

export function AdminDashboardStats({ userStats, jobStats, isLoading }: AdminDashboardStatsProps) {
    const stats: Array<{
        label: string
        value: number
        subtitle?: string
        icon: React.ComponentType<{ className?: string }>
        accent: StatAccent
    }> = [
        {
            label: 'Total Users',
            value: userStats.total_users,
            subtitle: 'Across all roles',
            icon: Users,
            accent: 'blue',
        },
        {
            label: 'Students',
            value: userStats.total_students,
            subtitle: 'Registered students',
            icon: GraduationCap,
            accent: 'green',
        },
        {
            label: 'Universities',
            value: userStats.total_universities,
            subtitle: 'Partner institutions',
            icon: Building2,
            accent: 'purple',
        },
        {
            label: 'Corporates',
            value: userStats.total_corporates,
            subtitle: 'Hiring partners',
            icon: Briefcase,
            accent: 'orange',
        },
        {
            label: 'Total Jobs',
            value: jobStats.total_jobs,
            subtitle: 'All job postings',
            icon: Briefcase,
            accent: 'teal',
        },
        {
            label: 'Active Jobs',
            value: jobStats.active_jobs,
            subtitle: 'Currently live',
            icon: CheckCircle,
            accent: 'green',
        },
        {
            label: 'Applications',
            value: jobStats.total_applications,
            subtitle: 'Across all jobs',
            icon: FileText,
            accent: 'blue',
        },
        {
            label: 'Pending Approvals',
            value: jobStats.pending_approvals,
            subtitle: 'Awaiting review',
            icon: Clock,
            accent: 'orange',
        },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
                <AdminStatCard
                    key={stat.label}
                    label={stat.label}
                    value={isLoading ? '—' : stat.value.toLocaleString()}
                    subtitle={stat.subtitle}
                    icon={stat.icon}
                    accent={stat.accent}
                    index={index}
                    isLoading={isLoading}
                />
            ))}
        </div>
    )
}
