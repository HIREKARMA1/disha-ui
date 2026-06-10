import { AdminUserListItem } from '@/types/userManagement'
import { USER_EXPORT_FILENAME_PREFIX } from '@/lib/userManagementConfig'

function escapeCsvCell(cell: unknown): string {
    const cellStr = String(cell ?? '').replace(/"/g, '""')
    if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr}"`
    }
    return cellStr
}

function formatPhoneForCsv(phone?: string | null): string {
    if (!phone) return ''
    return `="${String(phone).trim()}"`
}

function formatDateForCsv(value?: string | null): string {
    if (!value) return ''
    return new Date(value).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const USER_EXPORT_HEADERS = [
    'Display Name',
    'Name',
    'Email',
    'Phone',
    'User Type',
    'Status',
    'Verified',
    'Email Verified',
    'Phone Verified',
    'Location',
    'Institution',
    'Degree',
    'Branch',
    'Company Name',
    'Industry',
    'University Name',
    'Institute Type',
    'Profile Completion (%)',
    'Archived',
    'Created At',
    'Last Login',
] as const

function formatUserExportRow(user: AdminUserListItem): string[] {
    return [
        user.display_name || user.name || '',
        user.name || '',
        user.email || '',
        formatPhoneForCsv(user.phone),
        user.user_type || '',
        user.status || '',
        user.is_verified ? 'Yes' : 'No',
        user.email_verified ? 'Yes' : 'No',
        user.phone_verified ? 'Yes' : 'No',
        user.location || '',
        user.institution || '',
        user.degree || '',
        user.branch || '',
        user.company_name || '',
        user.industry || '',
        user.university_name || '',
        user.institute_type || '',
        user.profile_completion_percentage != null ? String(user.profile_completion_percentage) : '',
        user.is_archived == null ? '' : user.is_archived ? 'Yes' : 'No',
        formatDateForCsv(user.created_at),
        formatDateForCsv(user.last_login),
    ]
}

export function exportUsersToSpreadsheet(users: AdminUserListItem[], userTypeLabel?: string) {
    const csvContent = [
        USER_EXPORT_HEADERS.join(','),
        ...users.map((user) => formatUserExportRow(user).map(escapeCsvCell).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const timestamp = new Date().toISOString().split('T')[0]
    const typeSuffix = userTypeLabel ? `_${userTypeLabel.toLowerCase()}` : ''
    link.href = url
    link.download = `${USER_EXPORT_FILENAME_PREFIX}${typeSuffix}_${timestamp}.csv`
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
