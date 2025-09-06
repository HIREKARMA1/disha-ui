"use client"

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    MoreVertical,
    Archive,
    User,
    Mail,
    Phone,
    GraduationCap,
    Briefcase,
    Calendar,
    Star,
    Eye,
    EyeOff,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown
} from 'lucide-react'
import { StudentListItem } from '@/types/university'
import { ArchiveConfirmationModal } from './ArchiveConfirmationModal'
import StudentProfileModal from './StudentProfileModal'

interface StudentTableProps {
    students: StudentListItem[]
    isLoading: boolean
    error: string | null
    onArchiveStudent: (studentId: string, archive: boolean) => void
    onRetry: () => void
}

type SortField = 'name' | 'email' | 'phone' | 'degree' | 'branch' | 'placement_status' | 'total_applications' | 'interviews_attended' | 'offers_received' | 'profile_completion_percentage' | 'created_at'
type SortDirection = 'asc' | 'desc' | null

export function StudentTable({
    students,
    isLoading,
    error,
    onArchiveStudent,
    onRetry
}: StudentTableProps) {
    const [sortField, setSortField] = useState<SortField | null>('created_at')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    // Archive confirmation modal state
    const [showArchiveModal, setShowArchiveModal] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string; isArchived: boolean } | null>(null)
    const [isArchiveLoading, setIsArchiveLoading] = useState(false)

    // Profile modal state
    const [showProfileModal, setShowProfileModal] = useState(false)
    const [selectedProfileStudent, setSelectedProfileStudent] = useState<StudentListItem | null>(null)
    const [fullProfileData, setFullProfileData] = useState<any>(null)
    const [isLoadingProfile, setIsLoadingProfile] = useState(false)

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'placed':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
            case 'unplaced':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }
    }

    // Row color function - alternating transparent cool colors
    const getRowColor = (index: number) => {
        const colors = [
            'bg-blue-50/30 dark:bg-blue-900/10', // Light blue
            'bg-green-50/30 dark:bg-green-900/10', // Light green
            'bg-purple-50/30 dark:bg-purple-900/10', // Light purple
            'bg-orange-50/30 dark:bg-orange-900/10', // Light orange
        ]
        return colors[index % colors.length]
    }

    // Sorting function
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            // Cycle through: asc -> desc -> null
            if (sortDirection === 'asc') {
                setSortDirection('desc')
            } else if (sortDirection === 'desc') {
                setSortDirection(null)
                setSortField(null)
            } else {
                setSortDirection('asc')
            }
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
        setCurrentPage(1) // Reset to first page when sorting
    }

    // Get sort icon
    const getSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <ChevronsUpDown className="w-4 h-4 text-gray-400" />
        }
        if (sortDirection === 'asc') {
            return <ChevronUp className="w-4 h-4 text-primary-600" />
        }
        if (sortDirection === 'desc') {
            return <ChevronDown className="w-4 h-4 text-primary-600" />
        }
        return <ChevronsUpDown className="w-4 h-4 text-gray-400" />
    }

    // Sort and paginate data
    const { sortedStudents, totalPages, paginatedStudents } = useMemo(() => {
        let sorted = [...students]

        // Apply sorting
        if (sortField && sortDirection) {
            sorted.sort((a, b) => {
                let aValue: any = a[sortField]
                let bValue: any = b[sortField]

                // Handle numeric fields
                if (['total_applications', 'interviews_attended', 'offers_received', 'profile_completion_percentage'].includes(sortField)) {
                    aValue = Number(aValue) || 0
                    bValue = Number(bValue) || 0
                } else if (sortField === 'created_at') {
                    // Handle date fields
                    aValue = new Date(aValue || 0).getTime()
                    bValue = new Date(bValue || 0).getTime()
                } else {
                    // Handle string fields
                    aValue = String(aValue || '').toLowerCase()
                    bValue = String(bValue || '').toLowerCase()
                }

                if (sortDirection === 'asc') {
                    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
                } else {
                    return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
                }
            })
        }

        // Calculate pagination
        const totalPages = Math.ceil(sorted.length / itemsPerPage)
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        const paginatedStudents = sorted.slice(startIndex, endIndex)

        return { sortedStudents: sorted, totalPages, paginatedStudents }
    }, [students, sortField, sortDirection, currentPage, itemsPerPage])

    // Archive modal handlers
    const handleArchiveClick = (student: StudentListItem) => {
        setSelectedStudent({
            id: student.id,
            name: student.name,
            isArchived: student.is_archived
        })
        setShowArchiveModal(true)
    }

    const handleArchiveConfirm = async () => {
        if (!selectedStudent) return

        setIsArchiveLoading(true)
        try {
            await onArchiveStudent(selectedStudent.id, !selectedStudent.isArchived)
            setShowArchiveModal(false)
            setSelectedStudent(null)
        } catch (error) {
            console.error('Failed to archive/unarchive student:', error)
            // Don't close modal on error, let user retry
        } finally {
            setIsArchiveLoading(false)
        }
    }

    const handleArchiveCancel = () => {
        setShowArchiveModal(false)
        setSelectedStudent(null)
    }

    // Profile modal handlers
    const handleRowClick = (student: StudentListItem) => {
        // console.log('Opening profile modal for student:', student)
        // console.log('Available student fields:', Object.keys(student))
        // console.log('Technical skills:', student.technical_skills)
        // console.log('Profile picture:', student.profile_picture)
        setSelectedProfileStudent(student)
        setShowProfileModal(true)
        setIsLoadingProfile(false)

        // Create profile data from existing student data
        // In a real implementation, you would fetch the full profile data from the API
        const studentWithExtendedData = student as any // Type assertion for extended fields

        const fullProfile = {
            // Use existing data from student
            ...student,
            // Use actual student data or empty strings (no sample data)
            soft_skills: studentWithExtendedData.soft_skills || '',
            certifications: studentWithExtendedData.certifications || '',
            preferred_industry: studentWithExtendedData.preferred_industry || '',
            job_roles_of_interest: studentWithExtendedData.job_roles_of_interest || '',
            location_preferences: studentWithExtendedData.location_preferences || '',
            language_proficiency: studentWithExtendedData.language_proficiency || '',
            internship_experience: studentWithExtendedData.internship_experience || '',
            project_details: studentWithExtendedData.project_details || '',
            extracurricular_activities: studentWithExtendedData.extracurricular_activities || '',
            linkedin_profile: studentWithExtendedData.linkedin_profile || '',
            github_profile: studentWithExtendedData.github_profile || '',
            personal_website: studentWithExtendedData.personal_website || '',
            resume: studentWithExtendedData.resume || '',
            tenth_certificate: studentWithExtendedData.tenth_certificate || '',
            twelfth_certificate: studentWithExtendedData.twelfth_certificate || '',
            internship_certificates: studentWithExtendedData.internship_certificates || '',
            profile_picture: studentWithExtendedData.profile_picture || '',
            // Ensure all required fields are present
            email_verified: studentWithExtendedData.email_verified || false,
            phone_verified: studentWithExtendedData.phone_verified || false,
            status: studentWithExtendedData.status || 'active',
            created_at: student.created_at || new Date().toISOString(),
            profile_completion_percentage: student.profile_completion_percentage || 0
        }

        setFullProfileData(fullProfile)
    }

    const handleProfileModalClose = () => {
        setShowProfileModal(false)
        setSelectedProfileStudent(null)
        setFullProfileData(null)
        setIsLoadingProfile(false)
    }

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-center py-12">
                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                    <button
                        onClick={onRetry}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    if (students.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-center py-12">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No students found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Start by adding students to your university.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                                onClick={() => handleSort('name')}
                            >
                                <div className="flex items-center gap-1">
                                    Student
                                    {getSortIcon('name')}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                                onClick={() => handleSort('phone')}
                            >
                                <div className="flex items-center gap-1">
                                    Contact
                                    {getSortIcon('phone')}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                                onClick={() => handleSort('degree')}
                            >
                                <div className="flex items-center gap-1">
                                    Academic
                                    {getSortIcon('degree')}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                                onClick={() => handleSort('placement_status')}
                            >
                                <div className="flex items-center gap-1">
                                    Placement
                                    {getSortIcon('placement_status')}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                                onClick={() => handleSort('total_applications')}
                            >
                                <div className="flex items-center gap-1">
                                    Applications
                                    {getSortIcon('total_applications')}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                                onClick={() => handleSort('profile_completion_percentage')}
                            >
                                <div className="flex items-center gap-1">
                                    Status
                                    {getSortIcon('profile_completion_percentage')}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                                onClick={() => handleSort('created_at')}
                            >
                                <div className="flex items-center gap-1">
                                    Created
                                    {getSortIcon('created_at')}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedStudents.map((student, index) => (
                            <motion.tr
                                key={student.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className={`${getRowColor(index)} hover:bg-opacity-50 transition-colors duration-200 cursor-pointer`}
                                onClick={() => handleRowClick(student)}
                            >
                                {/* Student Info */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                                <User className="w-5 h-5 text-primary-600" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {student.name}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {student.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Contact */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">
                                        <div className="flex items-center gap-1 mb-1">
                                            <Phone className="w-3 h-3 text-gray-400" />
                                            {student.phone || 'N/A'}
                                        </div>
                                    </div>
                                </td>

                                {/* Academic */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">
                                        <div className="flex items-center gap-1 mb-1">
                                            <GraduationCap className="w-3 h-3 text-gray-400" />
                                            {student.degree || 'N/A'}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {student.branch || 'N/A'}
                                        </div>
                                        {student.btech_cgpa && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <Star className="w-3 h-3 text-yellow-500" />
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    CGPA: {student.btech_cgpa}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </td>

                                {/* Placement */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.placement_status)}`}>
                                            {student.placement_status}
                                        </span>
                                        {student.placed_company && (
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {student.placed_company}
                                            </div>
                                        )}
                                        {student.package && (
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                ₹{student.package.toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </td>

                                {/* Applications */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">
                                        <div className="flex items-center gap-1 mb-1">
                                            <Briefcase className="w-3 h-3 text-gray-400" />
                                            {student.total_applications} applied
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {student.interviews_attended} interviews
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {student.offers_received} offers
                                        </div>
                                    </div>
                                </td>

                                {/* Status */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">
                                        <div className="flex items-center gap-2">
                                            {student.is_archived ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                                                    <Archive className="w-3 h-3" />
                                                    Archived
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                                                    <Eye className="w-3 h-3" />
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {Math.round(student.profile_completion_percentage)}% complete
                                        </div>
                                    </div>
                                </td>

                                {/* Created Date */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">
                                        <div className="flex items-center gap-1 mb-1">
                                            <Calendar className="w-3 h-3 text-gray-400" />
                                            {student.created_at ? formatDate(student.created_at) : 'N/A'}
                                        </div>
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleArchiveClick(student)
                                            }}
                                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${student.is_archived
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300'
                                                : 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-300'
                                                }`}
                                        >
                                            {student.is_archived ? (
                                                <>
                                                    <Eye className="w-3 h-3" />
                                                    Unarchive
                                                </>
                                            ) : (
                                                <>
                                                    <Archive className="w-3 h-3" />
                                                    Archive
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Showing{' '}
                                <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                                {' '}to{' '}
                                <span className="font-medium">
                                    {Math.min(currentPage * itemsPerPage, sortedStudents.length)}
                                </span>
                                {' '}of{' '}
                                <span className="font-medium">{sortedStudents.length}</span>
                                {' '}results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronDown className="h-5 w-5 rotate-90" aria-hidden="true" />
                                </button>

                                {/* Page numbers */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                    // Show first page, last page, current page, and pages around current page
                                    if (
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                                                    ? 'z-10 bg-primary-50 dark:bg-primary-900/20 border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-300'
                                                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    } else if (
                                        page === currentPage - 2 ||
                                        page === currentPage + 2
                                    ) {
                                        return (
                                            <span
                                                key={page}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                ...
                                            </span>
                                        )
                                    }
                                    return null
                                })}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronDown className="h-5 w-5 -rotate-90" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Archive Confirmation Modal */}
            <ArchiveConfirmationModal
                isOpen={showArchiveModal}
                onClose={handleArchiveCancel}
                onConfirm={handleArchiveConfirm}
                studentName={selectedStudent?.name || ''}
                isArchiving={selectedStudent ? !selectedStudent.isArchived : true}
                isLoading={isArchiveLoading}
            />

            {/* Student Profile Modal */}
            {showProfileModal && selectedProfileStudent && (
                <div>
                    {(() => {
                        try {
                            return (
                                <StudentProfileModal
                                    isOpen={showProfileModal}
                                    onClose={handleProfileModalClose}
                                    student={selectedProfileStudent}
                                    fullProfile={fullProfileData}
                                    isLoading={isLoadingProfile}
                                />
                            )
                        } catch (error) {
                            console.error('Error rendering StudentProfileModal:', error)
                            return (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                            Error Loading Profile
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                            There was an error loading the student profile modal.
                                        </p>
                                        <button
                                            onClick={handleProfileModalClose}
                                            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )
                        }
                    })()}
                </div>
            )}
        </div>
    )
}
