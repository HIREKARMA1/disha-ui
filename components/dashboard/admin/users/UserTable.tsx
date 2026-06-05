"use client"

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
    Building2,
    Calendar,
    ChevronDown,
    ChevronsUpDown,
    ChevronUp,
    GraduationCap,
    Mail,
    MapPin,
    Phone,
    Shield,
    Users,
} from 'lucide-react'
import { AdminUserListItem } from '@/types/userManagement'
import {
    AdminManagedUserType,
    USER_TABLE_PAGE_SIZE,
    USER_TYPE_SINGULAR_LABELS,
} from '@/lib/userManagementConfig'

interface UserTableProps {
    users: AdminUserListItem[]
    userType: AdminManagedUserType
    isLoading: boolean
    error: string | null
    onRetry: () => void
}

type SortDirection = 'asc' | 'desc' | null

type SortField =
    | 'display_name'
    | 'email'
    | 'phone'
    | 'status'
    | 'is_verified'
    | 'location'
    | 'institution'
    | 'degree'
    | 'company_name'
    | 'industry'
    | 'university_name'
    | 'institute_type'
    | 'profile_completion_percentage'
    | 'created_at'
    | 'last_login'

interface ColumnConfig {
    key: SortField
    label: string
    types: AdminManagedUserType[]
}

const TABLE_COLUMNS: ColumnConfig[] = [
    { key: 'display_name', label: 'Name', types: ['student', 'university', 'corporate'] },
    { key: 'email', label: 'Email', types: ['student', 'university', 'corporate'] },
    { key: 'phone', label: 'Phone', types: ['student', 'university', 'corporate'] },
    { key: 'institution', label: 'Institution', types: ['student'] },
    { key: 'degree', label: 'Degree', types: ['student'] },
    { key: 'university_name', label: 'University', types: ['university'] },
    { key: 'institute_type', label: 'Institute Type', types: ['university'] },
    { key: 'company_name', label: 'Company', types: ['corporate'] },
    { key: 'industry', label: 'Industry', types: ['corporate'] },
    { key: 'location', label: 'Location', types: ['student', 'university', 'corporate'] },
    { key: 'is_verified', label: 'Verified', types: ['student', 'university', 'corporate'] },
    { key: 'status', label: 'Status', types: ['student', 'university', 'corporate'] },
    { key: 'profile_completion_percentage', label: 'Profile %', types: ['student'] },
    { key: 'created_at', label: 'Created', types: ['student', 'university', 'corporate'] },
    { key: 'last_login', label: 'Last Login', types: ['student', 'university', 'corporate'] },
]

const TYPE_ICONS: Record<AdminManagedUserType, React.ComponentType<{ className?: string }>> = {
    student: GraduationCap,
    university: Building2,
    corporate: Users,
}

const TYPE_GRADIENTS: Record<AdminManagedUserType, string> = {
    student: 'from-blue-500 to-cyan-600',
    university: 'from-purple-500 to-pink-600',
    corporate: 'from-orange-500 to-red-600',
}

