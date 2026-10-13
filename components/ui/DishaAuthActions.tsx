'use client'

import Link from 'next/link'
import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuth } from '@/hooks/useAuth'
import { useAuthLoginModal } from '@/contexts/AuthLoginModalContext'
import { buildAuthPath } from '@/lib/authLinks'
import { cn } from '@/lib/utils'

function getDashboardPath(userType?: string) {
  if (!userType) return '/dashboard'
  return `/dashboard/${userType}`
}

const iconBtnClass =
  'h-8 shrink-0 rounded-full shadow-none max-sm:h-9 max-sm:w-9 max-sm:p-0 sm:px-3.5 sm:text-sm'

const textBtnClass =
  'h-8 shrink-0 rounded-full px-2.5 text-[11px] shadow-none sm:px-3.5 sm:text-sm'

/** Sign Up / Sign In / Dashboard / Logout / theme — compact icon buttons below sm. */
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
    <div className="flex shrink-0 items-center justify-end gap-0.5 sm:gap-2">
      {isAuthenticated && user ? (
        <>
          <Link href={getDashboardPath(user.user_type)}>
            <Button
              size="sm"
              variant="outline"
              className={iconBtnClass}
              aria-label="Dashboard"
            >
              <User className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className={cn(iconBtnClass, 'text-gray-600 dark:text-gray-400')}
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </>
      ) : (
        <>
          <Link href={buildAuthPath('/auth/register')}>
            <Button size="sm" variant="outline" className={textBtnClass} aria-label="Sign up">
              Sign Up
            </Button>
          </Link>
          <Button
            size="sm"
            className={cn(
              textBtnClass,
              'bg-primary-600 text-white hover:bg-primary-700 dark:border dark:border-[#232C42] dark:bg-[#141A29] dark:text-[#F4F6FA] dark:hover:bg-[#1B2334]'
            )}
            onClick={() => openLoginModal()}
            aria-label="Sign in"
          >
            Sign In
          </Button>
        </>
      )}
      <ThemeToggle />
    </div>
  )
}
