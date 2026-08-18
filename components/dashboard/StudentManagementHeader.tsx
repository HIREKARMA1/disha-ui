'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Filter,
    BookOpen,
    Calendar,
    UserPlus,
    Upload,
    Trash2,
    GraduationCap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getDegreeLabel } from '@/lib/academicHierarchy'
import { MobileFilterBottomSheet } from '@/components/ui/MobileFilterBottomSheet'
import { uniCard, uniInput } from '@/components/university/ui/university-theme'
import { cn } from '@/lib/utils'

interface StudentManagementHeaderProps {
    totalStudents: number
    activeStudents: number
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
    onAddStudent: () => void
    onBulkUpload: () => void
}

const selectClass =
    'w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1520] text-gray-900 dark:text-white text-sm appearance-none'

export function StudentManagementHeader({
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
    onAddStudent,
    onBulkUpload,
}: StudentManagementHeaderProps) {
    const [sheetOpen, setSheetOpen] = useState(false)
    const [draftStatus, setDraftStatus] = useState(filterStatus)
    const [draftDegree, setDraftDegree] = useState(selectedDegree)
    const [draftBranch, setDraftBranch] = useState(selectedBranch)
    const [draftYear, setDraftYear] = useState(selectedYear)
    const [draftArchived, setDraftArchived] = useState(includeArchived)

    const activeCount = useMemo(() => {
        let n = 0
        if (filterStatus !== 'all') n += 1
        if (selectedDegree !== 'all') n += 1
        if (selectedBranch !== 'all') n += 1
        if (selectedYear !== 'all') n += 1
        if (includeArchived) n += 1
        return n
    }, [filterStatus, selectedDegree, selectedBranch, selectedYear, includeArchived])

    const openSheet = () => {
        setDraftStatus(filterStatus)
        setDraftDegree(selectedDegree)
        setDraftBranch(selectedBranch)
        setDraftYear(selectedYear)
        setDraftArchived(includeArchived)
        setSheetOpen(true)
    }

    const applySheet = () => {
        onFilterChange(draftStatus)
        onDegreeChange(draftDegree)
        onBranchChange(draftBranch)
        onYearChange(draftYear)
        onIncludeArchivedChange(draftArchived)
        setShowFilters(true)
    }

    const clearSheet = () => {
        setDraftStatus('all')
        setDraftDegree('all')
        setDraftBranch('all')
        setDraftYear('all')
        setDraftArchived(false)
        onClearFilters()
    }

    return (
        <div className="space-y-4">
            <div className={cn(uniCard, 'p-4 sm:p-5')}>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search students by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className={cn(uniInput, 'pl-10 h-11')}
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            onClick={onAddStudent}
                            className="h-11 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
                        >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Student
                        </Button>
                        <Button
                            onClick={onBulkUpload}
                            className="h-11 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700"
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Bulk Upload
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="hidden h-11 items-center gap-2 rounded-xl border-gray-200 dark:border-white/10 lg:flex"
                        >
                            <Filter className="h-4 w-4" />
                            {showFilters ? 'Hide' : 'Show'} Filters
                        </Button>
                        <MobileFilterBottomSheet
                            open={sheetOpen}
                            onOpenChange={(open) => {
                                if (open) openSheet()
                                else setSheetOpen(false)
                            }}
                            activeCount={activeCount}
                            onApply={applySheet}
                            onClear={clearSheet}
                            clearLabel="Reset"
                            applyLabel="Apply"
                        >
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Status
                                    </label>
                                    <select
                                        value={draftStatus}
                                        onChange={(e) => setDraftStatus(e.target.value)}
                                        className={selectClass}
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="placed">Placed</option>
                                        <option value="unplaced">Unplaced</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Degree
                                    </label>
                                    <select
                                        value={draftDegree}
                                        onChange={(e) => setDraftDegree(e.target.value)}
                                        className={selectClass}
                                    >
                                        <option value="all">All Degrees</option>
                                        {degrees.map((degree) => (
                                            <option key={degree} value={degree}>
                                                {getDegreeLabel(degree)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Branch
                                    </label>
                                    <select
                                        value={draftBranch}
                                        onChange={(e) => setDraftBranch(e.target.value)}
                                        className={selectClass}
                                    >
                                        <option value="all">All Branches</option>
                                        {branches.map((branch) => (
                                            <option key={branch} value={branch}>
                                                {branch}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Year
                                    </label>
                                    <select
                                        value={draftYear}
                                        onChange={(e) => setDraftYear(e.target.value)}
                                        className={selectClass}
                                    >
                                        <option value="all">All Years</option>
                                        {years.map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        View
                                    </label>
                                    <select
                                        value={draftArchived ? 'archived' : 'active'}
                                        onChange={(e) =>
                                            setDraftArchived(e.target.value === 'archived')
                                        }
                                        className={selectClass}
                                    >
                                        <option value="active">Active Students</option>
                                        <option value="archived">Archived Students</option>
                                    </select>
                                </div>
                            </div>
                        </MobileFilterBottomSheet>
                    </div>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="hidden overflow-hidden border-t border-gray-200 pt-4 dark:border-white/[0.06] lg:grid lg:grid-cols-5 lg:gap-4"
                        >
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Status
                                </label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => onFilterChange(e.target.value)}
                                    className={selectClass}
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="placed">Placed</option>
                                    <option value="unplaced">Unplaced</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Degree
                                </label>
                                <div className="relative">
                                    <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <select
                                        value={selectedDegree}
                                        onChange={(e) => onDegreeChange(e.target.value)}
                                        className={`${selectClass} pl-10`}
                                    >
                                        <option value="all">All Degrees</option>
                                        {degrees.map((degree) => (
                                            <option key={degree} value={degree}>
                                                {getDegreeLabel(degree)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Branch
                                </label>
                                <div className="relative">
                                    <BookOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <select
                                        value={selectedBranch}
                                        onChange={(e) => onBranchChange(e.target.value)}
                                        className={`${selectClass} pl-10`}
                                    >
                                        <option value="all">All Branches</option>
                                        {branches.map((branch) => (
                                            <option key={branch} value={branch}>
                                                {branch}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Year
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => onYearChange(e.target.value)}
                                        className={`${selectClass} pl-10`}
                                    >
                                        <option value="all">All Years</option>
                                        {years.map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    View
                                </label>
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <select
                                        value={includeArchived ? 'archived' : 'active'}
                                        onChange={(e) =>
                                            onIncludeArchivedChange(e.target.value === 'archived')
                                        }
                                        className={`${selectClass} pl-10`}
                                    >
                                        <option value="active">Active Students</option>
                                        <option value="archived">Archived Students</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-2 flex justify-end lg:col-span-5">
                                <Button
                                    variant="outline"
                                    onClick={onClearFilters}
                                    className="border-gray-200 px-6 transition-all duration-200 hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:hover:border-gray-600"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
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
