"use client"

import { cn } from '@/lib/utils'
import { EVENT_CATEGORIES } from '@/types/contestEvent'

interface EventFiltersProps {
  filters: {
    status: string
    category: string
    prize_type: string
  }
  onChange: (filters: { status: string; category: string; prize_type: string }) => void
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'live', label: 'Live' },
  { value: 'closed', label: 'Closed' },
  { value: 'registration_open', label: 'Registration Open' },
  { value: 'registration_closed', label: 'Registration Closed' },
]

const PRIZE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
]

export function EventFilters({ filters, onChange }: EventFiltersProps) {
  const update = (key: string, value: string) => {
    onChange({ ...filters, [key]: value })
  }

  const FilterGroup = ({ title, options, active, groupKey }: {
    title: string
    options: { value: string; label: string }[]
    active: string
    groupKey: string
  }) => (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
      <div className="space-y-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => update(groupKey, opt.value)}
            className={cn(
              'block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors',
              active === opt.value
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sticky top-24">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
      <FilterGroup title="Contest Status" options={STATUS_OPTIONS} active={filters.status} groupKey="status" />
      <FilterGroup
        title="Category"
        options={[{ value: 'all', label: 'All' }, ...EVENT_CATEGORIES]}
        active={filters.category}
        groupKey="category"
      />
      <FilterGroup title="Prize Pool" options={PRIZE_OPTIONS} active={filters.prize_type} groupKey="prize_type" />
    </div>
  )
}
