"use client"

import { useState, useEffect } from 'react'
import { UniversityDashboardLayout } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { UniversityLicenseRequestModal } from '@/components/dashboard/UniversityLicenseRequestModal'
import { Award, Calendar, Users, CheckCircle, XCircle, Clock, AlertCircle, Plus } from 'lucide-react'
import { motion } from 'framer-motion'

interface License {
    id: string
    batch: string
    total_licenses: number
    remaining_licenses: number
    period_from: string
    period_to: string
    status: string
    note?: string
    created_at: string
}

export default function UniversityLicensesPage() {
    const [licenses, setLicenses] = useState<License[]>([])
    const [loading, setLoading] = useState(true)
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
    const [selectedBatch, setSelectedBatch] = useState<string | undefined>(undefined)

    useEffect(() => {
        fetchLicenses()
    }, [])

    const fetchLicenses = async () => {
        try {
            setLoading(true)
            const data = await apiClient.getUniversityLicenses()
            // Handle both array response or object with items/licenses property
            const licenseList = Array.isArray(data) ? data : (data.licenses || data.items || [])
            setLicenses(licenseList)
        } catch (error) {
            console.error('Failed to fetch licenses:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
            case 'expired':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
        }
    }

    return (
        <UniversityDashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Award className="w-6 h-6 text-primary-500" />
                            License Management
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            View and manage your student licenses
                        </p>
                    </div>
                    <Button onClick={() => setIsRequestModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Request License
                    </Button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    </div>
                ) : licenses.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Licenses Found</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                            You don't have any active licenses yet. Request a license to start adding students.
                        </p>
                        <Button onClick={() => setIsRequestModalOpen(true)}>
                            Request Your First License
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {licenses.map((license) => {
                            const usedLicenses = license.total_licenses - license.remaining_licenses
                            const usagePercent = Math.round((usedLicenses / license.total_licenses) * 100)
                            const isExhausted = license.remaining_licenses <= 0

                            return (
                                <motion.div
                                    key={license.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                                >
                                    {/* License Header */}
                                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    Batch {license.batch}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(license.status)}`}>
                                                        {license.status.toUpperCase()}
                                                    </span>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        Approved on {formatDate(license.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Usage Stats */}
                                        <div className="flex items-center gap-8">
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Total</p>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white">{license.total_licenses}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Used</p>
                                                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{usedLicenses}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Remaining</p>
                                                <p className={`text-xl font-bold ${isExhausted ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                                    {license.remaining_licenses}
                                                </p>
                                            </div>
                                            {isExhausted && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-amber-500 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                                                    onClick={() => {
                                                        setSelectedBatch(license.batch)
                                                        setIsRequestModalOpen(true)
                                                    }}
                                                >
                                                    Request Renewal
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* License Details */}
                                    <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {/* Period & Progress */}
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-500" />
                                                        License Period
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                                        <span>{formatDate(license.period_from)}</span>
                                                        <span className="text-gray-400">→</span>
                                                        <span>{formatDate(license.period_to)}</span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-gray-600 dark:text-gray-400">Usage</span>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {usagePercent}%
                                                        </span>
                                                    </div>
                                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${isExhausted ? 'bg-red-500' : 'bg-blue-600'}`}
                                                            style={{ width: `${usagePercent}%` }}
                                                        />
                                                    </div>
                                                    {isExhausted && (
                                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            License limit reached. Please request renewal.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Admin Note */}
                                            {license.note && (
                                                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
                                                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Admin Message
                                                    </h4>
                                                    <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                                                        {license.note}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}

                <UniversityLicenseRequestModal
                    isOpen={isRequestModalOpen}
                    onClose={() => {
                        setIsRequestModalOpen(false)
                        setSelectedBatch(undefined)
                    }}
                    onSuccess={fetchLicenses}
                    initialBatch={selectedBatch}
                />
            </div>
        </UniversityDashboardLayout >
    )
}
