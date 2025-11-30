"use client"

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { RefreshCw, FileText, Award, Search, ChevronDown } from 'lucide-react'
import { LicenseRequestModal } from '@/components/admin/LicenseRequestModal'
import { LicenseStatsCards } from '@/components/admin/LicenseStatsCards'
import { LicenseRequestsTable } from '@/components/admin/LicenseRequestsTable'
import { ActiveLicensesTable } from '@/components/admin/ActiveLicensesTable'
import { EditLicenseModal } from '@/components/admin/EditLicenseModal'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal'

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

    const handleDeactivateLicense = async (licenseId: string) => {
        if (!confirm('Are you sure you want to deactivate this license?')) return

        try {
            await apiClient.deactivateLicense(licenseId)
            toast.success('License deactivated successfully')
            loadData()
        } catch (error: any) {
            toast.error('Failed to deactivate license')
            console.error(error)
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
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                License Management 📜
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                                Manage license requests and active licenses for universities ✨
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <LicenseStatsCards stats={stats} />

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`${activeTab === 'requests'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
                        >
                            <FileText className="w-5 h-5" />
                            License Requests
                            {requests.filter(r => r.status === 'pending').length > 0 && (
                                <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs font-medium px-2 py-0.5 rounded-full">
                                    {requests.filter(r => r.status === 'pending').length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('licenses')}
                            className={`${activeTab === 'licenses'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
                        >
                            <Award className="w-5 h-5" />
                            Active Licenses
                            {licenses.filter(l => l.is_active && !l.is_expired).length > 0 && (
                                <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium px-2 py-0.5 rounded-full">
                                    {licenses.filter(l => l.is_active && !l.is_expired).length}
                                </span>
                            )}
                        </button>
                    </nav>
                </div>

                {/* Action Buttons & Search */}
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by university, email or batch..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                        />
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                        {activeTab === 'requests' && (
                            <div className="relative">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="appearance-none w-full sm:w-40 px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                                >
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                </div>
                            </div>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={loadData}
                            className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm"
                        >
                            <RefreshCw className="w-5 h-5" />
                            <span>Refresh</span>
                        </motion.button>
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
                        onDeactivateLicense={handleDeactivateLicense}
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
            </div>
        </AdminDashboardLayout>
    )
}
