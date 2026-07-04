"use client"

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { EventFilters } from '@/components/events/EventFilters'
import { EventCard } from '@/components/events/EventCard'
import { contestEventService } from '@/services/contestEventService'
import type { ContestEventListItem } from '@/types/contestEvent'
import { Loader2, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function EventsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [events, setEvents] = useState<ContestEventListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'registered'>('all')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    prize_type: 'all',
  })
  const [pagination, setPagination] = useState({
    page: 1,
    total_pages: 1,
    total_count: 0,
    has_next: false,
    has_prev: false,
  })

  const page = parseInt(searchParams.get('page') || '1', 10)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const result = await contestEventService.listPublicEvents({
        page,
        limit: 10,
        search: search || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        category: filters.category !== 'all' ? filters.category : undefined,
        prize_type: filters.prize_type !== 'all' ? filters.prize_type : undefined,
        registered_only: activeTab === 'registered',
      })
      setEvents(result.events)
      setPagination({
        page: result.page,
        total_pages: result.total_pages,
        total_count: result.total_count,
        has_next: result.has_next,
        has_prev: result.has_prev,
      })
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [page, search, filters, activeTab])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`/events?${params.toString()}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar variant="transparent" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 max-w-7xl flex-grow">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Events & Contests
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover hackathons, workshops, placement drives, and competitions
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
          {(['all', 'registered'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); goToPage(1) }}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
                activeTab === tab
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              {tab === 'all' ? 'All Events' : 'Registered Events'}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Filter Panel */}
          <aside className="lg:w-64 flex-shrink-0">
            <EventFilters filters={filters} onChange={setFilters} />
          </aside>

          {/* Center Content */}
          <main className="flex-1 min-w-0">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by title, organizer, category, prize..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && goToPage(1)}
                className="pl-10 bg-white dark:bg-gray-800"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                <p className="text-lg font-medium">No events found</p>
                <p className="text-sm mt-1">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.has_prev}
                  onClick={() => goToPage(page - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </Button>
                {Array.from({ length: Math.min(pagination.total_pages, 5) }, (_, i) => {
                  const p = i + 1
                  return (
                    <Button
                      key={p}
                      variant={p === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => goToPage(p)}
                      className="min-w-[36px]"
                    >
                      {p}
                    </Button>
                  )
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.has_next}
                  onClick={() => goToPage(page + 1)}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function EventsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    }>
      <EventsPageContent />
    </Suspense>
  )
}
