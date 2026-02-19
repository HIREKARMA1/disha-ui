import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Filter,
    BookOpen,
    Calendar,
    UserPlus,
    Upload,
    X,
    Trash2,
    GraduationCap,
    Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
    /** When true, hide Add Student and Bulk Upload buttons (e.g. admin page) */
    hideAddAndBulk?: boolean
    /** Optional university filter (e.g. admin page). When set, "Filter by University" appears inside the filter options. */
    universityFilter?: {
        universities: { id: string; university_name: string }[]
        selectedUniversityId: string
        onUniversityChange: (universityId: string) => void
        isLoading?: boolean
    }
    /** Optional actions to show in the same row as Show Filters (e.g. Export CSV button). */
    extraActions?: React.ReactNode
}

export function StudentManagementHeader({
    totalStudents,
    activeStudents,
    archivedStudents,
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
    hideAddAndBulk = false,
    universityFilter,
    extraActions
}: StudentManagementHeaderProps) {
    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                {/* Top Row: Search and Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Search students by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10 border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20"
                        />
                    </div>

                    <div className="flex gap-2">
                        {!hideAddAndBulk && (
                            <>
                                <Button
                                    onClick={onAddStudent}
                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200"
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Add Student
                                </Button>
                                <Button
                                    onClick={onBulkUpload}
                                    className="bg-green-600 hover:bg-green-700 text-white shadow-sm transition-all duration-200"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Bulk Upload
                                </Button>
                            </>
                        )}
                        {extraActions}
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md"
                        >
                            <Filter className="w-4 h-4" />
                            {showFilters ? 'Hide' : 'Show'} Filters
                        </Button>
                    </div>
                </div>

                {/* Collapsible Filters Row */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 overflow-hidden ${universityFilter ? 'lg:grid-cols-6' : 'lg:grid-cols-5'}`}
                        >
                            {/* University Filter (optional, e.g. admin) */}
                            {universityFilter && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        University
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <select
                                            value={universityFilter.selectedUniversityId}
                                            onChange={(e) => universityFilter.onUniversityChange(e.target.value)}
                                            disabled={universityFilter.isLoading}
                                            className="w-full pl-10 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 appearance-none"
                                        >
                                            <option value="">All Universities</option>
                                            {universityFilter.universities.map((u) => (
                                                <option key={u.id} value={u.id}>{u.university_name}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-200">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status
                                </label>
                                <div className="relative">
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => onFilterChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20 text-gray-900 dark:text-white rounded-lg bg-white dark:bg-gray-800 appearance-none"
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="placed">Placed</option>
                                        <option value="unplaced">Unplaced</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-200">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Degree Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Degree
                                </label>
                                <div className="relative">
                                    <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <select
                                        value={selectedDegree}
                                        onChange={(e) => onDegreeChange(e.target.value)}
                                        className="w-full pl-10 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 appearance-none"
                                    >
                                        <option value="all">All Degrees</option>
                                        {degrees.map(degree => (
                                            <option key={degree} value={degree}>{degree}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-200">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Branch Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Branch
                                </label>
                                <div className="relative">
                                    <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <select
                                        value={selectedBranch}
                                        onChange={(e) => onBranchChange(e.target.value)}
                                        className="w-full pl-10 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 appearance-none"
                                    >
                                        <option value="all">All Branches</option>
                                        {branches.map(branch => (
                                            <option key={branch} value={branch}>{branch}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-200">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Year Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Year
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => onYearChange(e.target.value)}
                                        className="w-full pl-10 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 appearance-none"
                                    >
                                        <option value="all">All Years</option>
                                        {years.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-200">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Archive Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    View
                                </label>
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <select
                                        value={includeArchived ? 'archived' : 'active'}
                                        onChange={(e) => onIncludeArchivedChange(e.target.value === 'archived')}
                                        className="w-full pl-10 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 appearance-none"
                                    >
                                        <option value="active">Active Students</option>
                                        <option value="archived">Archived Students</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-200">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Clear Filters Button */}
                            <div className={`sm:col-span-2 flex justify-end mt-2 ${universityFilter ? 'lg:col-span-6' : 'lg:col-span-5'}`}>
                                <Button
                                    variant="outline"
                                    onClick={onClearFilters}
                                    className="border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md px-6"
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