function formatDate(dateString?: string | null) {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

function getStatusColor(status?: string | null) {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
        case 'inactive':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
        case 'pending':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
        case 'suspended':
            return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
}

function getRowColor(index: number) {
    const colors = [
        'bg-blue-50/30 dark:bg-blue-900/10',
        'bg-green-50/30 dark:bg-green-900/10',
        'bg-purple-50/30 dark:bg-purple-900/10',
        'bg-orange-50/30 dark:bg-orange-900/10',
    ]
    return colors[index % colors.length]
}

function getSortValue(user: AdminUserListItem, field: SortField): string | number | boolean {
    switch (field) {
        case 'display_name':
            return (user.display_name || user.name || '').toLowerCase()
        case 'email':
            return (user.email || '').toLowerCase()
        case 'phone':
            return (user.phone || '').toLowerCase()
        case 'status':
            return (user.status || '').toLowerCase()
        case 'is_verified':
            return user.is_verified ? 1 : 0
        case 'location':
            return (user.location || '').toLowerCase()
        case 'institution':
            return (user.institution || '').toLowerCase()
        case 'degree':
            return (user.degree || '').toLowerCase()
        case 'company_name':
            return (user.company_name || '').toLowerCase()
        case 'industry':
            return (user.industry || '').toLowerCase()
        case 'university_name':
            return (user.university_name || '').toLowerCase()
        case 'institute_type':
            return (user.institute_type || '').toLowerCase()
        case 'profile_completion_percentage':
            return Number(user.profile_completion_percentage) || 0
        case 'created_at':
            return new Date(user.created_at || 0).getTime()
        case 'last_login':
            return new Date(user.last_login || 0).getTime()
        default:
            return ''
    }
}

function renderCell(user: AdminUserListItem, field: SortField) {
    switch (field) {
        case 'display_name': {
            const Icon = TYPE_ICONS[user.user_type as AdminManagedUserType] || Users
            const gradient = TYPE_GRADIENTS[user.user_type as AdminManagedUserType] || 'from-gray-500 to-gray-600'
            return (
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                        <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                            <Icon className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.display_name || user.name || '—'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {USER_TYPE_SINGULAR_LABELS[user.user_type as AdminManagedUserType] || user.user_type}
                        </div>
                    </div>
                </div>
            )
        }
        case 'email':
            return (
                <div className="flex items-center text-sm text-gray-900 dark:text-white">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    {user.email}
                </div>
            )
        case 'phone':
            return (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    {user.phone || '—'}
                </div>
            )
        case 'location':
            return (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="truncate max-w-[200px]">{user.location || '—'}</span>
                </div>
            )
        case 'is_verified':
            return (
                <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.is_verified
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                    }`}
                >
                    <Shield className="h-3 w-3 mr-1" />
                    {user.is_verified ? 'Verified' : 'Unverified'}
                </span>
            )
        case 'status':
            return (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                    {user.status || '—'}
                </span>
            )
        case 'created_at':
        case 'last_login':
            return (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(field === 'created_at' ? user.created_at : user.last_login)}
                </div>
            )
        case 'profile_completion_percentage':
            return (
                <span className="text-sm text-gray-900 dark:text-white">
                    {user.profile_completion_percentage != null ? `${user.profile_completion_percentage}%` : '—'}
                </span>
            )
        case 'institution':
            return <span className="text-sm text-gray-900 dark:text-white">{user.institution || '—'}</span>
        case 'degree':
            return <span className="text-sm text-gray-900 dark:text-white">{user.degree || '—'}</span>
        case 'company_name':
            return <span className="text-sm text-gray-900 dark:text-white">{user.company_name || '—'}</span>
        case 'industry':
            return <span className="text-sm text-gray-900 dark:text-white">{user.industry || '—'}</span>
        case 'university_name':
            return <span className="text-sm text-gray-900 dark:text-white">{user.university_name || '—'}</span>
        case 'institute_type':
            return <span className="text-sm text-gray-900 dark:text-white">{user.institute_type || '—'}</span>
        default:
            return <span className="text-sm text-gray-900 dark:text-white">—</span>
    }
}

export function UserTable({
    users,
    userType,
    isLoading,
    error,
    onRetry,
}: UserTableProps) {
    const [sortField, setSortField] = useState<SortField | null>('created_at')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
    const [currentPage, setCurrentPage] = useState(1)

    const visibleColumns = TABLE_COLUMNS.filter((column) => column.types.includes(userType))

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            if (sortDirection === 'asc') {
                setSortDirection('desc')
            } else if (sortDirection === 'desc') {
                setSortDirection(null)
                setSortField(null)
            } else {
                setSortDirection('asc')
            }
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
        setCurrentPage(1)
    }

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <ChevronsUpDown className="w-4 h-4 text-gray-400" />
        }
        if (sortDirection === 'asc') {
            return <ChevronUp className="w-4 h-4 text-primary-600" />
        }
        if (sortDirection === 'desc') {
            return <ChevronDown className="w-4 h-4 text-primary-600" />
        }
        return <ChevronsUpDown className="w-4 h-4 text-gray-400" />
    }

    const { totalPages, paginatedUsers } = useMemo(() => {
        let sorted = [...users]

        if (sortField && sortDirection) {
            sorted.sort((a, b) => {
                const aValue = getSortValue(a, sortField)
                const bValue = getSortValue(b, sortField)

                if (sortDirection === 'asc') {
                    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
                }
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
            })
        }

        const totalPages = Math.ceil(sorted.length / USER_TABLE_PAGE_SIZE)
        const startIndex = (currentPage - 1) * USER_TABLE_PAGE_SIZE
        const paginatedUsers = sorted.slice(startIndex, startIndex + USER_TABLE_PAGE_SIZE)

        return { totalPages, paginatedUsers }
    }, [users, sortField, sortDirection, currentPage])

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-8 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Users</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={onRetry}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    if (users.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-8 text-center">
                    <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Users Found</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        No users match your current filters.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            {visibleColumns.map((column) => (
                                <th
                                    key={column.key}
                                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                                    onClick={() => handleSort(column.key)}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{column.label}</span>
                                        {getSortIcon(column.key)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedUsers.map((user, index) => (
                            <motion.tr
                                key={user.id}
                                className={`${getRowColor(index)} hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                            >
                                {visibleColumns.map((column) => (
                                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                                        {renderCell(user, column.key)}
                                    </td>
                                ))}
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                    <div className="hidden sm:flex sm:items-center sm:justify-between">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Showing{' '}
                            <span className="font-medium">{(currentPage - 1) * USER_TABLE_PAGE_SIZE + 1}</span>
                            {' '}to{' '}
                            <span className="font-medium">
                                {Math.min(currentPage * USER_TABLE_PAGE_SIZE, users.length)}
                            </span>
                            {' '}of{' '}
                            <span className="font-medium">{users.length}</span> results
                        </p>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                        page === currentPage
                                            ? 'z-10 bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-600 dark:text-primary-400'
                                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                </div>
            )}
        </div>
    )
}
