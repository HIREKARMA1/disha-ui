'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, Menu, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

/**
 * Student top bar — matches Opportunity Hub header language.
 * Mobile: menu · logo · actions; optional search row
 * Desktop: search · Dashboard · Logout · theme (sidebar carries brand)
 */
export function StudentTopNav({
  className = '',
  onMenuOpen,
}: {
  className?: string
  onMenuOpen?: () => void
}) {
  const { logout } = useAuth()
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      router.push(`/jobs?search=${encodeURIComponent(q)}`)
    } else {
      router.push('/jobs')
    }
  }

  const searchSlot = (
    <form onSubmit={handleSearch} className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className={cn(
          'h-9 rounded-full border-primary-300 bg-white pl-10 shadow-none sm:h-10',
          'focus-visible:ring-2 focus-visible:ring-primary-500/40',
          'dark:border-primary-700 dark:bg-gray-900'
        )}
        aria-label="Search jobs"
      />
    </form>
  )

  const authActions = (
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
      <Link href="/dashboard/student" className="hidden md:block">
        <Button size="sm" variant="outline" className="h-8 rounded-full shadow-none">
          <User className="mr-1.5 h-3.5 w-3.5" />
          Dashboard
        </Button>
      </Link>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => logout()}
        className="hidden h-8 text-gray-600 dark:text-gray-400 md:inline-flex"
      >
        <LogOut className="mr-1.5 h-3.5 w-3.5" />
        Logout
      </Button>
      <ThemeToggle />
    </div>
  )

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-gray-200 bg-white',
        'dark:border-gray-800 dark:bg-gray-950',
        className
      )}
    >
      <div className="flex flex-col lg:h-14 lg:flex-row lg:items-center lg:gap-3 lg:px-6">
        <div className="flex h-12 items-center gap-2 px-3 sm:px-4 lg:order-2 lg:h-auto lg:shrink-0 lg:px-0">
          {onMenuOpen ? (
            <button
              type="button"
              onClick={onMenuOpen}
              className="shrink-0 rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          ) : null}
          <div className="min-w-0 shrink-0 lg:hidden">
            <BrandLogo href="/dashboard/student" priority compact />
          </div>
          <div className="ml-auto lg:ml-0">{authActions}</div>
        </div>

        <div className="min-w-0 flex-1 border-t border-gray-100 px-3 pb-2.5 pt-2 dark:border-gray-800/80 sm:px-4 lg:order-1 lg:border-0 lg:px-0 lg:pb-0 lg:pt-0">
          {searchSlot}
        </div>
      </div>
    </header>
  )
}
