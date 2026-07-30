'use client'

import Link from 'next/link'
import Image from 'next/image'
import { User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

/**
 * Student top bar — matches original Navbar actions on desktop.
 * Mobile: Logo + Theme Toggle only (Dashboard/Logout via bottom nav).
 */
export function StudentTopNav({ className = '' }: { className?: string }) {
  const { logout } = useAuth()

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-16 border-b border-gray-200/80 dark:border-white/10',
        'bg-white/95 dark:bg-[#0b0e14]/95 backdrop-blur-md',
        className
      )}
    >
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-3">
        <Link href="/dashboard/student" className="flex items-center shrink-0">
          <Image
            src="/images/HKlogoblack.png"
            alt="HireKarma Logo"
            width={150}
            height={50}
            priority
            className="h-8 w-auto object-contain sm:h-10 md:h-12 lg:h-11 dark:hidden"
          />
          <Image
            src="/images/HKlogowhite.png"
            alt="HireKarma Logo"
            width={150}
            height={50}
            priority
            className="hidden h-8 w-auto object-contain sm:h-10 md:h-12 lg:h-11 dark:block"
          />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/dashboard/student" className="hidden lg:block">
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
