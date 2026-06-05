"use client"

import { Download, Filter, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import {
    USER_STATUS_FILTER_OPTIONS,
    USER_VERIFICATION_FILTER_OPTIONS,
} from '@/lib/userManagementConfig'

interface UserManagementToolbarProps {
    searchTerm: string
    onSearchChange: (value: string) => void
    statusFilter: string
    onStatusFilterChange: (value: string) => void
    verificationFilter: string
    onVerificationFilterChange: (value: string) => void
    createdAfter: string
    onCreatedAfterChange: (value: string) => void
    createdBefore: string
    onCreatedBeforeChange: (value: string) => void
    onExport: () => void
    isExporting?: boolean
}

export function UserManagementToolbar({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    verificationFilter,
    onVerificationFilterChange,
    createdAfter,
    onCreatedAfterChange,
    createdBefore,
    onCreatedBeforeChange,
    onExport,
    isExporting = false,
}: UserManagementToolbarProps) {
    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onExport}
                    disabled={isExporting}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <Download className="w-5 h-5" />
                    <span>{isExporting ? 'Exporting...' : 'Export to Spreadsheet'}</span>
                </motion.button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                    <div className="relative lg:col-span-2 xl:col-span-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by name, email, phone, institution, or location..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                            value={statusFilter}
                            onChange={(e) => onStatusFilterChange(e.target.value)}
                            className="w-full pl-10 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 appearance-none"
                        >
                            {USER_STATUS_FILTER_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                            value={verificationFilter}
                            onChange={(e) => onVerificationFilterChange(e.target.value)}
                            className="w-full pl-10 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 appearance-none"
                        >
                            {USER_VERIFICATION_FILTER_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Created From
                        </label>
                        <input
                            type="date"
                            value={createdAfter}
                            onChange={(e) => onCreatedAfterChange(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Created To
                        </label>
                        <input
                            type="date"
                            value={createdBefore}
                            onChange={(e) => onCreatedBeforeChange(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
