import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Filter,
    BookOpen,
    Calendar,
    Trash2,
    GraduationCap,
    Users,
    UserCheck,
    Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CorporateStatCard } from '@/components/corporate/ui/CorporateStatCard'
import { STAT_ACCENTS, corpCard, corpInput } from '@/components/corporate/ui/corporate-theme'
import { cn } from '@/lib/utils'

interface StudentManagementHeaderProps {
    totalStudents: number
    activeStudents: number
    placedStudents: number
    departmentCount: number
    archivedStudents: number
    searchTerm: string
    onSearchChange: (value: string) => void
    filterStatus: string
    onFilterChange: (value: string) => void
    includeArchived: boolean
    onIncludeArchivedChange: (value: boolean) => void
    branches: string[]
    selectedBranch: string
    onBranchChange: (value: string) => void
    years: string[]
    selectedYear: string
    onYearChange: (value: string) => void
    degrees: string[]
    selectedDegree: string
    onDegreeChange: (value: string) => void
    showFilters: boolean
    setShowFilters: (show: boolean) => void
    onClearFilters: () => void
}

export function StudentManagementHeader({
    totalStudents,
    activeStudents,
    placedStudents,
    departmentCount,
    searchTerm,
    onSearchChange,
    filterStatus,
    onFilterChange,
    includeArchived,
    onIncludeArchivedChange,
    branches,
    selectedBranch,
    onBranchChange,
    years,
    selectedYear,
    onYearChange,
    degrees,
    selectedDegree,
    onDegreeChange,
    showFilters,
    setShowFilters,
    onClearFilters,
}: StudentManagementHeaderProps) {
    const summaryCards = [
        {
            label: 'Total Students',
            value: totalStudents,
            subtitle: 'Enrolled students',
            icon: Users,
            accent: 'blue' as const,
        },
        {
            label: 'Active Students',
            value: activeStudents,
            subtitle: 'Currently active',
            icon: UserCheck,
            accent: 'green' as const,
        },
        {
            label: 'Placed Students',
            value: placedStudents,
            subtitle: 'Successfully placed',
            icon: GraduationCap,
            accent: 'purple' as const,
        },
        {
            label: 'Departments',
            value: departmentCount,
            subtitle: 'Unique branches',
            icon: Building2,
            accent: 'orange' as const,
        },
    ]

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Mobile stats row */}
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
                            <div className={cn('w-6 h-6 rounded-md flex items-center justify-center mb-1.5', tones.icon)}>
                                <Icon className="w-3 h-3" />
                            </div>
                            <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 leading-tight line-clamp-2 mb-1">
                                {stat.label}
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white tabular-nums leading-none">
                                {stat.value}
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

            {/* Search and Filters */}
            <div className={cn(corpCard, 'p-4 md:p-5')}>
                <div className="flex flex-col sm:flex-row gap-3 mb-0">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search students by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className={cn(corpInput, 'pl-10 h-11')}
                        />
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 h-11 rounded-xl border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
                    >
                        <Filter className="w-4 h-4" />
                        {showFilters ? 'Hide' : 'Show'} Filters
                    </Button>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 mt-4 border-t border-gray-200 dark:border-white/[0.06] overflow-hidden"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status
                                </label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => onFilterChange(e.target.value)}
                                    className={cn(corpInput, 'h-10 appearance-none')}
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="placed">Placed</option>
                                    <option value="unplaced">Unplaced</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Degree
                                </label>
                                <div className="relative">
                                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                    <select
                                        value={selectedDegree}
                                        onChange={(e) => onDegreeChange(e.target.value)}
                                        className={cn(corpInput, 'pl-10 pr-8 h-10 appearance-none')}
                                    >
                                        <option value="all">All Degrees</option>
                                        {degrees.map(degree => (
                                            <option key={degree} value={degree}>{degree}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Branch
                                </label>
                                <div className="relative">
                                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                    <select
                                        value={selectedBranch}
                                        onChange={(e) => onBranchChange(e.target.value)}
                                        className={cn(corpInput, 'pl-10 pr-8 h-10 appearance-none')}
                                    >
                                        <option value="all">All Branches</option>
                                        {branches.map(branch => (
                                            <option key={branch} value={branch}>{branch}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Year
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => onYearChange(e.target.value)}
                                        className={cn(corpInput, 'pl-10 pr-8 h-10 appearance-none')}
                                    >
                                        <option value="all">All Years</option>
                                        {years.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    View
                                </label>
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                    <select
                                        value={includeArchived ? 'archived' : 'active'}
                                        onChange={(e) => onIncludeArchivedChange(e.target.value === 'archived')}
                                        className={cn(corpInput, 'pl-10 pr-8 h-10 appearance-none')}
                                    >
                                        <option value="active">Active Students</option>
                                        <option value="archived">Archived Students</option>
                                    </select>
                                </div>
                            </div>

                            <div className="sm:col-span-2 lg:col-span-5 flex justify-end mt-2">
                                <Button
                                    variant="outline"
                                    onClick={onClearFilters}
                                    className="rounded-xl border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 px-6"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Clear All
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
