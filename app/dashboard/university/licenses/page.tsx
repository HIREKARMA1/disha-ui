"use client"

import { useState, useEffect } from 'react'
import { UniversityDashboardLayout } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { UniversityLicenseRequestModal } from '@/components/dashboard/UniversityLicenseRequestModal'
import { Award, Calendar, Users, CheckCircle, Clock, AlertCircle, Plus, Briefcase } from 'lucide-react'
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

    // Calculate summary stats
    const totalLicenses = licenses.reduce((sum, l) => sum + l.total_licenses, 0)
    const activeBatches = licenses.filter(l => l.status.toLowerCase() === 'active').length
    const studentsLicensed = licenses.reduce((sum, l) => sum + (l.total_licenses - l.remaining_licenses), 0)

    const statsCards = [
        {
            label: 'Total Licenses',
            value: totalLicenses,
            icon: Award,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        },
        {
            label: 'Active Batches',
            value: activeBatches,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20'
        },
        {
            label: 'Students Licensed',
            value: studentsLicensed,
            icon: Users,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20'
        }
    ]

    return (
        <UniversityDashboardLayout>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                License Management 📜
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                                View and manage your student licenses ✨
                            </p>
                        </div>
                        <Button
                            onClick={() => setIsRequestModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Request License
                        </Button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {statsCards.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="w-full"
                        >
                            <div className="block group w-full">
                                <div className={`p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md w-full ${stat.bgColor}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                {stat.label}
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-200">
                                                {stat.value}
                                            </p>
                                        </div>
                                        <div className={`p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
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
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-gray-500" />
                            Your Licenses
                        </h2>
                        <div className="grid gap-6">
                            {licenses.map((license, index) => {
                                const usedLicenses = license.total_licenses - license.remaining_licenses
                                const usagePercent = Math.round((usedLicenses / license.total_licenses) * 100)
                                const isExhausted = license.remaining_licenses <= 0

                                return (
                                    <motion.div
                                        key={license.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
                                    >
                                        {/* License Header */}
                                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                    <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
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
                                            <div className="flex items-center gap-8 bg-gray-50 dark:bg-gray-800/50 px-6 py-3 rounded-lg">
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mb-1">Total</p>
                                                    <p className="text-xl font-bold text-gray-900 dark:text-white">{license.total_licenses}</p>
                                                </div>
                                                <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mb-1">Used</p>
                                                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{usedLicenses}</p>
                                                </div>
                                                <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mb-1">Remaining</p>
                                                    <p className={`text-xl font-bold ${isExhausted ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                                        {license.remaining_licenses}
                                                    </p>
                                                </div>
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

                                        {/* License Details */}
                                        <div className="p-6 bg-gray-50/50 dark:bg-gray-800/30">
                                            <div className="grid md:grid-cols-2 gap-8">
                                                {/* Period & Progress */}
                                                <div className="space-y-5">
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-gray-500" />
                                                            License Period
                                                        </h4>
                                                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                                            <span className="font-medium">{formatDate(license.period_from)}</span>
                                                            <span className="text-gray-400">→</span>
                                                            <span className="font-medium">{formatDate(license.period_to)}</span>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="flex justify-between text-sm mb-2">
                                                            <span className="text-gray-600 dark:text-gray-400 font-medium">License Usage</span>
                                                            <span className="font-bold text-gray-900 dark:text-white">
                                                                {usagePercent}%
                                                            </span>
                                                        </div>
                                                        <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${isExhausted ? 'bg-red-500' : 'bg-blue-600'}`}
                                                                style={{ width: `${usagePercent}%` }}
                                                            />
                                                        </div>
                                                        {isExhausted && (
                                                            <p className="text-xs text-red-500 mt-2 flex items-center gap-1 font-medium">
                                                                <AlertCircle className="w-3 h-3" />
                                                                License limit reached. Please request renewal.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Admin Note */}
                                                {license.note && (
                                                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl p-5">
                                                        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
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
