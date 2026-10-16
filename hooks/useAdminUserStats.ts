import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { userManagementService } from '@/services/userManagementService'
import { AdminUserStats } from '@/types/admin'
import { AdminUserStatsResponse } from '@/types/userManagement'
import { AdminManagedUserType } from '@/lib/userManagementConfig'
import {
    mapUserStatsToAdminUserStats,
    mapUserStatsToTypeCounts,
} from '@/utils/userStatsMappers'

const EMPTY_TYPE_COUNTS: Record<AdminManagedUserType, number> = {
    student: 0,
    university: 0,
    corporate: 0,
}

export function useAdminUserStats() {
    const { user } = useAuth()
    const [userStats, setUserStats] = useState<AdminUserStats | null>(null)
    const [typeCounts, setTypeCounts] = useState<Record<AdminManagedUserType, number>>(EMPTY_TYPE_COUNTS)
    const [rawStats, setRawStats] = useState<AdminUserStatsResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const refetch = useCallback(async () => {
        if (user?.user_type !== 'admin') {
            setIsLoading(false)
            return
        }
        setIsLoading(true)
        setError(null)

        try {
            const stats = await userManagementService.getUserStats()
            setRawStats(stats)
            setUserStats(mapUserStatsToAdminUserStats(stats))
            setTypeCounts(mapUserStatsToTypeCounts(stats))
        } catch (err) {
            console.error('Failed to fetch user stats:', err)
            setError('Failed to load user statistics.')
        } finally {
            setIsLoading(false)
        }
    }, [user?.user_type])

    useEffect(() => {
        refetch()
    }, [refetch])

    return {
        userStats,
        typeCounts,
        rawStats,
        isLoading,
        error,
        refetch,
    }
}
