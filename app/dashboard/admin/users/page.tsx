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
    ADMIN_USER_TYPE_FILTERS,
    AdminUserTypeFilter,
    DEFAULT_ADMIN_USER_TYPE,
} from '@/lib/userManagementConfig'
import { exportUsersToSpreadsheet } from '@/utils/exportUsers'
import { apiClient } from '@/lib/api'
import { EXECUTIVE_MODULES } from '@/lib/executiveModules'

type ExecutiveAccount = {
    id: string
    name: string
    email: string
    status: string
    permissions?: { modules?: string[] }
}

function ExecutiveAccountsPanel() {
    const [accounts, setAccounts] = useState<ExecutiveAccount[]>([])
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [modules, setModules] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    const reload = useCallback(async () => {
        try {
            const response = await apiClient.client.get('/admins/executives')
            setAccounts(Array.isArray(response.data) ? response.data : [])
        } catch (error) {
            toast.error(getErrorMessage(error, 'Could not load Executive accounts'))
        }
    }, [])

    useEffect(() => { void reload() }, [reload])

    const create = async (event: React.FormEvent) => {
        event.preventDefault()
        setLoading(true)
        try {
            await apiClient.client.post('/admins/executives', { name, email, password, modules })
            setName('')
            setEmail('')
            setPassword('')
            setModules([])
            toast.success('Executive account created')
            await reload()
        } catch (error) {
            toast.error(getErrorMessage(error, 'Could not create Executive account'))
        } finally {
            setLoading(false)
        }
    }

    const update = async (account: ExecutiveAccount, body: { modules?: string[]; active?: boolean }) => {
        try {
            await apiClient.client.patch(`/admins/executives/${account.id}`, body)
            await reload()
        } catch (error) {
            toast.error(getErrorMessage(error, 'Could not update Executive account'))
        }
    }

    return (
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="text-lg font-semibold">Executive accounts</h2>
            <form onSubmit={create} className="mt-4 grid gap-3 md:grid-cols-3">
                <input required value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="rounded-lg border px-3 py-2 dark:bg-gray-950" />
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="rounded-lg border px-3 py-2 dark:bg-gray-950" />
                <input required minLength={8} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Temporary password (8+ characters)" className="rounded-lg border px-3 py-2 dark:bg-gray-950" />
                <div className="flex flex-wrap gap-x-4 gap-y-2 md:col-span-3">
                    {EXECUTIVE_MODULES.map(module => (
                        <label key={module.key} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={modules.includes(module.key)} onChange={e => setModules(current => e.target.checked ? [...current, module.key] : current.filter(key => key !== module.key))} />
                            {module.label}
                        </label>
                    ))}
                </div>
                <button disabled={loading} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50 md:col-span-3">Create Executive</button>
            </form>
            <div className="mt-5 space-y-4">
                {accounts.map(account => (
                    <div key={account.id} className="border-t pt-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div><strong>{account.name}</strong><span className="ml-2 text-sm text-gray-500">{account.email} · {account.status}</span></div>
                            <button type="button" onClick={() => update(account, { active: account.status.toLowerCase() !== 'active' })} className="text-sm font-semibold text-blue-700 underline">
                                {account.status.toLowerCase() === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                            {EXECUTIVE_MODULES.map(module => {
                                const assigned = account.permissions?.modules || []
                                return <label key={module.key} className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={assigned.includes(module.key)} onChange={e => void update(account, { modules: e.target.checked ? [...assigned, module.key] : assigned.filter(key => key !== module.key) })} />
                                    {module.label}
                                </label>
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

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
    const [activeUserType, setActiveUserType] = useState<AdminUserTypeFilter>(DEFAULT_ADMIN_USER_TYPE)
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
            // Omit user_type for "all" so the API returns students + corporate + university.
            const response = await userManagementService.getUsers({
                ...(activeUserType !== 'all' ? { user_type: activeUserType } : {}),
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
                exportUsersToSpreadsheet(
                    filteredUsers,
                    activeUserType === 'all' ? 'all_users' : activeUserType
                )
                toast.success('Users exported successfully!')
                return
            }

            const blob = await userManagementService.exportUsers({
                ...(activeUserType !== 'all' ? { user_type: activeUserType } : {}),
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

    const handleTypeChange = (type: AdminUserTypeFilter) => {
        if (!ADMIN_USER_TYPE_FILTERS.includes(type)) return
        setActiveUserType(type)
    }

    return (
        <div className="space-y-6">
            <ExecutiveAccountsPanel />
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
