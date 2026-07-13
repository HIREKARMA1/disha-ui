"use client"

import { UpcomingEventsCard } from './UpcomingEventsCard'

interface AdvertisementBannerProps {
  className?: string
}

/**
 * Dashboard sidebar widget for upcoming events.
 * Wraps UpcomingEventsCard so existing dashboard imports keep working.
 */
export function AdvertisementBanner({ className = '' }: AdvertisementBannerProps) {
  return <UpcomingEventsCard className={className} />
}
