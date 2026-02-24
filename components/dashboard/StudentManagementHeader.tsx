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
    GraduationCap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

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
    onBulkUpload
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

                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                            onClick={onAddStudent}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 w-full sm:w-auto justify-center"
                        >
                            <UserPlus className="w-4 h-4 mr-2 shrink-0" />
                            Add Student
                        </Button>
                        <Button
                            onClick={onBulkUpload}
                            className="bg-green-600 hover:bg-green-700 text-white shadow-sm transition-all duration-200 w-full sm:w-auto justify-center"
                        >
                            <Upload className="w-4 h-4 mr-2 shrink-0" />
                            Bulk Upload
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center justify-center gap-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md w-full sm:w-auto"
                        >
                            <Filter className="w-4 h-4 shrink-0" />
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
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
                        >
                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status
                                </label>
                                <Select value={filterStatus} onValueChange={onFilterChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" align="start" sideOffset={4} className="z-[99999]">
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="placed">Placed</SelectItem>
                                        <SelectItem value="unplaced">Unplaced</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Degree Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Degree
                                </label>
                                <Select value={selectedDegree} onValueChange={onDegreeChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All Degrees" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" align="start" sideOffset={4} className="z-[99999] max-h-60">
                                        <SelectItem value="all">All Degrees</SelectItem>
                                        {degrees.map(degree => (
                                            <SelectItem key={degree} value={degree}>{degree}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Branch Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Branch
                                </label>
                                <Select value={selectedBranch} onValueChange={onBranchChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All Branches" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" align="start" sideOffset={4} className="z-[99999] max-h-60">
                                        <SelectItem value="all">All Branches</SelectItem>
                                        {branches.map(branch => (
                                            <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Year Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Year
                                </label>
                                <Select value={selectedYear} onValueChange={onYearChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All Years" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" align="start" sideOffset={4} className="z-[99999] max-h-60">
                                        <SelectItem value="all">All Years</SelectItem>
                                        {years.map(year => (
                                            <SelectItem key={year} value={year}>{year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Archive / View Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    View
                                </label>
                                <Select
                                    value={includeArchived ? 'archived' : 'active'}
                                    onValueChange={(value) => onIncludeArchivedChange(value === 'archived')}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Active Students" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" align="start" sideOffset={4} className="z-[99999]">
                                        <SelectItem value="active">Active Students</SelectItem>
                                        <SelectItem value="archived">Archived Students</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Clear Filters Button */}
                            <div className="sm:col-span-2 lg:col-span-5 flex justify-end mt-2">
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
