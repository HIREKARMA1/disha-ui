'use client'

import Link from 'next/link'
import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuth } from '@/hooks/useAuth'
import { useAuthLoginModal } from '@/contexts/AuthLoginModalContext'
import { buildAuthPath } from '@/lib/authLinks'

function getDashboardPath(userType?: string) {
  if (!userType) return '/dashboard'
  return `/dashboard/${userType}`
}

const btnClass =
  'h-8 whitespace-nowrap rounded-full px-2.5 text-xs shadow-none sm:px-3.5 sm:text-sm'

/** Same Sign Up / Sign In / Dashboard / Logout / theme on all breakpoints. */
export function DishaAuthActions() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const { openLoginModal } = useAuthLoginModal()

  if (isLoading) {
    return (
      <div className="flex shrink-0 items-center gap-1.5">
        <div className="h-8 w-8 animate-pulse rounded-md bg-gray-200 dark:bg-gray-800" />
        <ThemeToggle />
      </div>
    )
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1 sm:gap-2">
      {isAuthenticated && user ? (
        <>
          <Link href={getDashboardPath(user.user_type)}>
            <Button size="sm" variant="outline" className={btnClass}>
              <User className="mr-1 h-3.5 w-3.5 sm:mr-1.5" />
              Dashboard
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className={`${btnClass} text-gray-600 dark:text-gray-400`}
          >
            <LogOut className="mr-1 h-3.5 w-3.5 sm:mr-1.5" />
            Logout
          </Button>
        </>
      ) : (
        <>
          <Link href={buildAuthPath('/auth/register')}>
            <Button size="sm" variant="outline" className={btnClass}>
              Sign Up
            </Button>
          </Link>
          <Button
            size="sm"
            className={`${btnClass} bg-primary-600 text-white hover:bg-primary-700 dark:border dark:border-[#232C42] dark:bg-[#141A29] dark:text-[#F4F6FA] dark:hover:bg-[#1B2334]`}
            onClick={() => openLoginModal()}
          >
            Sign In
          </Button>
        </>
      )}
      <ThemeToggle />
    </div>
  )
}
