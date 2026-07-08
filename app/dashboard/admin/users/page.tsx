"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAdminUserStatsContext } from '@/contexts/AdminUserStatsContext'
import { toast } from 'react-hot-toast'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { UserManagementHero } from '@/components/dashboard/admin/users/UserManagementHero'
import { UserTypeStatsTabs } from '@/components/dashboard/admin/users/UserTypeStatsTabs'
import { UserManagementToolbar } from '@/components/dashboard/admin/users/UserManagementToolbar'
import { UserTable } from '@/components/dashboard/admin/users/UserTable'
import { userManagementService } from '@/services/userManagementService'
import { AdminUserListItem } from '@/types/userManagement'
import { getErrorMessage } from '@/lib/error-handler'
import {
    ADMIN_MANAGED_USER_TYPES,
    AdminManagedUserType,
    DEFAULT_ADMIN_USER_TYPE,
} from '@/lib/userManagementConfig'
import { exportUsersToSpreadsheet } from '@/utils/exportUsers'

function toIsoDateStart(dateValue: string): string | undefined {
    if (!dateValue) return undefined
    return new Date(`${dateValue}T00:00:00`).toISOString()
}

function toIsoDateEnd(dateValue: string): string | undefined {
    if (!dateValue) return undefined
    return new Date(`${dateValue}T23:59:59.999`).toISOString()
}

function matchesCreatedDateRange(
    createdAt: string | null | undefined,
    createdAfter: string,
    createdBefore: string
) {
    if (!createdAfter && !createdBefore) return true
    if (!createdAt) return false

    const createdTime = new Date(createdAt).getTime()
    if (createdAfter) {
        const afterTime = new Date(`${createdAfter}T00:00:00`).getTime()
        if (createdTime < afterTime) return false
    }
    if (createdBefore) {
        const beforeTime = new Date(`${createdBefore}T23:59:59.999`).getTime()
        if (createdTime > beforeTime) return false
    }
    return true
}

function AdminUsersContent() {
    const { typeCounts } = useAdminUserStatsContext()
    const [users, setUsers] = useState<AdminUserListItem[]>([])
    const [activeUserType, setActiveUserType] = useState<AdminManagedUserType>(DEFAULT_ADMIN_USER_TYPE)
    const [isLoading, setIsLoading] = useState(true)
    const [isExporting, setIsExporting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [verificationFilter, setVerificationFilter] = useState('all')
    const [createdAfter, setCreatedAfter] = useState('')
    const [createdBefore, setCreatedBefore] = useState('')

    const fetchUsers = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await userManagementService.getUsers({
                user_type: activeUserType,
                fetch_all: true,
            })
            setUsers(response.users)
        } catch (err) {
            console.error('Failed to fetch users:', err)
            setError('Failed to load users. Please try again.')
            toast.error('Failed to load users.')
        } finally {
            setIsLoading(false)
        }
    }, [activeUserType])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const search = searchTerm.trim().toLowerCase()
            const matchesSearch =
                search === '' ||
                [
                    user.display_name,
                    user.name,
                    user.email,
                    user.phone,
                    user.location,
                    user.institution,
                    user.company_name,
                    user.university_name,
                    user.degree,
                    user.industry,
                ].some((value) => value && value.toLowerCase().includes(search))

            const matchesStatus =
                statusFilter === 'all' || user.status === statusFilter

            const matchesVerification =
                verificationFilter === 'all' ||
                (verificationFilter === 'verified' && user.is_verified) ||
                (verificationFilter === 'unverified' && !user.is_verified)

            const matchesDate = matchesCreatedDateRange(
                user.created_at,
                createdAfter,
                createdBefore
            )

            return matchesSearch && matchesStatus && matchesVerification && matchesDate
        })
    }, [users, searchTerm, statusFilter, verificationFilter, createdAfter, createdBefore])

    const handleExport = async () => {
        setIsExporting(true)
        try {
            if (filteredUsers.length > 0) {
                exportUsersToSpreadsheet(filteredUsers, activeUserType)
                toast.success('Users exported successfully!')
                return
            }

            const blob = await userManagementService.exportUsers({
                user_type: activeUserType,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                is_verified:
                    verificationFilter === 'verified'
                        ? true
                        : verificationFilter === 'unverified'
                          ? false
                          : undefined,
                query: searchTerm || undefined,
                created_after: toIsoDateStart(createdAfter),
                created_before: toIsoDateEnd(createdBefore),
            })

            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `users_export_${activeUserType}_${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            toast.success('Users exported successfully!')
        } catch (err) {
            console.error('Failed to export users:', err)
            toast.error(getErrorMessage(err))
        } finally {
            setIsExporting(false)
        }
    }

    const handleTypeChange = (type: AdminManagedUserType) => {
        if (!ADMIN_MANAGED_USER_TYPES.includes(type)) return
        setActiveUserType(type)
    }

    return (
        <div className="space-y-6">
            <UserManagementHero />

            <UserTypeStatsTabs
                activeType={activeUserType}
                counts={typeCounts}
                onTypeChange={handleTypeChange}
            />

            <UserManagementToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                verificationFilter={verificationFilter}
                onVerificationFilterChange={setVerificationFilter}
                createdAfter={createdAfter}
                onCreatedAfterChange={setCreatedAfter}
                createdBefore={createdBefore}
                onCreatedBeforeChange={setCreatedBefore}
                onExport={handleExport}
                isExporting={isExporting}
            />

            <UserTable
                users={filteredUsers}
                userType={activeUserType}
                isLoading={isLoading}
                error={error}
                onRetry={fetchUsers}
            />
        </div>
    )
}

export default function AdminUsersPage() {
    return (
        <AdminDashboardLayout>
            <AdminUsersContent />
        </AdminDashboardLayout>
    )
}
