'use client'

import { useCallback, useEffect, useState } from 'react'
import { contestEventService } from '@/services/contestEventService'
import type { ContestEventListItem } from '@/types/contestEvent'
import {
  getLocalDateKey,
  isEventPopupLoginPending,
  readEventPopupStorage,
  writeEventPopupDismissed,
  type EventPopupStorage,
} from '@/lib/eventPopupStorage'

const FETCH_LIMIT = 5

/** Keep only published, non-cancelled active events (upcoming/live). */
function filterActiveEvents(events: ContestEventListItem[]): ContestEventListItem[] {
  return events.filter((event) => {
    if (event.is_cancelled) return false
    if (event.contest_status === 'cancelled' || event.contest_status === 'archived') return false
    if (event.contest_status === 'closed' || event.contest_status === 'draft') return false
    if (event.is_published === false) return false
    if (event.publication_status && event.publication_status !== 'published') return false
    return event.contest_status === 'upcoming' || event.contest_status === 'live'
  })
}

function hasNewEventSince(events: ContestEventListItem[], stored: EventPopupStorage): boolean {
  const knownIds = new Set(stored.eventIds)
  return events.some((event) => !knownIds.has(event.id))
}

/**
 * Show when:
 * - User just logged in (login pending flag), OR
 * - Calendar day changed since last dismiss (still logged in overnight), OR
 * - A new active event appeared since last dismiss
 */
function shouldDisplayPopup(events: ContestEventListItem[]): boolean {
  if (events.length === 0) return false

  if (isEventPopupLoginPending()) return true

  const stored = readEventPopupStorage()
  if (!stored) return true

  if (hasNewEventSince(events, stored)) return true

  // Daily: show again on a new local calendar day while still logged in
  if (stored.date !== getLocalDateKey()) return true

  return false
}

export interface UseEventPopupResult {
  events: ContestEventListItem[]
  isOpen: boolean
  isLoading: boolean
  close: () => void
}

/**
 * Fetches upcoming events once.
 * Visibility: every login + once per calendar day if the user stays logged in.
 */
export function useEventPopup(enabled = true): UseEventPopupResult {
  const [events, setEvents] = useState<ContestEventListItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(enabled)

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false)
      setIsOpen(false)
      return
    }

    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      try {
        const res = await contestEventService.getUpcomingEvents(FETCH_LIMIT)
        if (cancelled) return
        const active = filterActiveEvents(res.events ?? [])
        setEvents(active)
        setIsOpen(shouldDisplayPopup(active))
      } catch {
        if (!cancelled) {
          setEvents([])
          setIsOpen(false)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [enabled])

  const close = useCallback(() => {
    setIsOpen(false)
    writeEventPopupDismissed(events.map((e) => e.id))
  }, [events])

  return { events, isOpen, isLoading, close }
}
