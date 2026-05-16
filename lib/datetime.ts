/**
 * Helpers for assessment schedule fields (`datetime-local` ↔ API UTC ISO).
 */

/** Convert `datetime-local` value (local wall clock) to UTC ISO string for the API. */
export function datetimeLocalToUtcIso(localValue: string): string {
  if (!localValue) return localValue
  const d = new Date(localValue)
  if (Number.isNaN(d.getTime())) return localValue
  return d.toISOString()
}

/** Convert API ISO datetime to `datetime-local` input value in the user's timezone. */
export function utcIsoToDatetimeLocal(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Format assessment window for display in the user's local timezone. */
export function formatAssessmentSchedule(startIso: string, endIso: string): string {
  const opts: Intl.DateTimeFormatOptions = {
    dateStyle: 'medium',
    timeStyle: 'short',
  }
  const start = new Date(startIso)
  const end = new Date(endIso)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return ''
  return `${start.toLocaleString(undefined, opts)} – ${end.toLocaleString(undefined, opts)}`
}

/** Milliseconds until an ISO datetime (0 if already passed or invalid). */
export function getMillisecondsUntil(iso: string): number {
  const target = new Date(iso).getTime()
  if (Number.isNaN(target)) return 0
  return Math.max(0, target - Date.now())
}

export interface CountdownParts {
  days: number
  hours: number
  minutes: number
  seconds: number
}

/** Break remaining time into days / hours / minutes / seconds. */
export function parseCountdownParts(ms: number): CountdownParts {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  }
}

const pad2 = (n: number) => String(n).padStart(2, '0')

/** Human-readable countdown: `2d 04:32:15` or `04:32:15`. */
export function formatCountdown(ms: number): string {
  const { days, hours, minutes, seconds } = parseCountdownParts(ms)
  if (days > 0) {
    return `${days}d ${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`
  }
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`
}

/** Friendly phrase for UI copy, e.g. "19 minutes and 42 seconds". */
export function formatCountdownHuman(ms: number): string {
  if (ms <= 0) return 'any moment now'
  const { days, hours, minutes, seconds } = parseCountdownParts(ms)
  const bits: string[] = []
  if (days > 0) bits.push(`${days} day${days === 1 ? '' : 's'}`)
  if (hours > 0) bits.push(`${hours} hour${hours === 1 ? '' : 's'}`)
  if (minutes > 0) bits.push(`${minutes} minute${minutes === 1 ? '' : 's'}`)
  if (seconds > 0 && days === 0 && hours === 0) {
    bits.push(`${seconds} second${seconds === 1 ? '' : 's'}`)
  }
  if (bits.length === 0) return 'less than a minute'
  if (bits.length === 1) return bits[0]
  if (bits.length === 2) return `${bits[0]} and ${bits[1]}`
  return `${bits.slice(0, -1).join(', ')}, and ${bits[bits.length - 1]}`
}

/** Single scheduled instant in the user's locale. */
export function formatScheduledInstant(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

/** Normalize time_window before create/update API calls. */
export function normalizeAssessmentTimeWindow(timeWindow: {
  start_time: string
  end_time: string
}): { start_time: string; end_time: string } {
  return {
    start_time: datetimeLocalToUtcIso(timeWindow.start_time),
    end_time: datetimeLocalToUtcIso(timeWindow.end_time),
  }
}
