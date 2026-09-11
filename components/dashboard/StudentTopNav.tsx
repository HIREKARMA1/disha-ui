'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, LogOut, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const STUDENT_HOME = '/dashboard/student'

/**
 * Student top bar — matches original Navbar actions on desktop.
 * Mobile: Disha logo + Theme Toggle (Dashboard/Logout via bottom nav).
 * Inner pages: compact back to Dashboard (hidden on Dashboard home).
 */
export function StudentTopNav({ className = '' }: { className?: string }) {
  const { logout } = useAuth()
  const pathname = usePathname()
  const normalized = (pathname || '').replace(/\/$/, '') || '/'
  const showBack = normalized !== STUDENT_HOME

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-16 border-b border-gray-200/80 dark:border-white/10',
        'bg-white/95 dark:bg-[#0b0e14]/95 backdrop-blur-md',
        className
      )}
    >
      <div className="flex h-full items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          {showBack && (
            <Link
              href={STUDENT_HOME}
              aria-label="Back to dashboard"
              className={cn(
                'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9',
                'border border-gray-200 bg-white text-gray-700 shadow-sm',
                'transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700',
                'active:scale-[0.96]',
                'dark:border-white/10 dark:bg-white/5 dark:text-gray-200',
                'dark:hover:border-primary-800 dark:hover:bg-primary-950/50 dark:hover:text-primary-300',
                'lg:hidden'
              )}
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.25} />
            </Link>
          )}
          <BrandLogo href={STUDENT_HOME} compact />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href={STUDENT_HOME} className="hidden lg:block">
            <Button className="flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white shadow-sm">
              <User className="w-4 h-4" />
              <span>Dashboard</span>
            </Button>
          </Link>

          <Button
            type="button"
            variant="ghost"
            onClick={() => logout()}
            className="hidden lg:flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
