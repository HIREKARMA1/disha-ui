/** Batch year options aligned with student profile graduation year picker. */
export function getBatchYearOptions(): { value: string; label: string }[] {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 21 }, (_, index) => {
        const year = currentYear + 10 - index
        return { value: String(year), label: String(year) }
    })
}

/** Convert API batch values to multi-select string values. */
export function parseEligibleBatchesForForm(
    batches?: number[] | string[] | null
): string[] {
    if (!batches?.length) return []
    return batches
        .map((batch) => String(batch).trim())
        .filter(Boolean)
        .sort((a, b) => Number(a) - Number(b))
}

/** Convert form selections to API integer array. Empty = no restriction. */
export function serializeEligibleBatchesForApi(
    batches: string[]
): number[] | null {
    if (!batches.length) return null
    const parsed = batches
        .map((batch) => parseInt(batch, 10))
        .filter((year) => !Number.isNaN(year))
    if (!parsed.length) return null
    return Array.from(new Set(parsed)).sort((a, b) => a - b)
}

/** Format eligible batches for display (e.g. job details). */
export function formatEligibleBatchesDisplay(
    batches?: number[] | null
): string | null {
    if (!batches?.length) return null
    return [...batches].sort((a, b) => a - b).join(', ')
}
