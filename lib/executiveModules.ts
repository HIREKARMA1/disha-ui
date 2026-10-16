export const EXECUTIVE_MODULES = [
  { key: 'corporate', label: 'Corporate', href: '/dashboard/admin/corporates' },
  { key: 'partner_logo', label: 'Partner Logo', href: '/dashboard/admin/partner-logos' },
  { key: 'jobs', label: 'Jobs', href: '/dashboard/admin/jobs' },
  { key: 'university_approval', label: 'University Approval', href: '/dashboard/admin/university-approval' },
  { key: 'job_request', label: 'Job Request', href: '/dashboard/admin/campus-drive-requests' },
  { key: 'event', label: 'Event', href: '/dashboard/admin/events' },
  { key: 'campus_drive', label: 'Campus Drive', href: '/dashboard/admin/campus-drives' },
  { key: 'blogs', label: 'Blogs', href: '/dashboard/admin/blogs' },
  { key: 'bulk_mail', label: 'Bulk Mail', href: '/dashboard/admin/bulk-email' },
  { key: 'bulk_whatsapp', label: 'Bulk WhatsApp', href: '/dashboard/admin/bulk-whatsapp' },
  { key: 'support', label: 'Support', href: '/dashboard/admin/support' },
] as const

export type ExecutiveModuleKey = (typeof EXECUTIVE_MODULES)[number]['key']

export function executivePathForAdminPath(pathname: string): string {
  return pathname.replace(/^\/dashboard\/admin(?=\/|$)/, '/dashboard/executive')
}

export function executiveModuleForPath(pathname: string): ExecutiveModuleKey | null {
  const adminPath = pathname.replace(/^\/dashboard\/executive(?=\/|$)/, '/dashboard/admin')
  const match = EXECUTIVE_MODULES.find(({ href }) => adminPath === href || adminPath.startsWith(`${href}/`))
  return match?.key ?? null
}

export function executiveHasModule(user: { permissions?: { modules?: string[] } } | null | undefined, module: string) {
  return Array.isArray(user?.permissions?.modules) && user.permissions.modules.includes(module)
}

export function canUseExecutiveModule(user: {
  user_type?: string
  role?: string
  permissions?: { modules?: string[] }
} | null | undefined, module: string) {
  return user?.user_type === 'admin' || (
    user?.user_type === 'executive' && user.role === 'executive' && executiveHasModule(user, module)
  )
}
