"use client"

import { memo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type EventsTab = 'all' | 'registered'

interface EventsContentTabsProps {
  activeTab: EventsTab
  onChange: (tab: EventsTab) => void
}

function EventsContentTabsComponent({ activeTab, onChange }: EventsContentTabsProps) {
  const tabs: { id: EventsTab; label: string }[] = [
    { id: 'all', label: 'All Contests' },
    { id: 'registered', label: 'Registered Contests' },
  ]

  return (
    <div className="relative border-b border-gray-200 dark:border-gray-700">
      <div className="flex gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative px-4 py-3 text-sm font-semibold transition-colors sm:px-5 sm:text-base',
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
              )}
            >
              {tab.label}
              {isActive && (
                <motion.span
                  layoutId="events-portal-tab-indicator"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export const EventsContentTabs = memo(EventsContentTabsComponent)
