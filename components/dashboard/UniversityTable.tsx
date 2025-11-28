"use client"

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    MoreVertical,
    Archive,
    Building2,
    Mail,
    Phone,
    MapPin,
    Globe,
    Calendar,
    Star,
    Eye,
    EyeOff,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    Shield,
    GraduationCap,
    Edit,
    Trash2
} from 'lucide-react'
import { UniversityListItem } from '@/types/university'
import { ArchiveConfirmationModal } from './ArchiveConfirmationModal'
import { UniversityProfileModal } from './UniversityProfileModal'
import { StatusDropdown } from './UniversityStatusDropdown'

interface UniversityTableProps {
    universities: UniversityListItem[]
    isLoading: boolean
    error: string | null
    onArchiveUniversity: (universityId: string, archive: boolean) => void
    onDeleteUniversity: (universityId: string) => void
    onEditUniversity: (university: UniversityListItem) => void
    onRetry: () => void
}

type SortField = 'university_name' | 'email' | 'phone' | 'institute_type' | 'verified' | 'status' | 'placement_rate' | 'created_at'
type SortDirection = 'asc' | 'desc' | null

export function UniversityTable({
    universities,
    isLoading,
    error,
    onArchiveUniversity,
    onDeleteUniversity,
    onEditUniversity,
    onRetry
}: UniversityTableProps) {
    const [sortField, setSortField] = useState<SortField | null>('created_at')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    // Archive confirmation modal state
    const [showArchiveModal, setShowArchiveModal] = useState(false)
    const [selectedUniversity, setSelectedUniversity] = useState<{ id: string; name: string; isArchived: boolean } | null>(null)
    const [isArchiveLoading, setIsArchiveLoading] = useState(false)

    // Delete confirmation modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedDeleteUniversity, setSelectedDeleteUniversity] = useState<{ id: string; name: string } | null>(null)
    const [isDeleteLoading, setIsDeleteLoading] = useState(false)

    // Profile modal state
    const [showProfileModal, setShowProfileModal] = useState(false)
    const [selectedProfileUniversity, setSelectedProfileUniversity] = useState<UniversityListItem | null>(null)
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
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
            case 'inactive':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
            case 'pending':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
            case 'suspended':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }
    }

    const getVerifiedColor = (verified: boolean) => {
        return verified
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
    }

    // Check if university is new (show badge for newly created universities that haven't been modified by admin)
    // Badge disappears when admin updates the university (status change, profile edit, etc.)
    const isNewUniversity = (university: UniversityListItem) => {
        // Strategy: Show "New" badge if the university was created recently AND hasn't been modified by admin yet
        // We detect "not modified" by checking if updated_at is either:
        // 1. null/undefined (never updated)
        // 2. Same as or very close to created_at (within 5 seconds - accounts for database timestamp precision)
        
        if (!university.created_at) {
            return false // Can't determine if new without created_at
        }
        
        const createdTime = new Date(university.created_at).getTime()
        const now = Date.now()
        const twentyFourHours = 24 * 60 * 60 * 1000
        
        // Only consider universities created in the last 24 hours as potentially "new"
        const isRecentlyCreated = (now - createdTime) < twentyFourHours
        if (!isRecentlyCreated) {
            return false
        }
        
        // Check if the university has been modified after creation
        if (!university.updated_at) {
            // Never updated - definitely new
            return true
        }
        
        // If updated_at exists, check if it's essentially the same as created_at
        // (within 5 seconds to account for database operations during creation)
        const updatedTime = new Date(university.updated_at).getTime()
        const timeDiff = Math.abs(updatedTime - createdTime)
        
        // If time difference is less than 5 seconds, consider it as "not manually updated"
        // This handles both admin-created (ACTIVE) and self-signup (INACTIVE) universities
        return timeDiff < 5000
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
    const { sortedUniversities, totalPages, paginatedUniversities } = useMemo(() => {
        let sorted = [...universities]

        // Apply sorting
        if (sortField && sortDirection) {
            sorted.sort((a, b) => {
                let aValue: any = a[sortField]
                let bValue: any = b[sortField]

                // Handle numeric fields
                if (['placement_rate', 'average_package'].includes(sortField)) {
                    aValue = Number(aValue) || 0
                    bValue = Number(bValue) || 0
                } else if (sortField === 'created_at') {
                    // Handle date fields
                    aValue = new Date(aValue || 0).getTime()
                    bValue = new Date(bValue || 0).getTime()
                } else if (sortField === 'verified') {
                    // Handle boolean fields
                    aValue = a.verified ? 1 : 0
                    bValue = b.verified ? 1 : 0
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
        const paginatedUniversities = sorted.slice(startIndex, endIndex)

        return { sortedUniversities: sorted, totalPages, paginatedUniversities }
    }, [universities, sortField, sortDirection, currentPage, itemsPerPage])

    // Archive modal handlers
    const handleArchiveClick = (university: UniversityListItem) => {
        setSelectedUniversity({
            id: university.id,
            name: university.university_name,
            isArchived: university.is_archived
        })
        setShowArchiveModal(true)
    }

    const handleArchiveConfirm = async () => {
        if (!selectedUniversity) return

        setIsArchiveLoading(true)
        try {
            await onArchiveUniversity(selectedUniversity.id, !selectedUniversity.isArchived)
            setShowArchiveModal(false)
            setSelectedUniversity(null)
        } catch (error) {
            console.error('Failed to archive/unarchive university:', error)
            // Don't close modal on error, let user retry
        } finally {
            setIsArchiveLoading(false)
        }
    }

    const handleArchiveCancel = () => {
        setShowArchiveModal(false)
        setSelectedUniversity(null)
    }

    // Delete modal handlers
    const handleDeleteClick = (university: UniversityListItem) => {
        setSelectedDeleteUniversity({
            id: university.id,
            name: university.university_name
        })
        setShowDeleteModal(true)
    }

    const handleDeleteConfirm = async () => {
        if (!selectedDeleteUniversity) return

        setIsDeleteLoading(true)
        try {
            await onDeleteUniversity(selectedDeleteUniversity.id)
            setShowDeleteModal(false)
            setSelectedDeleteUniversity(null)
        } catch (error) {
            console.error('Failed to delete university:', error)
            // Don't close modal on error, let user retry
        } finally {
            setIsDeleteLoading(false)
        }
    }

    const handleDeleteCancel = () => {
        setShowDeleteModal(false)
        setSelectedDeleteUniversity(null)
    }

    // Profile modal handlers
    const handleRowClick = (university: UniversityListItem) => {
        setSelectedProfileUniversity(university)
        setShowProfileModal(true)
        setIsLoadingProfile(false)

        // Create profile data from existing university data
        const fullProfile = {
            ...university,
            // Additional fields that might be needed for the profile modal
            name: university.university_name,
            bio: university.bio || '',
            profile_picture: university.profile_picture || '',
            email_verified: university.email_verified || false,
            phone_verified: university.phone_verified || false,
            status: university.status || 'active'
        }

        setFullProfileData(fullProfile)
    }

    const handleProfileClose = () => {
        setShowProfileModal(false)
        setSelectedProfileUniversity(null)
        setFullProfileData(null)
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading universities...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-8 text-center">
                    <div className="text-red-500 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Universities</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={onRetry}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    // Empty state
    if (universities.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-8 text-center">
                    <div className="text-gray-400 mb-4">
                        <Building2 className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Universities Found</h3>
                    <p className="text-gray-600 dark:text-gray-400">There are no universities to display at the moment.</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Table Header */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th
                                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                                    onClick={() => handleSort('university_name')}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>University</span>
                                        {getSortIcon('university_name')}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                                    onClick={() => handleSort('email')}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Contact</span>
                                        {getSortIcon('email')}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                                    onClick={() => handleSort('institute_type')}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Type</span>
                                        {getSortIcon('institute_type')}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                                    onClick={() => handleSort('verified')}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Verification</span>
                                        {getSortIcon('verified')}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                                    onClick={() => handleSort('total_students')}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Students</span>
                                        {getSortIcon('total_students')}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                                    onClick={() => handleSort('created_at')}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Created</span>
                                        {getSortIcon('created_at')}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                                    onClick={() => handleSort('status')}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Status</span>
                                        {getSortIcon('status')}
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedUniversities.map((university, index) => (
                                <motion.tr
                                    key={university.id}
                                    className={`${getRowColor(index)} hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    onClick={() => handleRowClick(university)}
                                >
                                    {/* University Name */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                                    <Building2 className="h-5 w-5 text-white" />
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {university.university_name}
                                                    </div>
                                                    {isNewUniversity(university) && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-500 to-purple-600 text-white animate-pulse">
                                                            New
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {university.institute_type}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Contact Info */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="space-y-1">
                                            <div className="flex items-center text-sm text-gray-900 dark:text-white">
                                                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                                {university.email}
                                            </div>
                                            {university.phone && (
                                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                                    {university.phone}
                                                </div>
                                            )}
                                            {university.address && (
                                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="truncate max-w-[200px]">{university.address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Institute Type */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <GraduationCap className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-900 dark:text-white">
                                                {university.institute_type}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Verification Status */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVerifiedColor(university.verified)}`}>
                                            <Shield className="h-3 w-3 mr-1" />
                                            {university.verified ? 'Verified' : 'Unverified'}
                                        </span>
                                    </td>

                                    {/* Student Count */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Users className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-900 dark:text-white">
                                                {university.total_students || 0}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Created Date */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            {formatDate(university.created_at)}
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                        <StatusDropdown
                                            universityId={university.id}
                                            currentStatus={university.status}
                                            onStatusChange={onRetry}
                                        />
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onEditUniversity(university)
                                                }}
                                                className="p-2 rounded-lg transition-colors duration-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                title="Edit University"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleArchiveClick(university)
                                                }}
                                                className={`p-2 rounded-lg transition-colors duration-200 ${university.is_archived
                                                    ? 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                    : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                                    }`}
                                                title={university.is_archived ? 'Unarchive University' : 'Archive University'}
                                            >
                                                {university.is_archived ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteClick(university)
                                                }}
                                                className="p-2 rounded-lg transition-colors duration-200 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                title="Delete University"
                                            >
                                                <Trash2 className="h-4 w-4" />
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
                    <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Showing{' '}
                                        <span className="font-medium">
                                            {(currentPage - 1) * itemsPerPage + 1}
                                        </span>{' '}
                                        to{' '}
                                        <span className="font-medium">
                                            {Math.min(currentPage * itemsPerPage, universities.length)}
                                        </span>{' '}
                                        of{' '}
                                        <span className="font-medium">{universities.length}</span>{' '}
                                        results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                                                    ? 'z-10 bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-600 dark:text-primary-400'
                                                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Archive Confirmation Modal */}
            <ArchiveConfirmationModal
                isOpen={showArchiveModal}
                onClose={handleArchiveCancel}
                onConfirm={() => {
                    handleArchiveConfirm()
                }}
                isLoading={isArchiveLoading}
                studentName={selectedUniversity?.name || ''}
                isArchiving={!selectedUniversity?.isArchived}
            />

            {/* University Profile Modal */}
            <UniversityProfileModal
                isOpen={showProfileModal}
                onClose={handleProfileClose}
                university={selectedProfileUniversity}
                fullProfile={fullProfileData}
                isLoading={isLoadingProfile}
            />

            {/* Delete Confirmation Modal */}
            <UniversityDeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                universityName={selectedDeleteUniversity?.name || ''}
                isDeleting={isDeleteLoading}
            />
        </>
    )
}


