"use client"

import { Edit2, Power, CheckCircle2, XCircle, Clock, TrendingUp, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

interface ActiveLicensesTableProps {
    licenses: License[]
    loading: boolean
    onEditLicense: (licenseId: string) => void
    onDeactivateLicense: (licenseId: string) => void
    onDeleteLicense: (licenseId: string) => void
}

export function ActiveLicensesTable({ licenses, loading, onEditLicense, onDeactivateLicense, onDeleteLicense }: ActiveLicensesTableProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const getUsagePercentage = (used: number, total: number) => {
        return Math.round(((total - used) / total) * 100)
    }

    const getStatusBadge = (license: License) => {
        if (license.is_expired) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    <Clock className="w-3.5 h-3.5" />
                    Expired
                </span>
            )
        }
        if (!license.is_active) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                    <XCircle className="w-3.5 h-3.5" />
                    Inactive
                </span>
            )
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active
            </span>
        )
    }

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading licenses...</span>
                </div>
            </div>
        )
    }

    if (licenses.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
                <div className="text-center text-gray-500 dark:text-gray-400">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">No licenses found</p>
                    <p className="text-sm mt-1">Active licenses will appear here after approval</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                SL No.
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                University
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Batch
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Total
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Used
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Remaining
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Usage
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Period
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {licenses.map((license, index) => {
                            const usedLicenses = license.total_licenses - license.remaining_licenses
                            const usagePercent = getUsagePercentage(license.remaining_licenses, license.total_licenses)

                            return (
                                <tr key={license.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {license.university_name || 'Unknown University'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="px-2 py-1 text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded w-fit">
                                                Batch {license.batch}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                                        {license.total_licenses}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                        {usedLicenses}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                                        {license.remaining_licenses}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-24">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${usagePercent > 50 ? 'bg-green-500' :
                                                        usagePercent > 20 ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`}
                                                    style={{ width: `${usagePercent}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                {usagePercent}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col">
                                            <span className="text-xs">{formatDate(license.period_from)}</span>
                                            <span className="text-xs text-gray-400">to {formatDate(license.period_to)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(license)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onEditLicense(license.id)}
                                                className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                            >
                                                <Edit2 className="w-3.5 h-3.5 mr-1" />
                                                Edit
                                            </Button>
                                            {license.is_active && !license.is_expired && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onDeactivateLicense(license.id)}
                                                    className="hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 hover:text-red-700 border-red-200"
                                                >
                                                    <Power className="w-3.5 h-3.5 mr-1" />
                                                    Deactivate
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onDeleteLicense(license.id)}
                                                className="hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 hover:text-red-700 border-red-200"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
