"use client"

import { useState, useEffect } from 'react'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { StudentManagementHeader } from '@/components/dashboard/StudentManagementHeader'
import { StudentTable } from '@/components/dashboard/StudentTable'
import { CreateStudentModal, degreeOptions, branchOptions } from '@/components/dashboard/CreateStudentModal'
import { BulkUploadModal } from '@/components/dashboard/BulkUploadModal'
import { EditStudentModal, EditStudentFormData } from '@/components/dashboard/EditStudentModal'
import { studentManagementService } from '@/services/studentManagementService'
import { UniversityListItem } from '@/types/university'
import { StudentListItem } from '@/types/university'
import { toast } from 'react-hot-toast'
import { getErrorMessage } from '@/lib/error-handler'
import { motion } from 'framer-motion'
import { UserPlus, Upload, GraduationCap, Download } from 'lucide-react'
import { exportStudentsToCSV } from '@/utils/exportToExcel'

export default function AdminStudentsPage() {
    const [universities, setUniversities] = useState<UniversityListItem[]>([])
    /** '' = All Universities (default); otherwise filter by this university id */
    const [selectedUniversityId, setSelectedUniversityId] = useState<string>('')
    const [students, setStudents] = useState<StudentListItem[]>([])
    const [isLoadingUniversities, setIsLoadingUniversities] = useState(true)
    const [isLoadingStudents, setIsLoadingStudents] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
    const [studentToEdit, setStudentToEdit] = useState<StudentListItem | null>(null)
    const [includeArchived, setIncludeArchived] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [selectedBranch, setSelectedBranch] = useState('all')
    const [selectedYear, setSelectedYear] = useState('all')
    const [selectedDegree, setSelectedDegree] = useState('all')
    const [showFilters, setShowFilters] = useState(false)

    const fetchUniversities = async () => {
        setIsLoadingUniversities(true)
        try {
            const response = await studentManagementService.getUniversities(true)
            setUniversities(response.universities || [])
        } catch (err) {
            console.error('Failed to fetch universities:', err)
            toast.error('Failed to load universities.')
        } finally {
            setIsLoadingUniversities(false)
        }
    }

    const fetchStudents = async () => {
        setIsLoadingStudents(true)
        setError(null)
        try {
            const response = await studentManagementService.getAllStudents(
                selectedUniversityId || undefined,
                includeArchived
            )
            setStudents(response.students || [])
        } catch (err) {
            console.error('Failed to fetch students:', err)
            setError('Failed to load students. Please try again.')
            toast.error('Failed to load students.')
            setStudents([])
        } finally {
            setIsLoadingStudents(false)
        }
    }

    useEffect(() => {
        fetchUniversities()
    }, [])

    useEffect(() => {
        fetchStudents()
    }, [selectedUniversityId, includeArchived])

    const branches = branchOptions.map(option => option.value)
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

    const clearFilters = () => {
        setSearchTerm('')
        setFilterStatus('all')
        setSelectedBranch('all')
        setSelectedYear('all')
        setSelectedDegree('all')
        setIncludeArchived(false)
        setSelectedUniversityId('')
    }

    const handleCreateStudent = async (studentData: any) => {
        if (!selectedUniversityId) {
            toast.error('Please select a university first.')
            throw new Error('No university selected')
        }
        try {
            const result = await studentManagementService.createStudent(selectedUniversityId, studentData)
            toast.success('Student created successfully!')
            fetchStudents()
            return result
        } catch (err: any) {
            const errorMessage = getErrorMessage(err, 'Failed to create student')
            toast.error(errorMessage)
            throw err
        }
    }

    const handleBulkUpload = async (file: File) => {
        if (!selectedUniversityId) {
            toast.error('Please select a university first.')
            return
        }
        try {
            await studentManagementService.uploadStudentsCSV(selectedUniversityId, file)
            toast.success('Bulk upload successful!')
            setShowBulkUploadModal(false)
            fetchStudents()
        } catch (err: any) {
            const errorMessage = getErrorMessage(err, 'Failed to bulk upload students')
            toast.error(errorMessage)
        }
    }

    const handleArchiveStudent = async (studentId: string, archive: boolean) => {
        try {
            await studentManagementService.archiveStudent(studentId, archive)
            toast.success(`Student ${archive ? 'archived' : 'unarchived'} successfully!`)
            fetchStudents()
        } catch (err: any) {
            toast.error(getErrorMessage(err, `Failed to ${archive ? 'archive' : 'unarchive'} student.`))
        }
    }

    const handleDeleteStudent = async (studentId: string) => {
        try {
            await studentManagementService.deleteStudent(studentId)
            toast.success('Student deleted successfully!')
            fetchStudents()
        } catch (err: any) {
            toast.error(getErrorMessage(err, 'Failed to delete student.'))
        }
    }

    const handleEditStudent = (student: StudentListItem) => {
        setStudentToEdit(student)
    }

    const handleSaveEditStudent = async (studentId: string, data: EditStudentFormData) => {
        try {
            await studentManagementService.updateStudent(studentId, data as Record<string, unknown>)
            toast.success('Student updated successfully!')
            setStudentToEdit(null)
            fetchStudents()
        } catch (err: any) {
            toast.error(getErrorMessage(err, 'Failed to update student.'))
            throw err
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
            toast.error('Failed to export students. Please try again.')
        }
    }

    const selectedUniversity = universities.find(u => u.id === selectedUniversityId)

    return (
        <AdminDashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-700">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Student Management 🎓
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                                Manage students across any university. Select a university to view and perform CRUD operations.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200">
                                    🏛️ {universities.length} Universities
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                    👥 {students.length} Students{selectedUniversity ? ` (${selectedUniversity.university_name})` : ' (all)'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <>
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
                            onDegreeChange={setSelectedDegree}
                            showFilters={showFilters}
                            setShowFilters={setShowFilters}
                            onClearFilters={clearFilters}
                            onAddStudent={() => setShowCreateModal(true)}
                            onBulkUpload={() => setShowBulkUploadModal(true)}
                            hideAddAndBulk={true}
                            universityFilter={{
                                universities,
                                selectedUniversityId,
                                onUniversityChange: setSelectedUniversityId,
                                isLoading: isLoadingUniversities
                            }}
                            extraActions={
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleExportStudents}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-sm text-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    Export CSV
                                </motion.button>
                            }
                        />

                        <StudentTable
                            students={filteredStudents}
                            isLoading={isLoadingStudents}
                            error={error}
                            onArchiveStudent={handleArchiveStudent}
                            onDeleteStudent={handleDeleteStudent}
                            onEditStudent={handleEditStudent}
                            hideArchiveAction={true}
                            hidePlacementColumn={true}
                            hideApplicationsColumn={true}
                            showUniversityColumn={true}
                            onRetry={fetchStudents}
                        />
                </>

                <CreateStudentModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateStudent}
                    isAdminMode={true}
                />
                <BulkUploadModal
                    isOpen={showBulkUploadModal}
                    onClose={() => setShowBulkUploadModal(false)}
                    onSubmit={handleBulkUpload}
                    onGetTemplate={selectedUniversityId ? () => studentManagementService.getStudentTemplate(selectedUniversityId) : undefined}
                />
                <EditStudentModal
                    isOpen={!!studentToEdit}
                    onClose={() => setStudentToEdit(null)}
                    student={studentToEdit}
                    onSave={handleSaveEditStudent}
                />
            </div>
        </AdminDashboardLayout>
    )
}
