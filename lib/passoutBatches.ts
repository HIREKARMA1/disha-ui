/** Sentinel value meaning no passout-batch restriction. */
export const ALL_PASSOUT_BATCHES_VALUE = 'All'

/** Passout / graduation year options for job targeting multi-select. */
export function getPassoutBatchOptions(spanYears = 10): { value: string; label: string }[] {
  const currentYear = new Date().getFullYear()
  const years: { value: string; label: string }[] = []
  for (let y = currentYear - spanYears; y <= currentYear + spanYears; y++) {
    years.push({ value: String(y), label: String(y) })
  }
  return [
    { value: ALL_PASSOUT_BATCHES_VALUE, label: 'All Batches' },
    ...years.reverse(),
  ]
}

/** Normalize display label for a stored passout batch token. */
export function formatPassoutBatchLabel(batch: string): string {
  const trimmed = batch.trim()
  if (trimmed.toLowerCase() === 'all' || trimmed.toLowerCase() === 'any') {
    return 'All Batches'
  }
  return trimmed
}

/**
 * When "All Batches" is toggled on, clear specific years.
 * When a specific year is chosen after All, drop All.
 */
export function normalizePassoutBatchSelection(batches: string[]): string[] {
  if (!batches.length) return []
  if (batches.includes(ALL_PASSOUT_BATCHES_VALUE)) {
    // Last interaction included All — keep only All if it was newly added or alone
    const withoutAll = batches.filter((b) => b !== ALL_PASSOUT_BATCHES_VALUE)
    // If All is present with other years, prefer the most recent intent:
    // MultiSearchableSelect appends newly selected values at the end.
    if (batches[batches.length - 1] === ALL_PASSOUT_BATCHES_VALUE) {
      return [ALL_PASSOUT_BATCHES_VALUE]
    }
    // A year was selected after All was already selected
    return withoutAll
  }
  return batches
}

/** True when job targeting allows every passout batch. */
export function isAllPassoutBatches(batches: string[] | string | null | undefined): boolean {
  if (batches == null) return true
  const list = Array.isArray(batches)
    ? batches.map((b) => String(b).trim()).filter(Boolean)
    : String(batches)
        .split(',')
        .map((b) => b.trim())
        .filter(Boolean)
  if (!list.length) return true
  return list.some((b) => {
    const lower = b.toLowerCase()
    return lower === 'all' || lower === 'any'
  })
}
