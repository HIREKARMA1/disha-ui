/** Convert an ISO datetime to `YYYY-MM-DDTHH:mm` in the browser's local zone. */
export function toDatetimeLocalValue(iso?: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    const match = iso.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/)
    return match ? match[1] : ''
  }
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Convert a `datetime-local` value to UTC ISO, or undefined if empty/invalid. */
export function fromDatetimeLocalValue(value?: string | null): string | undefined {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString()
}
