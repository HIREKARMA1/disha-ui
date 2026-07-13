"use client"

import { createContext, useContext } from 'react'
import { useAdminUserStats } from '@/hooks/useAdminUserStats'
import { AdminUserStats } from '@/types/admin'
import { AdminUserStatsResponse } from '@/types/userManagement'
import { AdminManagedUserType } from '@/lib/userManagementConfig'

interface AdminUserStatsContextValue {
    userStats: AdminUserStats | null
    typeCounts: Record<AdminManagedUserType, number>
    rawStats: AdminUserStatsResponse | null
    isLoading: boolean
    error: string | null
    refetch: () => Promise<void>
}

const AdminUserStatsContext = createContext<AdminUserStatsContextValue | null>(null)

export function AdminUserStatsProvider({ children }: { children: React.ReactNode }) {
    const value = useAdminUserStats()
    return (
        <AdminUserStatsContext.Provider value={value}>
            {children}
        </AdminUserStatsContext.Provider>
    )
}

export function useAdminUserStatsContext(): AdminUserStatsContextValue {
    const context = useContext(AdminUserStatsContext)
    if (!context) {
        throw new Error('useAdminUserStatsContext must be used within AdminUserStatsProvider')
    }
    return context
}
