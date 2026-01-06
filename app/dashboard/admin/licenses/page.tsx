"use client"

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { RefreshCw, FileText, Award, Search, ChevronDown, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { LicenseRequestModal } from '@/components/admin/LicenseRequestModal'
import { LicenseRequestsTable } from '@/components/admin/LicenseRequestsTable'
import { ActiveLicensesTable } from '@/components/admin/ActiveLicensesTable'
import { EditLicenseModal } from '@/components/admin/EditLicenseModal'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal'
import { DeactivateLicenseModal } from '@/components/admin/DeactivateLicenseModal'
import { LicenseStatsCards } from '@/components/admin/LicenseStatsCards'

interface LicenseRequest {
    id: string
    university_name: string
    university_email: string
    requested_total: number
    batch: string
    period_from: string
    period_to: string
    message?: string
    status: string
    created_at: string
}

interface License {
    id: string
    university_id: string
    university_name: string
    batch: string
    total_licenses: number
    remaining_licenses: number
    period_from: string
    period_to: string
    status: string
    is_active: boolean
    is_expired: boolean
    created_at: string
}

export default function AdminLicensesPage() {
    const [activeTab, setActiveTab] = useState<'requests' | 'licenses'>('requests')
    const [requests, setRequests] = useState<LicenseRequest[]>([])
    const [licenses, setLicenses] = useState<License[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<string>('')
    const [searchQuery, setSearchQuery] = useState('')

    // Modal states
    const [selectedRequest, setSelectedRequest] = useState<LicenseRequest | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [selectedLicense, setSelectedLicense] = useState<License | null>(null)
    const [showEditModal, setShowEditModal] = useState(false)

    // Delete modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteItem, setDeleteItem] = useState<{ id: string, type: 'request' | 'license' } | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Deactivate modal states
    const [showDeactivateModal, setShowDeactivateModal] = useState(false)
    const [deactivateLicense, setDeactivateLicense] = useState<License | null>(null)
    const [isDeactivating, setIsDeactivating] = useState(false)

    useEffect(() => {
        loadData()
    }, [statusFilter, activeTab])

    const loadData = async () => {
        try {
            setLoading(true)

            // Fetch both requests and licenses to ensure stats are correct
            const [requestsResponse, licensesResponse] = await Promise.all([
                apiClient.getLicenseRequests({
                    status: statusFilter || undefined,
                    page: 1,
                    page_size: 50
                }),
                apiClient.getLicenses({
                    page: 1,
                    page_size: 50
                })
            ])

            setRequests(requestsResponse.requests || [])
            setLicenses(licensesResponse.licenses || [])
        } catch (error: any) {
            toast.error('Failed to load data')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // Filter data based on search query
    const filteredRequests = requests.filter(req =>
        req.university_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.university_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.batch?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredLicenses = licenses.filter(lic =>
        lic.university_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lic.batch?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleViewRequest = (requestId: string) => {
        setSelectedRequest(requests.find(r => r.id === requestId) || null)
        setShowModal(true)
    }

    const handleEditLicense = (licenseId: string) => {
        const license = licenses.find(l => l.id === licenseId)
        if (license) {
            setSelectedLicense(license)
            setShowEditModal(true)
        }
    }

    const confirmDeactivate = (licenseId: string) => {
        const license = licenses.find(l => l.id === licenseId)
        if (license) {
            setDeactivateLicense(license)
            setShowDeactivateModal(true)
        }
    }

    const handleDeactivateLicense = async () => {
        if (!deactivateLicense) return

        try {
            setIsDeactivating(true)
            await apiClient.deactivateLicense(deactivateLicense.id)
            toast.success('License deactivated successfully')
            loadData()
            setShowDeactivateModal(false)
            setDeactivateLicense(null)
        } catch (error: any) {
            toast.error('Failed to deactivate license')
            console.error(error)
        } finally {
            setIsDeactivating(false)
        }
    }

    const confirmDelete = (id: string, type: 'request' | 'license') => {
        setDeleteItem({ id, type })
        setShowDeleteModal(true)
    }

    const handleDelete = async () => {
        if (!deleteItem) return

        try {
            setIsDeleting(true)
            if (deleteItem.type === 'request') {
                await apiClient.deleteLicenseRequest(deleteItem.id)
                toast.success('License request deleted successfully')
            } else {
                await apiClient.deleteLicense(deleteItem.id)
                toast.success('License deleted successfully')
            }
            loadData()
            setShowDeleteModal(false)
            setDeleteItem(null)
        } catch (error: any) {
            toast.error(`Failed to delete ${deleteItem.type}`)
            console.error(error)
        } finally {
            setIsDeleting(false)
        }
    }

    // Calculate stats
    const stats = {
        total_requests: requests.length,
        pending_requests: requests.filter(r => r.status === 'pending').length,
        approved_requests: requests.filter(r => r.status === 'approved').length,
        rejected_requests: requests.filter(r => r.status === 'rejected').length,
        total_active_licenses: licenses.filter(l => l.is_active && !l.is_expired).length,
        total_students_licensed: licenses.reduce((sum, l) => sum + (l.total_licenses - l.remaining_licenses), 0)
    }

    return (
        <AdminDashboardLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-700">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                License Management 📜
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                                Manage license requests and active licenses for universities ✨
                            </p>

                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                    <FileText className="w-3 h-3 mr-1" /> {stats.total_requests} Requests
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                                    <Clock className="w-3 h-3 mr-1" /> {stats.pending_requests} Pending
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                    <Award className="w-3 h-3 mr-1" /> {stats.total_active_licenses} Active Licenses
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <LicenseStatsCards stats={stats} />

                {/* Tabs & Actions Container */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Tabs */}
                        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg self-start md:self-auto">
                            <button
                                onClick={() => setActiveTab('requests')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'requests'
                                    ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                <FileText className="w-4 h-4" />
                                Requests
                                {requests.filter(r => r.status === 'pending').length > 0 && (
                                    <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs font-bold px-1.5 py-0.5 rounded-full ml-1">
                                        {requests.filter(r => r.status === 'pending').length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('licenses')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'licenses'
                                    ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                <Award className="w-4 h-4" />
                                Active Licenses
                            </button>
                        </div>

                        {/* Search & Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 text-sm"
                                />
                            </div>

                            {activeTab === 'requests' && (
                                <div className="relative">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full sm:w-auto pl-4 pr-10 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-800 text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                </div>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={loadData}
                                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span className="hidden sm:inline">Refresh</span>
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Table Content */}
                {activeTab === 'requests' ? (
                    <LicenseRequestsTable
                        requests={filteredRequests}
                        loading={loading}
                        onViewRequest={handleViewRequest}
                        onDeleteRequest={(id) => confirmDelete(id, 'request')}
                    />
                ) : (
                    <ActiveLicensesTable
                        licenses={filteredLicenses}
                        loading={loading}
                        onEditLicense={handleEditLicense}
                        onDeactivateLicense={confirmDeactivate}
                        onDeleteLicense={(id) => confirmDelete(id, 'license')}
                    />
                )}

                {/* Request Detail Modal */}
                <LicenseRequestModal
                    isOpen={showModal}
                    onClose={() => {
                        setShowModal(false)
                        setSelectedRequest(null)
                    }}
                    requestId={selectedRequest?.id || null}
                    onSuccess={() => {
                        loadData()
                        setShowModal(false)
                        setSelectedRequest(null)
                    }}
                />

                {/* Edit License Modal */}
                <EditLicenseModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false)
                        setSelectedLicense(null)
                    }}
                    license={selectedLicense}
                    onSuccess={() => {
                        loadData()
                        setShowEditModal(false)
                        setSelectedLicense(null)
                    }}
                />

                {/* Delete Confirmation Modal */}
                <DeleteConfirmationModal
                    isOpen={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false)
                        setDeleteItem(null)
                    }}
                    onConfirm={handleDelete}
                    title={`Delete ${deleteItem?.type === 'request' ? 'License Request' : 'License'}`}
                    message={`Are you sure you want to delete this ${deleteItem?.type === 'request' ? 'license request' : 'license'}? This action cannot be undone.`}
                    isDeleting={isDeleting}
                />

                {/* Deactivate License Modal */}
                <DeactivateLicenseModal
                    isOpen={showDeactivateModal}
                    onClose={() => {
                        setShowDeactivateModal(false)
                        setDeactivateLicense(null)
                    }}
                    onConfirm={handleDeactivateLicense}
                    universityName={deactivateLicense?.university_name || ''}
                    batch={deactivateLicense?.batch || ''}
                    isDeactivating={isDeactivating}
                />
            </div>
        </AdminDashboardLayout>
    )
}
