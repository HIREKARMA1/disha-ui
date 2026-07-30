'use client'

import { Search, Filter, FileText, CheckCircle, XCircle, UserCheck, Calendar, Rocket, Users } from 'lucide-react'
import { CorporatePageHero } from '@/components/corporate/ui/CorporatePageHero'
import { CorporateStatCard } from '@/components/corporate/ui/CorporateStatCard'
import { STAT_ACCENTS } from '@/components/corporate/ui/corporate-theme'
import { corpCard, corpInput } from '@/components/corporate/ui/corporate-theme'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface ApplicationManagementHeaderProps {
    totalApplications: number
    pendingApplications: number
    shortlistedApplications: number
    selectedApplications: number
    rejectedApplications: number
    searchTerm: string
    onSearchChange: (term: string) => void
    filterStatus: string
    onFilterChange: (status: string) => void
}

export function ApplicationManagementHeader({
    totalApplications,
    shortlistedApplications,
    selectedApplications,
    rejectedApplications,
    searchTerm,
    onSearchChange,
    filterStatus,
    onFilterChange,
}: ApplicationManagementHeaderProps) {
    const statusOptions = [
        { value: 'all', label: 'All Applications' },
        { value: 'shortlisted', label: 'Shortlisted' },
        { value: 'selected', label: 'Selected' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'applied', label: 'Applied' },
    ]

    const summaryCards = [
        {
            label: 'All Applications',
            value: totalApplications,
            subtitle: 'Total received',
            icon: FileText,
            accent: 'blue' as const,
        },
        {
            label: 'Shortlisted',
            value: shortlistedApplications,
            subtitle: 'In review',
            icon: UserCheck,
            accent: 'purple' as const,
        },
        {
            label: 'Selected',
            value: selectedApplications,
            subtitle: 'Offers / hires',
            icon: CheckCircle,
            accent: 'green' as const,
        },
        {
            label: 'Rejected',
            value: rejectedApplications,
            subtitle: 'Not progressing',
            icon: XCircle,
            accent: 'red' as const,
        },
    ]

    const dateLabel = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
    })

    return (
        <div className="space-y-4 md:space-y-6">
            <CorporatePageHero
                title="Application Management 📋"
                subtitle="Manage job applications and offer letters ✨"
                chips={[
                    {
                        label: dateLabel,
                        tone: 'blue',
                        icon: <Calendar className="w-3.5 h-3.5" />,
                    },
                    {
                        label: 'Talent Management',
                        tone: 'green',
                        icon: <Users className="w-3.5 h-3.5" />,
                    },
                    {
                        label: 'Hiring Pipeline',
                        tone: 'purple',
                        icon: <Rocket className="w-3.5 h-3.5" />,
                    },
                ]}
            />

            {/* Mobile: all 4 stats in one row */}
            <div className="md:hidden grid grid-cols-4 gap-1.5">
                {summaryCards.map((stat, index) => {
                    const tones = STAT_ACCENTS[stat.accent]
                    const Icon = stat.icon
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className={cn('rounded-xl border p-2 min-w-0', tones.card)}
                        >
                            <div
                                className={cn(
                                    'w-6 h-6 rounded-md flex items-center justify-center mb-1.5',
                                    tones.icon
                                )}
                            >
                                <Icon className="w-3 h-3" />
                            </div>
                            <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 leading-tight line-clamp-2 mb-1">
                                {stat.label}
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white tabular-nums leading-none">
                                {stat.value}
                            </p>
                            <p className="text-[8px] text-gray-500 dark:text-gray-400 mt-1 truncate">
                                {stat.subtitle}
                            </p>
                        </motion.div>
                    )
                })}
            </div>

            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {summaryCards.map((stat, index) => (
                    <CorporateStatCard
                        key={stat.label}
                        label={stat.label}
                        value={stat.value}
                        subtitle={stat.subtitle}
                        icon={stat.icon}
                        accent={stat.accent}
                        index={index}
                    />
                ))}
            </div>

            <div className={cn(corpCard, 'p-4')}>
                <div className="flex flex-col gap-3">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by student name, job title, or email..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className={cn(corpInput, 'pl-10 h-11')}
                        />
                    </div>
                    <div className="flex gap-2.5">
                        <div className="relative flex-1">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            <select
                                value={filterStatus}
                                onChange={(e) => onFilterChange(e.target.value)}
                                className={cn(corpInput, 'pl-9 pr-8 h-11 appearance-none')}
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            className="md:hidden h-11 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1520] text-sm font-medium text-gray-700 dark:text-gray-200 inline-flex items-center gap-1.5 flex-shrink-0"
                            onClick={() => {
                                /* filter panel already exposed via dropdown */
                            }}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
