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

const EXEC_MODULES = [
    ['corporate', 'Corporate'], ['partner_logo', 'Partner Logo'], ['jobs', 'Jobs'],
    ['university_approval', 'University Approval'], ['job_request', 'Job Request'], ['event', 'Event'],
    ['campus_drive', 'Campus Drive'], ['blogs', 'Blogs'], ['bulk_mail', 'Bulk Mail'],
    ['bulk_whatsapp', 'Bulk WhatsApp'], ['support', 'Support'],
] as const
const ALL_EXEC_MODULE_KEYS = EXEC_MODULES.map(([key]) => key)

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
    const [executives, setExecutives] = useState<any[]>([])
    const [execName, setExecName] = useState('')
    const [execEmail, setExecEmail] = useState('')
    const [execPassword, setExecPassword] = useState('')
    const [execModules, setExecModules] = useState<string[]>(ALL_EXEC_MODULE_KEYS)

    const loadExecutives = useCallback(async () => {
        try { const response = await apiClient.client.get('/admins/executives'); setExecutives(response.data) }
        catch { /* Regular user listing remains available if executive management is not configured. */ }
    }, [])
    useEffect(() => { void loadExecutives() }, [loadExecutives])

    const saveExecutive = async () => {
        try {
            await apiClient.client.post('/admins/executives', { name: execName, email: execEmail, password: execPassword, modules: execModules })
            toast.success('Executive account created')
            setExecName(''); setExecEmail(''); setExecPassword(''); setExecModules(ALL_EXEC_MODULE_KEYS)
            await loadExecutives()
        } catch (error) { toast.error(getErrorMessage(error)) }
    }

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
            <UserManagementHero />
            <section className="rounded-xl border bg-white p-5 dark:bg-gray-900">
                <h2 className="mb-4 text-lg font-semibold">Executive accounts</h2>
                <div className="grid gap-3 md:grid-cols-3">
                    <input className="rounded border p-2" placeholder="Name" value={execName} onChange={e => setExecName(e.target.value)} />
                    <input className="rounded border p-2" placeholder="Email" type="email" value={execEmail} onChange={e => setExecEmail(e.target.value)} />
                    <input className="rounded border p-2" placeholder="Initial password" type="password" value={execPassword} onChange={e => setExecPassword(e.target.value)} />
                </div>
                <div className="my-4 flex flex-wrap gap-3">{EXEC_MODULES.map(([key, label]) => <label key={key} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={execModules.includes(key)} onChange={e => setExecModules(current => e.target.checked ? [...current, key] : current.filter(value => value !== key))} />{label}</label>)}</div>
                <button className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50" disabled={!execName || !execEmail || execPassword.length < 8} onClick={() => void saveExecutive()}>Create Executive</button>
                <div className="mt-4 space-y-2">{executives.map(exec => <div key={exec.id} className="flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-sm"><span>{exec.name} · {exec.email} · {exec.status}</span><div className="flex flex-wrap gap-2">{EXEC_MODULES.map(([key, label]) => <label key={key} className="flex items-center gap-1"><input type="checkbox" checked={(exec.permissions?.modules || []).includes(key)} onChange={async e => { const modules = e.target.checked ? [...(exec.permissions?.modules || []), key] : (exec.permissions?.modules || []).filter((value: string) => value !== key); await apiClient.client.patch(`/admins/executives/${exec.id}`, { modules }); await loadExecutives() }} />{label}</label>)}<button className="underline" onClick={async () => { await apiClient.client.patch(`/admins/executives/${exec.id}`, { active: exec.status !== 'active' }); await loadExecutives() }}>{exec.status === 'active' ? 'Deactivate' : 'Activate'}</button></div></div>)}</div>
            </section>

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
