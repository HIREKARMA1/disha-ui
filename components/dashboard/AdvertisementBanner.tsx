"use client"

import { UpcomingEventsCard } from './UpcomingEventsCard'

interface AdvertisementBannerProps {
  className?: string
}

export function AdvertisementBanner({ className = '' }: AdvertisementBannerProps) {
  return <UpcomingEventsCard className={className} />
}
