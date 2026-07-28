"use client"

import { Search, Filter, FileText, Clock, CheckCircle, XCircle, UserCheck, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StudentStatCard } from '@/components/student/ui/StudentStatCard'
import { cn } from '@/lib/utils'

interface StudentApplicationManagementHeaderProps {
    totalApplications: number
    appliedApplications: number
    shortlistedApplications: number
    selectedApplications: number
    rejectedApplications: number
    pendingApplications: number
    withdrawnApplications?: number
    searchTerm: string
    onSearchChange: (term: string) => void
    filterStatus: string
    onFilterChange: (status: string) => void
    companyOptions?: string[]
    selectedCompany?: string
    onCompanyChange?: (company: string) => void
    jobOptions?: { id: string; title: string }[]
    selectedJobId?: string
    onJobChange?: (jobId: string) => void
    onExport?: () => void
}

export function StudentApplicationManagementHeader({
    totalApplications,
    appliedApplications,
    shortlistedApplications,
    selectedApplications,
    rejectedApplications,
    pendingApplications,
    withdrawnApplications = 0,
    searchTerm,
    onSearchChange,
    filterStatus,
    onFilterChange,
    companyOptions,
    selectedCompany,
    onCompanyChange,
    jobOptions,
    selectedJobId,
    onJobChange,
    onExport,
}: StudentApplicationManagementHeaderProps) {
    const stats = [
        { value: 'all', label: 'All', count: totalApplications, icon: FileText, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50/80 dark:bg-primary-900/20' },
        { value: 'applied', label: 'Applied', count: appliedApplications, icon: Clock, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50/80 dark:bg-blue-900/20' },
        { value: 'shortlisted', label: 'Shortlisted', count: shortlistedApplications, icon: UserCheck, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50/80 dark:bg-violet-900/20' },
        { value: 'selected', label: 'Selected', count: selectedApplications, icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/80 dark:bg-emerald-900/20' },
        { value: 'rejected', label: 'Rejected', count: rejectedApplications, icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50/80 dark:bg-red-900/20' },
        { value: 'pending', label: 'Pending', count: pendingApplications, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50/80 dark:bg-amber-900/20' },
    ]

    const tabs = [
        { value: 'all', label: 'All' },
        { value: 'applied', label: 'Applied' },
        { value: 'shortlisted', label: 'Shortlisted' },
        { value: 'selected', label: 'Selected' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'pending', label: 'Pending' },
    ]

    return (
        <div className="space-y-2.5 sm:space-y-4">
            {/* Compact hero — smaller on mobile */}
            <div className="rounded-xl sm:rounded-2xl border border-primary-200/60 dark:border-primary-700/40 bg-gradient-to-br from-primary-50/90 via-white to-sky-50/70 dark:from-primary-900/25 dark:via-gray-800/80 dark:to-gray-900/80 backdrop-blur-sm px-3 py-2.5 sm:p-5">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    My Applications
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">
                    Track applications, interviews, and offer letters in one place
                </p>
            </div>

            {/* Compact stats — denser on mobile */}
            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-3">
                {stats.map((stat, index) => (
                    <StudentStatCard
                        key={stat.value}
                        label={stat.label}
                        value={stat.count}
                        icon={stat.icon}
                        colorClass={stat.color}
                        bgClass={stat.bg}
                        active={filterStatus === stat.value}
                        onClick={() => onFilterChange(stat.value)}
                        index={index}
                        compact
                    />
                ))}
            </div>

            {/* Search + filter + tabs — one tight section */}
            <div className="rounded-xl sm:rounded-2xl border border-gray-200/80 dark:border-gray-700/70 bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm p-2 sm:p-3.5">
                <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2.5">
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search job or company..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full h-8 sm:h-10 pl-8 pr-2.5 text-xs sm:text-sm rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none"
                        />
                    </div>
                    <div className="relative sm:w-40 shrink-0">
                        <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => onFilterChange(e.target.value)}
                            className="w-full h-8 sm:h-10 pl-7 pr-7 text-xs sm:text-sm rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none"
                        >
                            {tabs.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                            {withdrawnApplications > 0 && (
                                <option value="withdrawn">Withdrawn ({withdrawnApplications})</option>
                            )}
                        </select>
                    </div>

                    {companyOptions && companyOptions.length > 0 && onCompanyChange && (
                        <select
                            value={selectedCompany || 'all'}
                            onChange={(e) => onCompanyChange(e.target.value)}
                            className="hidden sm:block h-10 px-3 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 sm:w-44"
                        >
                            <option value="all">All Companies</option>
                            {companyOptions.map((name) => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    )}

                    {jobOptions && jobOptions.length > 0 && onJobChange && (
                        <select
                            value={selectedJobId || 'all'}
                            onChange={(e) => onJobChange(e.target.value)}
                            className="hidden sm:block h-10 px-3 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 sm:w-44"
                        >
                            <option value="all">All Jobs</option>
                            {jobOptions.map((job) => (
                                <option key={job.id} value={job.id}>{job.title}</option>
                            ))}
                        </select>
                    )}

                    {onExport && (
                        <Button type="button" onClick={onExport} className="hidden sm:inline-flex h-10 rounded-xl px-4 shrink-0">
                            <Download className="w-4 h-4 mr-1.5" />
                            Export
                        </Button>
                    )}
                </div>

                {/* Status tabs — compact horizontal scroll */}
                <div className="mt-2 sm:mt-3 -mx-0.5 px-0.5 overflow-x-auto scrollbar-none">
                    <div className="flex gap-0.5 sm:gap-1 min-w-max border-b border-gray-200 dark:border-gray-700">
                        {tabs.map((tab) => {
                            const active = filterStatus === tab.value
                            return (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => onFilterChange(tab.value)}
                                    className={cn(
                                        'px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm font-semibold transition-colors relative whitespace-nowrap',
                                        active
                                            ? 'text-primary-600 dark:text-primary-400'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                                    )}
                                >
                                    {tab.label}
                                    {active && (
                                        <span className="absolute left-1.5 right-1.5 sm:left-2 sm:right-2 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
