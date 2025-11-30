"use client"

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { RefreshCw, Download, FileText, Award } from 'lucide-react'
import { LicenseRequestModal } from '@/components/admin/LicenseRequestModal'
import { LicenseStatsCards } from '@/components/admin/LicenseStatsCards'
import { LicenseRequestsTable } from '@/components/admin/LicenseRequestsTable'
import { ActiveLicensesTable } from '@/components/admin/ActiveLicensesTable'
import { EditLicenseModal } from '@/components/admin/EditLicenseModal'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'

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
    const [selectedRequest, setSelectedRequest] = useState<LicenseRequest | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [selectedLicense, setSelectedLicense] = useState<License | null>(null)
    const [showEditModal, setShowEditModal] = useState(false)

    useEffect(() => {
        loadData()
    }, [statusFilter, activeTab])

    const loadData = async () => {
        try {
            setLoading(true)
            if (activeTab === 'requests') {
                const response = await apiClient.getLicenseRequests({
                    status: statusFilter || undefined,
                    page: 1,
                    page_size: 50
                })
                setRequests(response.requests || [])
            } else {
                const response = await apiClient.getLicenses({
                    page: 1,
                    page_size: 50
                })
                setLicenses(response.licenses || [])
            }
        } catch (error: any) {
            toast.error(`Failed to load ${activeTab}`)
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

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

    const handleDeleteRequest = async (requestId: string) => {
        if (!confirm('Are you sure you want to delete this license request? This action cannot be undone.')) return

        try {
            await apiClient.deleteLicenseRequest(requestId)
            toast.success('License request deleted successfully')
            loadData()
        } catch (error: any) {
            toast.error('Failed to delete license request')
            console.error(error)
        }
    }

    const handleDeleteLicense = async (licenseId: string) => {
        if (!confirm('Are you sure you want to delete this license? This action cannot be undone.')) return

        try {
            await apiClient.deleteLicense(licenseId)
            toast.success('License deleted successfully')
            loadData()
        } catch (error: any) {
            toast.error('Failed to delete license')
            console.error(error)
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

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {activeTab === 'requests' && (
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
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

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toast('Export functionality coming soon!')}
                        className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium shadow-sm"
                    >
                        <Download className="w-5 h-5" />
                        <span>Export Data</span>
                    </motion.button>
                </div>

                {/* Table Content */}
                {activeTab === 'requests' ? (
                    <LicenseRequestsTable
                        requests={requests}
                        loading={loading}
                        onViewRequest={handleViewRequest}
                        onDeleteRequest={handleDeleteRequest}
                    />
                ) : (
                    <ActiveLicensesTable
                        licenses={licenses}
                        loading={loading}
                        onEditLicense={handleEditLicense}
                        onDeactivateLicense={handleDeactivateLicense}
                        onDeleteLicense={handleDeleteLicense}
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
            </div>
        </AdminDashboardLayout>
    )
}
