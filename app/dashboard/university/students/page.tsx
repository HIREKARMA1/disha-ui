"use client"

import { useState, useEffect } from 'react'
import { UniversityDashboardLayout } from '@/components/dashboard/UniversityDashboardLayout'
import { StudentManagementHeader } from '@/components/dashboard/StudentManagementHeader'
import { StudentTable } from '@/components/dashboard/StudentTable'
import { CreateStudentModal, degreeOptions } from '@/components/dashboard/CreateStudentModal'
import { useBranches } from '@/hooks/useLookup'
import { BulkUploadModal } from '@/components/dashboard/BulkUploadModal'
import { apiClient } from '@/lib/api'
import { StudentListItem } from '@/types/university'
import { toast } from 'react-hot-toast'
import { getErrorMessage } from '@/lib/error-handler'
import { UserPlus, Upload, GraduationCap, TrendingUp, Download, Calendar, Users } from 'lucide-react'
import { exportStudentsToCSV } from '@/utils/exportToExcel'
import { CorporatePageHero } from '@/components/corporate/ui/CorporatePageHero'
import { Button } from '@/components/ui/button'

export default function UniversityStudents() {
    const { data: branchLookup } = useBranches({ limit: 1000 })
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

    const [showFilters, setShowFilters] = useState(false)
    const [instituteType, setInstituteType] = useState<string | null>(null)

    useEffect(() => {
        const loadInstituteType = async () => {
            try {
                const profile = await apiClient.getUniversityProfile()
                if (profile?.institute_type) {
                    setInstituteType(String(profile.institute_type))
                }
            } catch {
                // optional chip — ignore
            }
        }
        loadInstituteType()
    }, [])

    const fetchStudents = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await apiClient.getUniversityStudents(includeArchived)
            setStudents(response.students)
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

    const branches = branchLookup.map((option) => option.name)
    const degrees = degreeOptions.map(option => option.value)

    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 21 }, (_, i) => String(currentYear - 10 + i)).sort((a, b) => Number(b) - Number(a))

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

        const matchesArchiveStatus = includeArchived ? student.is_archived : !student.is_archived

        return matchesSearch && matchesStatus && matchesArchiveStatus && matchesBranch && matchesYear && matchesDegree
    })

    const placedStudents = students.filter(s => s.placement_status === 'placed').length
    const departmentCount = new Set(students.map(s => s.branch).filter(Boolean)).size

    const clearFilters = () => {
        setSearchTerm('')
        setFilterStatus('all')
        setSelectedBranch('all')
        setSelectedYear('all')
        setSelectedDegree('all')
        setIncludeArchived(false)
    }

    const handleCreateStudent = async (studentData: any) => {
        console.log('🎯 handleCreateStudent called with:', studentData)
        try {
            console.log('📡 Making API call to createStudent...')
            const result = await apiClient.createStudent(studentData)
            console.log('✅ API call successful:', result)
            toast.success('Student created successfully!')
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

    const dateLabel = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    })

    return (
        <UniversityDashboardLayout>
            <div className="space-y-4 md:space-y-6 main-content max-w-[1400px] mx-auto">
                <CorporatePageHero
                    title="Student Management"
                    subtitle="Manage and view student profiles for your university"
                    chips={[
                        {
                            label: dateLabel,
                            tone: 'blue',
                            icon: <Calendar className="w-3.5 h-3.5" />,
                        },
                        ...(instituteType
                            ? [
                                  {
                                      label: instituteType,
                                      tone: 'green' as const,
                                      icon: <GraduationCap className="w-3.5 h-3.5" />,
                                  },
                              ]
                            : []),
                        {
                            label: `${students.length} Total Students`,
                            tone: 'purple',
                            icon: <Users className="w-3.5 h-3.5" />,
                        },
                        {
                            label: 'Placement Hub',
                            tone: 'orange',
                            icon: <TrendingUp className="w-3.5 h-3.5" />,
                        },
                    ]}
                    actions={
                        <div className="flex flex-wrap gap-2">
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                className="h-10 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white shadow-lg shadow-blue-500/20"
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add Student
                            </Button>
                            <Button
                                onClick={() => setShowBulkUploadModal(true)}
                                className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Bulk Upload
                            </Button>
                            <Button
                                onClick={handleExportStudents}
                                className="h-10 rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-md"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export CSV
                            </Button>
                        </div>
                    }
                />

                <StudentManagementHeader
                    totalStudents={students.length}
                    activeStudents={students.filter(s => !s.is_archived).length}
                    placedStudents={placedStudents}
                    departmentCount={departmentCount}
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
                    onDegreeChange={setSelectedDegree}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    onClearFilters={clearFilters}
                />

                <StudentTable
                    students={filteredStudents}
                    isLoading={isLoading}
                    error={error}
                    onArchiveStudent={handleArchiveStudent}
                    onDeleteStudent={handleDeleteStudent}
                    onRetry={fetchStudents}
                />

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
