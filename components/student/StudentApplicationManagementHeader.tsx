"use client"

import { Search, ChevronDown, FileText, Clock, CheckCircle, XCircle, UserCheck, Download, Briefcase, Calendar, TrendingUp, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StudentStatCard } from '@/components/student/ui/StudentStatCard'
import { StudentChip } from '@/components/student/ui/StudentChip'
import { StudentSectionCard } from '@/components/student/ui/StudentSectionCard'
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
    const dateLabel = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    })
    const dateShort = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    })

    const stats = [
        { value: 'all', label: 'All', count: totalApplications, icon: FileText, color: 'text-blue-500', iconBg: 'bg-blue-500/15', subtitle: 'Total applications' },
        { value: 'applied', label: 'Applied', count: appliedApplications, icon: Clock, color: 'text-emerald-500', iconBg: 'bg-emerald-500/15', subtitle: 'Applications submitted' },
        { value: 'shortlisted', label: 'Shortlisted', count: shortlistedApplications, icon: UserCheck, color: 'text-violet-500', iconBg: 'bg-violet-500/15', subtitle: "You're in the running" },
        { value: 'selected', label: 'Selected', count: selectedApplications, icon: CheckCircle, color: 'text-emerald-500', iconBg: 'bg-emerald-500/15', subtitle: 'Congratulations!' },
        { value: 'rejected', label: 'Rejected', count: rejectedApplications, icon: XCircle, color: 'text-red-500', iconBg: 'bg-red-500/15', subtitle: 'Keep trying!' },
        { value: 'pending', label: 'Pending', count: pendingApplications, icon: Clock, color: 'text-amber-500', iconBg: 'bg-amber-500/15', subtitle: 'Awaiting update' },
    ]

    const tabs = [
        { value: 'all', label: 'All', count: totalApplications },
        { value: 'applied', label: 'Applied', count: appliedApplications },
        { value: 'shortlisted', label: 'Shortlisted', count: shortlistedApplications },
        { value: 'selected', label: 'Selected', count: selectedApplications },
        { value: 'rejected', label: 'Rejected', count: rejectedApplications },
        { value: 'pending', label: 'Pending', count: pendingApplications },
    ]

    return (
        <div className="space-y-2 sm:space-y-4">
            <StudentSectionCard padding="sm">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-base sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                            My Applications
                            <Briefcase className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-500" />
                        </h1>
                        <p className="text-[11px] sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                            Track your job applications and download offer letters ✨
                        </p>
                        <div className="mt-1.5 sm:mt-2.5 flex flex-wrap gap-1 sm:gap-1.5">
                            <StudentChip icon={Calendar} label={dateShort} tone="blue" className="sm:hidden scale-90 origin-left" />
                            <StudentChip icon={Calendar} label={dateLabel} tone="blue" className="hidden sm:inline-flex" />
                            <StudentChip icon={TrendingUp} label="Career Progress" tone="green" className="hidden sm:inline-flex" />
                            <StudentChip icon={Sparkles} label="Job Opportunities" tone="purple" className="hidden sm:inline-flex" />
                        </div>
                    </div>
                    <div className="hidden sm:flex shrink-0 w-28 h-24 lg:w-40 lg:h-28 items-center justify-center relative">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 blur-sm" />
                        <svg viewBox="0 0 160 120" className="relative w-full h-full" aria-hidden>
                            <ellipse cx="80" cy="105" rx="45" ry="8" fill="#3B82F6" opacity="0.35" />
                            <rect x="45" y="35" width="70" height="55" rx="8" fill="#3B82F6" opacity="0.9" />
                            <rect x="55" y="45" width="50" height="8" rx="2" fill="white" opacity="0.85" />
                            <rect x="55" y="58" width="35" height="6" rx="2" fill="white" opacity="0.5" />
                            <circle cx="125" cy="40" r="12" fill="#8B5CF6" opacity="0.85" />
                            <circle cx="30" cy="50" r="10" fill="#10B981" opacity="0.7" />
                        </svg>
                    </div>
                </div>
            </StudentSectionCard>

            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-3">
                {stats.map((stat, index) => (
                    <StudentStatCard
                        key={stat.value}
                        label={stat.label}
                        value={stat.count}
                        icon={stat.icon}
                        subtitle={stat.subtitle}
                        colorClass={stat.color}
                        iconBgClass={stat.iconBg}
                        active={filterStatus === stat.value}
                        onClick={() => onFilterChange(stat.value)}
                        index={index}
                        micro
                    />
                ))}
            </div>

            <StudentSectionCard padding="sm">
                <div className="flex flex-row items-center gap-2 sm:gap-2.5 min-w-0 w-full">
                    <div className="relative min-w-0 flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search Jobs..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full h-9 sm:h-10 pl-8 pr-2.5 text-xs sm:text-sm rounded-lg sm:rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1219] text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div className="relative shrink-0 w-[9rem] sm:w-44">
                        <select
                            value={filterStatus}
                            onChange={(e) => onFilterChange(e.target.value)}
                            aria-label="Filter by status"
                            className="student-filter-select w-full h-9 sm:h-10 pl-2.5 pr-8 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1219] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/30 outline-none cursor-pointer"
                            style={{
                                appearance: 'none',
                                WebkitAppearance: 'none',
                                MozAppearance: 'none',
                                backgroundImage: 'none',
                            }}
                        >
                            {tabs.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                            {withdrawnApplications > 0 && (
                                <option value="withdrawn">Withdrawn</option>
                            )}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" aria-hidden />
                    </div>

                    {companyOptions && companyOptions.length > 0 && onCompanyChange && (
                        <select
                            value={selectedCompany || 'all'}
                            onChange={(e) => onCompanyChange(e.target.value)}
                            className="hidden sm:block h-10 px-3 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1219] sm:w-44"
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
                            className="hidden sm:block h-10 px-3 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1219] sm:w-44"
                        >
                            <option value="all">All Jobs</option>
                            {jobOptions.map((job) => (
                                <option key={job.id} value={job.id}>{job.title}</option>
                            ))}
                        </select>
                    )}

                    {onExport && (
                        <Button type="button" onClick={onExport} className="hidden sm:inline-flex h-10 rounded-xl px-4 shrink-0 bg-blue-600 hover:bg-blue-500">
                            <Download className="w-4 h-4 mr-1.5" />
                            Export
                        </Button>
                    )}
                </div>

                <div
                    className="mt-1.5 sm:mt-3 -mx-0.5 px-0.5 overflow-x-auto"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    <div className="flex gap-0 sm:gap-1 min-w-max border-b border-gray-200 dark:border-white/10">
                        {tabs.map((tab) => {
                            const active = filterStatus === tab.value
                            return (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => onFilterChange(tab.value)}
                                    className={cn(
                                        'px-1.5 sm:px-3 py-1 sm:py-2 text-[10px] sm:text-sm font-semibold transition-colors relative whitespace-nowrap',
                                        active
                                            ? 'text-blue-500'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                                    )}
                                >
                                    {tab.label} ({tab.count})
                                    {active && (
                                        <span className="absolute left-1 right-1 sm:left-2 sm:right-2 -bottom-px h-0.5 rounded-full bg-blue-500" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </StudentSectionCard>
        </div>
    )
}
