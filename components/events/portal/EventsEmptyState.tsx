"use client"

import { memo } from 'react'
import { Trophy, SearchX } from 'lucide-react'

function EventsEmptyStateComponent() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-900/50">
      <div className="relative mb-6 flex h-28 w-28 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/40 dark:to-secondary-900/40" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg dark:bg-gray-800">
          <SearchX className="h-9 w-9 text-primary-500" />
        </div>
        <Trophy className="absolute -right-1 -top-1 h-8 w-8 text-accent-yellow-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
        No contests match your filters
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        Try changing status, category, or search terms. New hackathons, workshops, and placement
        drives are added regularly on HireKarma.
      </p>
    </div>
  )
}

export const EventsEmptyState = memo(EventsEmptyStateComponent)
