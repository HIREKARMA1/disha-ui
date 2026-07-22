"use client"

import { memo } from 'react'
import Link from 'next/link'
import { User, ExternalLink, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { cn } from '@/lib/utils'

const CANDIDATE_PORTAL_URL = 'https://disha.hirekarma.in'

function getDashboardPath(userType?: string) {
  if (!userType) return '/dashboard'
  return `/dashboard/${userType}`
}

function EventsPortalHeaderComponent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/95 backdrop-blur-md',
        'dark:border-gray-800/80 dark:bg-gray-950/95'
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <BrandLogo href="/events" priority />

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/events"
            className="text-sm font-medium text-primary-600 dark:text-primary-400"
          >
            Contests
          </Link>
          <Link
            href="/jobs"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
          >
            Jobs
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {isLoading ? (
            <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          ) : isAuthenticated && user ? (
            <>
              <Link href={getDashboardPath(user.user_type)}>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                >
                  <User className="mr-1.5 h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="hidden text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 sm:inline-flex"
              >
                <LogOut className="mr-1.5 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <a href={CANDIDATE_PORTAL_URL} target="_blank" rel="noopener noreferrer">
              <Button
                size="sm"
                className="bg-gradient-to-r from-secondary-500 to-primary-500 text-white hover:from-secondary-600 hover:to-primary-600"
              >
                <span className="hidden sm:inline">Candidate Login</span>
                <span className="sm:hidden">Candidate</span>
                <ExternalLink className="ml-1.5 h-3.5 w-3.5 opacity-80" />
              </Button>
            </a>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

export const EventsPortalHeader = memo(EventsPortalHeaderComponent)
