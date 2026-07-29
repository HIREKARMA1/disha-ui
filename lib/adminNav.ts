/** Shared admin sidebar active-state logic (used by AdminSidebar and module sub-navs). */
export function navItemIsActive(pathname: string, href: string) {
  if (pathname === href) return true
  if (href === '/dashboard/admin') return false
  return pathname.startsWith(`${href}/`)
}
