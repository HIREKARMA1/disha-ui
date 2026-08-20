"use client"

import { useState, useEffect, useMemo } from 'react'
import { UniversityDashboardLayout } from '@/components/dashboard/UniversityDashboardLayout'
import { StudentManagementHeader } from '@/components/dashboard/StudentManagementHeader'
import { StudentTable } from '@/components/dashboard/StudentTable'
import { CreateStudentModal, degreeOptions } from '@/components/dashboard/CreateStudentModal'
import { BulkUploadModal } from '@/components/dashboard/BulkUploadModal'
import { apiClient } from '@/lib/api'
import { StudentListItem } from '@/types/university'
import { toast } from 'react-hot-toast'
import { getErrorMessage } from '@/lib/error-handler'
import { UserPlus, Upload, GraduationCap, TrendingUp, Download, Calendar, Users } from 'lucide-react'
import { exportStudentsToCSV } from '@/utils/exportToExcel'
import {
    getOfferedDegrees,
    getFilterBranches,
} from '@/lib/academicHierarchy'
import { UniversityPageHero } from '@/components/university/ui/UniversityPageHero'
import { UniversityStatCard } from '@/components/university/ui/UniversityStatCard'
import { STAT_ACCENTS } from '@/components/university/ui/university-theme'
import { cn } from '@/lib/utils'

