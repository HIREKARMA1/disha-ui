import { AdminUserStats } from '@/types/admin'
import { AdminUserStatsResponse } from '@/types/userManagement'
import { AdminManagedUserType } from '@/lib/userManagementConfig'

function getDistributionCounts(stats: AdminUserStatsResponse): Record<AdminManagedUserType, number> {
    const distribution = stats.user_type_distribution || {}
    return {
        student: distribution.student ?? stats.students ?? 0,
        university: distribution.university ?? stats.universities ?? 0,
        corporate: distribution.corporate ?? stats.corporates ?? 0,
    }
}

/** Map User Management API stats to admin dashboard user stat cards. */
export function mapUserStatsToAdminUserStats(stats: AdminUserStatsResponse): AdminUserStats {
    const counts = getDistributionCounts(stats)
    return {
        total_users: stats.total_users,
        total_students: counts.student,
        total_corporates: counts.corporate,
        total_universities: counts.university,
    }
}

/** Map User Management API stats to user-type tab counts. */
export function mapUserStatsToTypeCounts(
    stats: AdminUserStatsResponse
): Record<AdminManagedUserType, number> {
    return getDistributionCounts(stats)
}
