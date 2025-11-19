"use client"

import { useState, useEffect } from 'react'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { CorporateManagementHeader } from '@/components/dashboard/CorporateManagementHeader'
import { CorporateTable } from '@/components/dashboard/CorporateTable'
import { CreateCorporateModal } from '@/components/dashboard/CreateCorporateModal'
import { EditCorporateModal } from '@/components/dashboard/EditCorporateModal'
import { corporateManagementService } from '@/services/corporateManagementService'
import { CorporateListResponse, CorporateListItem, CorporateProfile, UpdateCorporateRequest } from '@/types/corporate'
import { toast } from 'react-hot-toast'
import { getErrorMessage } from '@/lib/error-handler'
import { motion } from 'framer-motion'
import { Plus, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminCorporates() {
    const [corporates, setCorporates] = useState<CorporateListItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedCorporate, setSelectedCorporate] = useState<CorporateProfile | null>(null)
    const [includeArchived, setIncludeArchived] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')

    const fetchCorporates = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await corporateManagementService.getCorporates(includeArchived)
            setCorporates(response.corporates)
        } catch (err) {
            console.error('Failed to fetch corporates:', err)
            setError('Failed to load corporates. Please try again.')
            toast.error('Failed to load corporates.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchCorporates()
    }, [includeArchived])

    const filteredCorporates = corporates.filter(corporate => {
        const matchesSearch = searchTerm === '' ||
            corporate.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            corporate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (corporate.phone && corporate.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (corporate.address && corporate.address.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'verified' && corporate.verified) ||
            (filterStatus === 'unverified' && !corporate.verified) ||
            (filterStatus === 'active' && corporate.status === 'active') ||
            (filterStatus === 'inactive' && corporate.status === 'inactive')

        return matchesSearch && matchesStatus
    })

    const handleCreateCorporate = async (corporateData: any) => {
        try {
            const result = await corporateManagementService.createCorporate(corporateData)
            toast.success('Corporate created successfully!')
            setShowCreateModal(false)
            fetchCorporates() // Refresh the list
            return result
        } catch (error: any) {
            console.error('Failed to create corporate:', error)
            toast.error(getErrorMessage(error))
            throw error
        }
    }

    const handleArchiveCorporate = async (corporateId: string, archive: boolean) => {
        try {
            await corporateManagementService.archiveCorporate(corporateId, archive)
            toast.success(`Corporate ${archive ? 'archived' : 'unarchived'} successfully!`)
            fetchCorporates() // Refresh the list
        } catch (error: any) {
            console.error('Failed to archive/unarchive corporate:', error)
            toast.error(getErrorMessage(error))
        }
    }

    const handleDeleteCorporate = async (corporateId: string) => {
        try {
            await corporateManagementService.deleteCorporate(corporateId)
            toast.success('Corporate and all associated data deleted successfully!')
            fetchCorporates() // Refresh the list
        } catch (error: any) {
            console.error('Failed to delete corporate:', error)
            toast.error(getErrorMessage(error))
            throw error // Re-throw to let the modal handle it
        }
    }

    const handleEditCorporate = async (corporate: CorporateListItem) => {
        try {
            // Fetch full corporate profile
            const profile = await corporateManagementService.getCorporateProfile(corporate.id)
            setSelectedCorporate(profile)
            setShowEditModal(true)
        } catch (error: any) {
            console.error('Failed to fetch corporate profile:', error)
            toast.error(getErrorMessage(error))
        }
    }

    const handleUpdateCorporate = async (corporateId: string, data: UpdateCorporateRequest): Promise<CorporateProfile> => {
        try {
            const updated = await corporateManagementService.updateCorporate(corporateId, data)
            toast.success('Corporate updated successfully!')
            setShowEditModal(false)
            setSelectedCorporate(null)
            fetchCorporates() // Refresh the list
            return updated
        } catch (error: any) {
            console.error('Failed to update corporate:', error)
            toast.error(getErrorMessage(error))
            throw error
        }
    }

    const handleExportCorporates = async () => {
        try {
            const blob = await corporateManagementService.exportCorporates(includeArchived)
            
            // Create download link
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `corporates_export_${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            
            toast.success('Corporates exported successfully!')
        } catch (error: any) {
            console.error('Failed to export corporates:', error)
            toast.error(getErrorMessage(error))
        }
    }

    const handleImportCorporates = async () => {
        try {
            // TODO: Implement import functionality
            toast('Import functionality coming soon!')
        } catch (error: any) {
            console.error('Failed to import corporates:', error)
            toast.error('Failed to import corporates.')
        }
    }

    return (
        <AdminDashboardLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-cyan-200 dark:border-cyan-700">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Corporate Management 🏢
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                                Manage corporates, verify companies, and oversee business partnerships ✨
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200">
                                    📊 {corporates.length} Total Corporates
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                    ✅ {corporates.filter(c => c.verified).length} Verified
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                                    💼 {corporates.reduce((sum, c) => sum + (c.total_jobs || 0), 0)} Total Jobs
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
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors duration-200 font-medium shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Corporate</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleExportCorporates}
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium shadow-sm"
                    >
                        <Download className="w-5 h-5" />
                        <span>Export Data</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleImportCorporates}
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium shadow-sm"
                    >
                        <Upload className="w-5 h-5" />
                        <span>Import Data</span>
                    </motion.button>
                </div>

                {/* Corporate Management Header (search, filters) */}
                <CorporateManagementHeader
                    totalCorporates={corporates.length}
                    activeCorporates={corporates.filter(c => !c.is_archived).length}
                    archivedCorporates={corporates.filter(c => c.is_archived).length}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    filterStatus={filterStatus}
                    onFilterChange={setFilterStatus}
                    includeArchived={includeArchived}
                    onIncludeArchivedChange={setIncludeArchived}
                />

                {/* Corporate Table */}
                <CorporateTable
                    corporates={filteredCorporates}
                    isLoading={isLoading}
                    error={error}
                    onArchiveCorporate={handleArchiveCorporate}
                    onDeleteCorporate={handleDeleteCorporate}
                    onEditCorporate={handleEditCorporate}
                    onRetry={fetchCorporates}
                />

                {/* Modals */}
                <CreateCorporateModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateCorporate}
                />
                <EditCorporateModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false)
                        setSelectedCorporate(null)
                    }}
                    onSubmit={handleUpdateCorporate}
                    corporate={selectedCorporate}
                />
            </div>
        </AdminDashboardLayout>
    )
}

