"use client"

import { useState, useEffect } from 'react'
import { UniversityDashboardLayout } from '@/components/dashboard/UniversityDashboardLayout'
import { StudentManagementHeader } from '@/components/dashboard/StudentManagementHeader'
import { StudentTable } from '@/components/dashboard/StudentTable'
import { CreateStudentModal, degreeOptions, branchOptions } from '@/components/dashboard/CreateStudentModal'
import { BulkUploadModal } from '@/components/dashboard/BulkUploadModal'
import { apiClient } from '@/lib/api'
import { StudentListResponse, StudentListItem } from '@/types/university'
import { toast } from 'react-hot-toast'
import { getErrorMessage } from '@/lib/error-handler'
import { motion } from 'framer-motion'
import { UserPlus, Upload, Users, GraduationCap, TrendingUp } from 'lucide-react'

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

    const [showFilters, setShowFilters] = useState(false)

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

    // Use predefined options for branches and degrees
    const branches = branchOptions.map(option => option.value)
    const degrees = degreeOptions.map(option => option.value)

    // Generate year options: previous 10 years + current year + next 10 years
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


    return (
        <UniversityDashboardLayout>
            <div className="space-y-6">
                {/* Header matching dashboard structure exactly */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-700"
                >
                    <div className="flex items-start space-x-4">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Student Management 🎓
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                                Manage and view student profiles for your university
                            </p>

                            {/* Tags matching dashboard structure */}
                            <div className="flex flex-wrap gap-2">
                                <motion.span
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-900/40 transition-colors cursor-pointer"
                                >
                                    🎯 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </motion.span>

                                <motion.span
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
                                >
                                    <GraduationCap className="w-4 h-4 mr-1" />
                                    University
                                </motion.span>



                                <motion.span
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-900/40 transition-colors cursor-pointer"
                                >
                                    <TrendingUp className="w-4 h-4 mr-1" />
                                    Student Hub
                                </motion.span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Student Management Header (now only contains stats, search, filters) */}
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
                />

                {/* Student Table */}
                <StudentTable
                    students={filteredStudents}
                    isLoading={isLoading}
                    error={error}
                    onArchiveStudent={handleArchiveStudent}
                    onDeleteStudent={handleDeleteStudent}
                    onRetry={fetchStudents}
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
                />
            </div>
        </UniversityDashboardLayout>
    )
}

