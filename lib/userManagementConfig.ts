import { UserType } from '@/types/auth'

export type AdminManagedUserType = Extract<UserType, 'student' | 'university' | 'corporate'>

/** Tab filter for the admin user table: all managed roles, or one role. */
export type AdminUserTypeFilter = 'all' | AdminManagedUserType

export const ADMIN_MANAGED_USER_TYPES: AdminManagedUserType[] = [
    'student',
    'university',
    'corporate',
]

export const ADMIN_USER_TYPE_FILTERS: AdminUserTypeFilter[] = [
    'all',
    ...ADMIN_MANAGED_USER_TYPES,
]

export const DEFAULT_ADMIN_USER_TYPE: AdminUserTypeFilter = 'all'

export const USER_TYPE_LABELS: Record<AdminManagedUserType, string> = {
    student: 'Students',
    university: 'Universities',
    corporate: 'Corporates',
}

export const USER_TYPE_FILTER_LABELS: Record<AdminUserTypeFilter, string> = {
    all: 'All Users',
    student: 'Students',
    university: 'Universities',
    corporate: 'Corporates',
}

export const USER_TYPE_SINGULAR_LABELS: Record<AdminManagedUserType, string> = {
    student: 'Student',
    university: 'University',
    corporate: 'Corporate',
}

export const USER_STATUS_FILTER_OPTIONS = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'pending', label: 'Pending' },
] as const

export const USER_VERIFICATION_FILTER_OPTIONS = [
    { value: 'all', label: 'All Verification' },
    { value: 'verified', label: 'Verified' },
    { value: 'unverified', label: 'Unverified' },
] as const

export const USER_TABLE_PAGE_SIZE = 10

export const USER_EXPORT_FILENAME_PREFIX = 'disha_users_export'
