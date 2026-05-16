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
