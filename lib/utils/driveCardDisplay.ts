import { formatCardLocation } from '@/lib/utils/cardLocationLabel'

function defaultVenueForMode(mode?: string): string {
  const normalized = (mode ?? '').toLowerCase()
  if (normalized === 'online') return 'Online'
  if (normalized === 'hybrid') return 'Hybrid / Campus'
  return 'On campus'
}

export function resolveDriveCardLocation(venue: string | undefined, mode?: string) {
  const trimmed = venue?.trim() ?? ''
  const raw = trimmed || defaultVenueForMode(mode)
  return formatCardLocation(raw)
}

export function companyFromDriveTitle(title: string): string | undefined {
  const parts = title.split(/\s[–—-]\s/)
  if (parts.length < 2) return undefined
  const tail = parts[parts.length - 1]?.trim() ?? ''
  if (tail.length < 2 || tail.length > 120) return undefined
  return tail
}

export function driveCardCompanyLine(options: {
  title: string
  organizerName?: string | null
  subtitle?: string | null
}): string | undefined {
  const organizer = options.organizerName?.trim()
  if (organizer) return organizer

  const fromTitle = companyFromDriveTitle(options.title)
  if (fromTitle) return fromTitle

  const subtitle = options.subtitle?.trim()
  if (subtitle && subtitle.length <= 100) return subtitle

  return undefined
}

export function driveCardLocationProps(venue?: string | null, mode?: string | null) {
  const { display, full } = resolveDriveCardLocation(venue ?? undefined, mode ?? undefined)
  if (!display) return {}
  return {
    locationLabel: display,
    locationTooltip: full,
  }
}
