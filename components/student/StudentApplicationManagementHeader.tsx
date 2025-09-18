"use client"

import { motion } from 'framer-motion'
import { Search, Filter, FileText, Users, CheckCircle, XCircle, Clock, UserCheck } from 'lucide-react'

interface StudentApplicationManagementHeaderProps {
    totalApplications: number
    appliedApplications: number
    shortlistedApplications: number
    selectedApplications: number
    rejectedApplications: number
    pendingApplications: number
    searchTerm: string
    onSearchChange: (term: string) => void
    filterStatus: string
    onFilterChange: (status: string) => void
}

export function StudentApplicationManagementHeader({
    totalApplications,
    appliedApplications,
    shortlistedApplications,
    selectedApplications,
    rejectedApplications,
    pendingApplications,
    searchTerm,
    onSearchChange,
    filterStatus,
    onFilterChange
}: StudentApplicationManagementHeaderProps) {
    const statusOptions = [
        { value: 'all', label: 'All Applications', count: totalApplications },
        { value: 'applied', label: 'Applied', count: appliedApplications },
        { value: 'shortlisted', label: 'Shortlisted', count: shortlistedApplications },
        { value: 'selected', label: 'Selected', count: selectedApplications },
        { value: 'rejected', label: 'Rejected', count: rejectedApplications },
        { value: 'pending', label: 'Pending', count: pendingApplications },
    ]

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'applied':
                return <Clock className="w-6 h-6" />
            case 'shortlisted':
                return <UserCheck className="w-6 h-6" />
            case 'selected':
                return <CheckCircle className="w-6 h-6" />
            case 'rejected':
                return <XCircle className="w-6 h-6" />
            case 'pending':
                return <Clock className="w-6 h-6" />
            default:
                return <FileText className="w-6 h-6" />
        }
    }

    const getStatusCardStyle = (status: string) => {
        switch (status) {
            case 'applied':
                return {
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
                }
            case 'shortlisted':
                return {
                    color: 'text-purple-600',
                    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
                }
            case 'selected':
                return {
                    color: 'text-green-600',
                    bgColor: 'bg-green-50 dark:bg-green-900/20'
                }
            case 'rejected':
                return {
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-50 dark:bg-orange-900/20'
                }
            case 'pending':
                return {
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
                }
            default:
                return {
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50 dark:bg-gray-900/20'
                }
        }
    }

    return (
        <div className="space-y-6">
            {/* Header - Same style as Job Postings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-700"
            >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            My Applications 📋
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                            Track your job applications and download offer letters ✨
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                                📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                📈 Career Progress
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                🚀 Job Opportunities
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Cards - Same style as Dashboard Cards */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-4">
                {statusOptions.map((option, index) => {
                    const style = getStatusCardStyle(option.value)
                    return (
                        <motion.div
                            key={option.value}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="w-full"
                        >
                            <div className="block group w-full">
                                <div className={`p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md w-full ${style.bgColor}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                {option.label}
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-200">
                                                {option.count}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm group-hover:scale-110 transition-transform duration-200">
                                            <div className={style.color}>
                                                {getStatusIcon(option.value)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Search and Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by job title, company name, or status..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="sm:w-64">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={filterStatus}
                                onChange={(e) => onFilterChange(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 appearance-none"
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label} ({option.count})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
