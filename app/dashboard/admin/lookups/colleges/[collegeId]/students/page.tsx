"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { StudentManagementHeader } from '@/components/dashboard/StudentManagementHeader'
import { StudentTable } from '@/components/dashboard/StudentTable'
import { degreeOptions } from '@/components/dashboard/CreateStudentModal'
import { StudentListItem } from '@/types/university'
import * as lookupAdminService from '@/services/lookupAdminService'
import { toast } from 'react-hot-toast'
import { getErrorMessage } from '@/lib/error-handler'
import {
    ArrowLeft,
    Calendar,
    Download,
    GraduationCap,
    TrendingUp,
    UserPlus,
    Users,
} from 'lucide-react'
import { exportStudentsToCSV } from '@/utils/exportToExcel'
import {
    getFilterBranches,
} from '@/lib/academicHierarchy'
import { UniversityStatCard } from '@/components/university/ui/UniversityStatCard'
import { STAT_ACCENTS } from '@/components/university/ui/university-theme'
import { cn } from '@/lib/utils'

function sanitizeFilename(name: string) {
    return name.replace(/[^a-zA-Z0-9-_]+/g, '_').replace(/_+/g, '_').slice(0, 80)
}

export default function AdminCollegeStudentsPage() {
    const params = useParams()
    const collegeId = typeof params.collegeId === 'string' ? params.collegeId : ''

    const [collegeName, setCollegeName] = useState('')
    const [students, setStudents] = useState<StudentListItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [includeArchived, setIncludeArchived] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [selectedBranch, setSelectedBranch] = useState('all')
    const [selectedYear, setSelectedYear] = useState('all')
    const [selectedDegree, setSelectedDegree] = useState('all')
    const [showFilters, setShowFilters] = useState(false)

    const fetchStudents = useCallback(async () => {
        if (!collegeId) return
        setIsLoading(true)
        setError(null)
        try {
            const response = await lookupAdminService.listCollegeStudents(collegeId, includeArchived)
            setCollegeName(response.college_name)
            setStudents(response.students ?? [])
        } catch (err) {
            console.error('Failed to fetch college students:', err)
            setError('Failed to load students. Please try again.')
            toast.error(getErrorMessage(err))
        } finally {
            setIsLoading(false)
        }
    }, [collegeId, includeArchived])

    useEffect(() => {
        fetchStudents()
    }, [fetchStudents])

    const degrees = useMemo(
        () => degreeOptions.map((option) => option.value),
        []
    )

    const branches = useMemo(
        () =>
            getFilterBranches({
                profileBranch: null,
                selectedDegree,
                availableDegrees: degrees,
            }),
        [selectedDegree, degrees]
    )

    const currentYear = new Date().getFullYear()
    const years = Array.from(
        { length: 2030 - (currentYear - 10) + 1 },
        (_, i) => String(currentYear - 10 + i)
    )
        .filter((year) => Number(year) <= 2030)
        .sort((a, b) => Number(b) - Number(a))

    useEffect(() => {
        if (selectedBranch !== 'all' && !branches.includes(selectedBranch)) {
            setSelectedBranch('all')
        }
    }, [branches, selectedBranch])

    const filteredStudents = students.filter((student) => {
        const matchesSearch =
            searchTerm === '' ||
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.phone && student.phone.includes(searchTerm))

        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'placed' && student.placement_status === 'placed') ||
            (filterStatus === 'unplaced' && student.placement_status === 'unplaced') ||
            (filterStatus === 'inactive' && student.status === 'inactive') ||
            (filterStatus === 'pending' && student.status === 'pending')

        const matchesBranch = selectedBranch === 'all' || student.branch === selectedBranch
        const matchesYear =
            selectedYear === 'all' || String(student.graduation_year) === selectedYear
        const matchesDegree = selectedDegree === 'all' || student.degree === selectedDegree
        const matchesArchiveStatus = includeArchived ? student.is_archived : !student.is_archived

        return (
            matchesSearch &&
            matchesStatus &&
            matchesArchiveStatus &&
            matchesBranch &&
            matchesYear &&
            matchesDegree
        )
    })

    const clearFilters = () => {
        setSearchTerm('')
        setFilterStatus('all')
        setSelectedBranch('all')
        setSelectedYear('all')
        setSelectedDegree('all')
        setIncludeArchived(false)
    }

    const handleDegreeChange = (value: string) => {
        setSelectedDegree(value)
        setSelectedBranch('all')
    }

    const handleExportStudents = () => {
        if (filteredStudents.length === 0) {
            toast.error('No students to export')
            return
        }
        try {
            const safeName = sanitizeFilename(collegeName || 'College')
            const timestamp = new Date().toISOString().split('T')[0]
            exportStudentsToCSV(filteredStudents, {
                filename: `${safeName}_Students_${timestamp}.csv`,
            })
            toast.success(`Exported ${filteredStudents.length} student(s) to CSV`)
        } catch (err) {
            console.error('Failed to export students:', err)
            toast.error('Failed to export students. Please try again.')
        }
    }

    const placedCount = students.filter((s) => s.placement_status === 'placed').length
    const departmentCount = new Set(students.map((s) => s.branch).filter(Boolean)).size
    const displayName = collegeName.replace(/['"]+/g, '').trim()

    return (
        <AdminDashboardLayout>
            <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <Link
                                href="/dashboard/admin/lookups"
                                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-3"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1.5" />
                                Back to lookup tables
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Students — {displayName || 'College'}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                All students registered with this institute (including non-onboarded)
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-900/50">
                                <Calendar className="w-4 h-4" />
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                                <Users className="w-4 h-4" />
                                {students.length.toLocaleString()} Students
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <button
                        onClick={handleExportStudents}
                        className="inline-flex items-center px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </button>
                </div>

                <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <UniversityStatCard
                        label="Total Students"
                        value={students.length}
                        subtitle="All records"
                        icon={Users}
                        accent="blue"
                        index={0}
                    />
                    <UniversityStatCard
                        label="Active Students"
                        value={students.filter((s) => !s.is_archived).length}
                        subtitle="Currently enrolled"
                        icon={UserPlus}
                        accent="green"
                        index={1}
                    />
                    <UniversityStatCard
                        label="Placed Students"
                        value={placedCount}
                        subtitle="Offers accepted"
                        icon={GraduationCap}
                        accent="purple"
                        index={2}
                    />
                    <UniversityStatCard
                        label="Departments"
                        value={departmentCount}
                        subtitle="Unique branches"
                        icon={TrendingUp}
                        accent="orange"
                        index={3}
                    />
                </div>

                <div className="md:hidden grid grid-cols-4 gap-1.5">
                    {[
                        { label: 'Total', value: students.length, accent: 'blue' as const, icon: Users },
                        {
                            label: 'Active',
                            value: students.filter((s) => !s.is_archived).length,
                            accent: 'green' as const,
                            icon: UserPlus,
                        },
                        { label: 'Placed', value: placedCount, accent: 'purple' as const, icon: GraduationCap },
                        { label: 'Depts', value: departmentCount, accent: 'orange' as const, icon: TrendingUp },
                    ].map((stat) => {
                        const tones = STAT_ACCENTS[stat.accent]
                        const Icon = stat.icon
                        return (
                            <div key={stat.label} className={cn('rounded-xl border p-2 min-w-0', tones.card)}>
                                <div className={cn('w-6 h-6 rounded-md flex items-center justify-center mb-1', tones.icon)}>
                                    <Icon className="w-3 h-3" />
                                </div>
                                <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                                    {stat.label}
                                </p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white tabular-nums leading-none">
                                    {stat.value}
                                </p>
                            </div>
                        )
                    })}
                </div>

                <StudentManagementHeader
                    totalStudents={students.length}
                    activeStudents={students.filter((s) => !s.is_archived).length}
                    archivedStudents={students.filter((s) => s.is_archived).length}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    filterStatus={filterStatus}
                    onFilterChange={setFilterStatus}
                    includeArchived={includeArchived}
                    onIncludeArchivedChange={setIncludeArchived}
                    branches={branches}
                    selectedBranch={selectedBranch}
                    onBranchChange={setSelectedBranch}
                    years={years}
                    selectedYear={selectedYear}
                    onYearChange={setSelectedYear}
                    degrees={degrees}
                    selectedDegree={selectedDegree}
                    onDegreeChange={handleDegreeChange}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    onClearFilters={clearFilters}
                />

                <StudentTable
                    students={filteredStudents}
                    isLoading={isLoading}
                    error={error}
                    onArchiveStudent={async () => {}}
                    onDeleteStudent={async () => {}}
                    onRetry={fetchStudents}
                    hasUnfilteredStudents={students.length > 0}
                    onClearFilters={clearFilters}
                    readOnly
                />
            </div>
        </AdminDashboardLayout>
    )
}
