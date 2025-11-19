"use client"

import { useState, useEffect } from 'react'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { UniversityManagementHeader } from '@/components/dashboard/UniversityManagementHeader'
import { UniversityTable } from '@/components/dashboard/UniversityTable'
import { CreateUniversityModal } from '@/components/dashboard/CreateUniversityModal'
import { universityManagementService } from '@/services/universityManagementService'
import { UniversityListResponse, UniversityListItem } from '@/types/university'
import { toast } from 'react-hot-toast'
import { getErrorMessage } from '@/lib/error-handler'
import { motion } from 'framer-motion'
import { Plus, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminUniversities() {
    const [universities, setUniversities] = useState<UniversityListItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [includeArchived, setIncludeArchived] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')

    const fetchUniversities = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await universityManagementService.getUniversities(includeArchived)
            setUniversities(response.universities)
        } catch (err) {
            console.error('Failed to fetch universities:', err)
            setError('Failed to load universities. Please try again.')
            toast.error('Failed to load universities.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUniversities()
    }, [includeArchived])

    const filteredUniversities = universities.filter(university => {
        const matchesSearch = searchTerm === '' ||
            university.university_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            university.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (university.phone && university.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (university.address && university.address.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'verified' && university.verified) ||
            (filterStatus === 'unverified' && !university.verified) ||
            (filterStatus === 'active' && university.status === 'active') ||
            (filterStatus === 'inactive' && university.status === 'inactive')

        return matchesSearch && matchesStatus
    })

    const handleCreateUniversity = async (universityData: any) => {
        try {
            const result = await universityManagementService.createUniversity(universityData)
            toast.success('University created successfully!')
            setShowCreateModal(false)
            fetchUniversities() // Refresh the list
            return result
        } catch (error: any) {
            console.error('Failed to create university:', error)
            toast.error(getErrorMessage(error))
            throw error
        }
    }

    const handleArchiveUniversity = async (universityId: string, archive: boolean) => {
        try {
            await universityManagementService.archiveUniversity(universityId, archive)
            toast.success(`University ${archive ? 'archived' : 'unarchived'} successfully!`)
            fetchUniversities() // Refresh the list
        } catch (error: any) {
            console.error('Failed to archive/unarchive university:', error)
            toast.error(getErrorMessage(error))
        }
    }

    const handleExportUniversities = async () => {
        try {
            // TODO: Implement export functionality
            toast('Export functionality coming soon!')
        } catch (error: any) {
            console.error('Failed to export universities:', error)
            toast.error('Failed to export universities.')
        }
    }

    const handleImportUniversities = async () => {
        try {
            // TODO: Implement import functionality
            toast('Import functionality coming soon!')
        } catch (error: any) {
            console.error('Failed to import universities:', error)
            toast.error('Failed to import universities.')
        }
    }

    return (
        <AdminDashboardLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                University Management 🏛️
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                                Manage universities, verify institutions, and oversee academic partnerships ✨
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                    📊 {universities.length} Total Universities
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                    ✅ {universities.filter(u => u.verified).length} Verified
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                                    👥 {universities.reduce((sum, u) => sum + (u.total_students || 0), 0)} Total Students
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add University</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleExportUniversities}
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium shadow-sm"
                    >
                        <Download className="w-5 h-5" />
                        <span>Export Data</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleImportUniversities}
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium shadow-sm"
                    >
                        <Upload className="w-5 h-5" />
                        <span>Import Data</span>
                    </motion.button>
                </div>

                {/* University Management Header (search, filters) */}
                <UniversityManagementHeader
                    totalUniversities={universities.length}
                    activeUniversities={universities.filter(u => !u.is_archived).length}
                    archivedUniversities={universities.filter(u => u.is_archived).length}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    filterStatus={filterStatus}
                    onFilterChange={setFilterStatus}
                    includeArchived={includeArchived}
                    onIncludeArchivedChange={setIncludeArchived}
                />

                {/* University Table */}
                <UniversityTable
                    universities={filteredUniversities}
                    isLoading={isLoading}
                    error={error}
                    onArchiveUniversity={handleArchiveUniversity}
                    onRetry={fetchUniversities}
                />

                {/* Modals */}
                <CreateUniversityModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateUniversity}
                />
            </div>
        </AdminDashboardLayout>
    )
}