export default function UniversityStudents() {
    const [students, setStudents] = useState<StudentListItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
    const [includeArchived, setIncludeArchived] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [selectedBranch, setSelectedBranch] = useState('all')
    const [selectedYear, setSelectedYear] = useState('all')
    const [selectedDegree, setSelectedDegree] = useState('all')
    const [coursesOffered, setCoursesOffered] = useState<string | null>(null)
    const [profileBranches, setProfileBranches] = useState<string | null>(null)

    const [showFilters, setShowFilters] = useState(false)

    const fetchStudents = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await apiClient.getUniversityStudents(includeArchived)
            const list = Array.isArray(response?.students)
                ? response.students
                : Array.isArray(response)
                    ? response
                    : []
            setStudents(list)
        } catch (err) {
            console.error('Failed to fetch students:', err)
            setError('Failed to load students. Please try again.')
            toast.error('Failed to load students.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchStudents()
    }, [includeArchived])

    useEffect(() => {
        const loadProfileAcademicFilters = async () => {
            try {
                const profile = await apiClient.getUniversityProfile()
                setCoursesOffered(profile?.courses_offered ?? null)
                setProfileBranches(profile?.branch ?? null)
            } catch (err) {
                console.error('Failed to load university profile for filters:', err)
            }
        }
        loadProfileAcademicFilters()
    }, [])

    // Degrees: only profile-offered degrees when configured; otherwise full list
    const offeredDegrees = useMemo(() => getOfferedDegrees(coursesOffered), [coursesOffered])
    const degrees = useMemo(() => {
        if (offeredDegrees.length > 0) return offeredDegrees
        return degreeOptions.map((option) => option.value)
    }, [offeredDegrees])

    // Branches: only profile branches when configured; otherwise full degree-related list
    const branches = useMemo(
        () =>
            getFilterBranches({
                profileBranch: profileBranches,
                selectedDegree,
                availableDegrees: degrees,
            }),
        [profileBranches, selectedDegree, degrees]
    )

    // Year options: previous 10 years through 2030 (inclusive)
    const currentYear = new Date().getFullYear()
    const years = Array.from(
        { length: 2030 - (currentYear - 10) + 1 },
        (_, i) => String(currentYear - 10 + i)
    )
        .filter((year) => Number(year) <= 2030)
        .sort((a, b) => Number(b) - Number(a))

    // Keep branch selection valid when degree changes
    useEffect(() => {
        if (selectedBranch !== 'all' && !branches.includes(selectedBranch)) {
            setSelectedBranch('all')
        }
    }, [branches, selectedBranch])

    // Keep degree selection valid when profile degrees load
    useEffect(() => {
        if (selectedDegree !== 'all' && !degrees.includes(selectedDegree)) {
            setSelectedDegree('all')
        }
    }, [degrees, selectedDegree])

    const filteredStudents = students.filter(student => {
        const matchesSearch = searchTerm === '' ||
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.phone && student.phone.includes(searchTerm))

        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'placed' && student.placement_status === 'placed') ||
            (filterStatus === 'unplaced' && student.placement_status === 'unplaced') ||
            (filterStatus === 'inactive' && student.status === 'inactive') ||
            (filterStatus === 'pending' && student.status === 'pending')

        const matchesBranch = selectedBranch === 'all' || student.branch === selectedBranch
        const matchesYear = selectedYear === 'all' || String(student.graduation_year) === selectedYear
        const matchesDegree = selectedDegree === 'all' || student.degree === selectedDegree

        // Filter by archive status based on includeArchived setting
        const matchesArchiveStatus = includeArchived ? student.is_archived : !student.is_archived

        return matchesSearch && matchesStatus && matchesArchiveStatus && matchesBranch && matchesYear && matchesDegree
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

    const handleCreateStudent = async (studentData: any) => {
        console.log('🎯 handleCreateStudent called with:', studentData)
        try {
            console.log('📡 Making API call to createStudent...')
            const result = await apiClient.createStudent(studentData)
            console.log('✅ API call successful:', result)
            toast.success('Student created successfully!')
            // Don't close modal here - let the modal handle its own success state
            fetchStudents()
            return result
        } catch (err: any) {
            console.error('❌ Failed to create student:', err)
            const errorMessage = getErrorMessage(err, 'Failed to create student')
            toast.error(errorMessage)
            throw err
        }
    }

    const handleBulkUpload = async (file: File) => {
        try {
            await apiClient.uploadStudentsCSV(file)
            toast.success('Bulk upload successful!')
            setShowBulkUploadModal(false)
            fetchStudents()
        } catch (err: any) {
            console.error('Failed to bulk upload students:', err)
            const errorMessage = getErrorMessage(err, 'Failed to bulk upload students')
            toast.error(errorMessage)
        }
    }

    const handleArchiveStudent = async (studentId: string, archive: boolean) => {
        try {
            await apiClient.archiveStudent(studentId, archive)
            toast.success(`Student ${archive ? 'archived' : 'unarchived'} successfully!`)
            fetchStudents()
        } catch (err: any) {
            console.error(`Failed to ${archive ? 'archive' : 'unarchive'} student:`, err)
            toast.error(err.response?.data?.detail || `Failed to ${archive ? 'archive' : 'unarchive'} student.`)
        }
    }

    const handleExportStudents = () => {
        if (filteredStudents.length === 0) {
            toast.error('No students to export')
            return
        }
        try {
            exportStudentsToCSV(filteredStudents)
            toast.success(`Exported ${filteredStudents.length} student(s) to CSV`)
        } catch (err) {
            console.error('Failed to export students:', err)
            toast.error('Failed to export students. Please try again.')
        }
    }

    const handleDeleteStudent = async (studentId: string) => {
        try {
            await apiClient.deleteStudent(studentId)
            toast.success('Student deleted successfully!')
            fetchStudents()
        } catch (err: any) {
            console.error('Failed to delete student:', err)
            toast.error(err.response?.data?.detail || 'Failed to delete student.')
        }
    }


    const placedCount = students.filter((s) => s.placement_status === 'placed').length
    const departmentCount = new Set(students.map((s) => s.branch).filter(Boolean)).size

    return (
        <UniversityDashboardLayout>
            <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto">
                <UniversityPageHero
                    title="Student Management 🎓"
                    subtitle="Manage and view student profiles for your university"
                    chips={[
                        {
                            label: new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                            }),
                            tone: 'blue',
                            icon: <Calendar className="w-3.5 h-3.5" />,
                        },
                        {
                            label: 'University',
                            tone: 'teal',
                            icon: <GraduationCap className="w-3.5 h-3.5" />,
                        },
                        {
                            label: `${students.length.toLocaleString()} Students`,
                            tone: 'purple',
                            icon: <Users className="w-3.5 h-3.5" />,
                        },
                        {
                            label: 'Placement Hub',
                            tone: 'orange',
                            icon: <TrendingUp className="w-3.5 h-3.5" />,
                        },
                    ]}
                />

                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Student
                    </button>
                    <button
                        onClick={() => setShowBulkUploadModal(true)}
                        className="inline-flex items-center px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-colors"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Bulk Upload
                    </button>
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
                        { label: 'Active', value: students.filter((s) => !s.is_archived).length, accent: 'green' as const, icon: UserPlus },
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
                                <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">{stat.label}</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white tabular-nums leading-none">
                                    {stat.value}
                                </p>
                            </div>
                        )
                    })}
                </div>

                <StudentManagementHeader
                    totalStudents={students.length}
                    activeStudents={students.filter(s => !s.is_archived).length}
                    archivedStudents={students.filter(s => s.is_archived).length}
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
                    onAddStudent={() => setShowCreateModal(true)}
                    onBulkUpload={() => setShowBulkUploadModal(true)}
                />

                {/* Student Table */}
                <StudentTable
                    students={filteredStudents}
                    isLoading={isLoading}
                    error={error}
                    onArchiveStudent={handleArchiveStudent}
                    onDeleteStudent={handleDeleteStudent}
                    onRetry={fetchStudents}
                    hasUnfilteredStudents={students.length > 0}
                    onClearFilters={clearFilters}
                />

                {/* Modals */}
                <CreateStudentModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateStudent}
                />
                <BulkUploadModal
                    isOpen={showBulkUploadModal}
                    onClose={() => setShowBulkUploadModal(false)}
                    onSubmit={handleBulkUpload}
                    mode="students"
                />
            </div>
        </UniversityDashboardLayout>
    )
}

