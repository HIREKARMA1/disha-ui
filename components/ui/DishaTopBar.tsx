'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { Input } from '@/components/ui/input'
import { DishaAuthActions } from '@/components/ui/DishaAuthActions'
import { cn } from '@/lib/utils'

export function DishaTopBar({
  searchPlaceholder = 'Search opportunities, events, resources…',
  showSearch = true,
}: {
  searchPlaceholder?: string
  showSearch?: boolean
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/?q=${encodeURIComponent(q)}` : '/')
  }

  const searchField = (
    <form onSubmit={onSearch} className="min-w-0 w-full flex-1">
      <div
        className={cn(
          'relative rounded-full transition-shadow duration-200',
          searchFocused && 'ring-2 ring-primary-500/40 shadow-sm'
        )}
      >
        <Search
          className={cn(
            'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors',
            searchFocused ? 'text-primary-500' : 'text-gray-400'
          )}
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder={searchPlaceholder}
          className={cn(
            'h-9 rounded-full border-primary-300 bg-white pl-10 shadow-none sm:h-10',
            'transition-colors focus-visible:border-primary-500 focus-visible:ring-0',
            'dark:border-[#232C42] dark:bg-[#141A29] dark:text-[#F4F6FA] dark:placeholder:text-[#5B6684] dark:focus-visible:border-[#33405E]'
          )}
          aria-label={searchPlaceholder}
          autoComplete="off"
        />
      </div>
    </form>
  )

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-gray-200 bg-white',
        'dark:border-[#1A2233] dark:bg-[rgba(10,13,20,0.85)] dark:backdrop-blur-[10px]'
      )}
    >
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 sm:px-4 lg:h-14 lg:flex-nowrap lg:gap-4 lg:px-6 lg:py-0">
        <BrandLogo href="/" priority compact className="shrink-0" />

        {showSearch ? (
          <div className="order-3 min-w-0 w-full lg:order-none lg:flex-1">{searchField}</div>
        ) : (
          <div className="hidden min-w-0 flex-1 lg:block" />
        )}

        <div className="ml-auto">
          <DishaAuthActions />
        </div>
      </div>
    </header>
  )
}
