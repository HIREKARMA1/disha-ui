const CARD_LOCATION_MAX = 48

function stripPinCode(segment: string) {
  return segment.replace(/\s*\d{5,6}\s*$/, '').trim()
}

function isPinOnly(segment: string) {
  return /^\d{5,6}$/.test(segment.trim())
}

function truncateCardLocation(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  const lastComma = cut.lastIndexOf(',')
  if (lastComma > max * 0.45) {
    return `${cut.slice(0, lastComma).trim()}…`
  }
  return `${cut.trimEnd()}…`
}

export type CardLocationFormat = {
  display: string
  full: string
}

export function formatCardLocation(raw?: string): CardLocationFormat {
  const full = raw?.trim() ?? ''
  if (!full) return { display: '', full: '' }

  const parts = full
    .split(',')
    .map((part) => stripPinCode(part.trim()))
    .filter((part) => part.length > 0 && !isPinOnly(part))

  if (parts.length === 0) {
    return { display: truncateCardLocation(full, CARD_LOCATION_MAX), full }
  }

  if (parts.length === 1) {
    return {
      display: truncateCardLocation(parts[0], CARD_LOCATION_MAX),
      full,
    }
  }

  if (parts.length === 2) {
    const joined = `${parts[0]}, ${parts[1]}`
    return { display: truncateCardLocation(joined, CARD_LOCATION_MAX), full }
  }

  const city = parts[1] ?? parts[0]
  const last = parts[parts.length - 1]
  const secondLast = parts[parts.length - 2]

  let compact: string
  if (parts.length >= 4 && secondLast && secondLast !== city) {
    compact = `${city}, ${secondLast}`
  } else if (last !== city) {
    compact = `${city}, ${last}`
  } else {
    compact = `${parts[0]}, ${parts[1]}`
  }

  return {
    display: truncateCardLocation(compact, CARD_LOCATION_MAX),
    full,
  }
}
