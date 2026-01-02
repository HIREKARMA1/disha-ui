"use client"

import { useState, useEffect } from 'react'
import { UniversityDashboardLayout } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api'
import { UniversityLicenseRequestModal } from '@/components/dashboard/UniversityLicenseRequestModal'
import { Award, Calendar, CheckCircle, Clock, AlertCircle, Plus, Briefcase, Search, Filter, GraduationCap } from 'lucide-react'
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
    degree?: string | string[]
    branches?: string[]
    created_at: string
}

export default function UniversityLicensesPage() {
    const [licenses, setLicenses] = useState<License[]>([])
    const [loading, setLoading] = useState(true)
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
    const [selectedBatch, setSelectedBatch] = useState<string | undefined>(undefined)
    const [selectedDegree, setSelectedDegree] = useState<string | string[] | undefined>(undefined)
    const [selectedBranches, setSelectedBranches] = useState<string[] | undefined>(undefined)
    const [searchTerm, setSearchTerm] = useState('')

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

    // Filter licenses based on search
    const filteredLicenses = licenses.filter(license =>
        license.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        license.status.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <UniversityDashboardLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-700">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                License Management 📜
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                                View and manage your student licenses ✨
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                    <Award className="w-3 h-3 mr-1" /> {totalLicenses} Total Licenses
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                    <CheckCircle className="w-3 h-3 mr-1" /> {activeBatches} Active Batches
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                                    <Briefcase className="w-3 h-3 mr-1" /> {studentsLicensed} Students Licensed
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Actions Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Search licenses by batch or status..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20"
                            />
                        </div>
                        <Button
                            onClick={() => {
                                setSelectedBatch(undefined)
                                setSelectedDegree(undefined)
                                setSelectedBranches(undefined)
                                setIsRequestModalOpen(true)
                            }}
                            className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Request License
                        </Button>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    </div>
                ) : filteredLicenses.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Licenses Found</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                            {searchTerm ? 'No licenses match your search.' : "You don't have any active licenses yet. Request a license to start adding students."}
                        </p>
                        {!searchTerm && (
                            <Button onClick={() => {
                                setSelectedBatch(undefined)
                                setSelectedDegree(undefined)
                                setSelectedBranches(undefined)
                                setIsRequestModalOpen(true)
                            }}>
                                Request Your First License
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-gray-500" />
                                Your Licenses ({filteredLicenses.length})
                            </h2>
                        </div>

                        <div className="grid gap-6">
                            {filteredLicenses.map((license, index) => {
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
                                                        setSelectedDegree(license.degree)
                                                        setSelectedBranches(license.branches)
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

                                                    {/* Scope: Degree & Branches */}
                                                    {(license.degree || (license.branches && license.branches.length > 0)) && (
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                                <GraduationCap className="w-4 h-4 text-gray-500" />
                                                                License Scope
                                                            </h4>
                                                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
                                                                {license.degree && (
                                                                    <div className="flex flex-col gap-1.5">
                                                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Degree</span>
                                                                        <div className="flex flex-wrap gap-1.5">
                                                                            {Array.isArray(license.degree) ? (
                                                                                license.degree.map((d, i) => (
                                                                                    <span key={i} className="px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-100 dark:border-indigo-800">
                                                                                        {d}
                                                                                    </span>
                                                                                ))
                                                                            ) : (
                                                                                <span className="px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-100 dark:border-indigo-800">
                                                                                    {license.degree}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {license.branches && license.branches.length > 0 && (
                                                                    <div className="flex flex-col gap-1.5">
                                                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Branches</span>
                                                                        <div className="flex flex-wrap gap-1.5">
                                                                            {license.branches.map((b, i) => (
                                                                                <span key={i} className="px-2 py-1 rounded-md bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-xs font-medium border border-orange-100 dark:border-orange-800">
                                                                                    {b}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

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
                        setSelectedDegree(undefined)
                        setSelectedBranches(undefined)
                    }}
                    onSuccess={fetchLicenses}
                    initialBatch={selectedBatch}
                    isRenewalFlow={!!selectedBatch}
                    initialDegree={selectedDegree}
                    initialBranches={selectedBranches}
                />
            </div>
        </UniversityDashboardLayout >
    )
}
