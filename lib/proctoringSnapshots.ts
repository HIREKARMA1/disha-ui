/**
 * Proctoring snapshot helpers for DISHA admin analytics.
 * Supports 4 snapshots per round (N rounds → up to 4N images).
 * Snapshot URLs are absolute S3/CDN links or relative to the Disha API.
 */

const DISHA_MEDIA_BASE =
  (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_DISHA_API_URL || '')
    .replace(/\/+$/, '') || ''

export type ProctoringSnapshot = {
  index: number
  url?: string
  captured_at?: string
  round_number?: number
  global_index?: number
}

export function resolveSnapshotUrl(url: string | undefined | null): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const base = DISHA_MEDIA_BASE
  if (!base) return url
  return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`
}

/**
 * Build display slots from the full snapshot list.
 * When multi-round data exists, returns every captured image (sorted by round then slot).
 * Falls back to flat 1–4 URL fields for legacy attempts.
 */
export function buildProctoringSlots(
  snapshots?: ProctoringSnapshot[] | null,
  urlFields?: {
    proctoring_snapshot_1_url?: string
    proctoring_snapshot_2_url?: string
    proctoring_snapshot_3_url?: string
    proctoring_snapshot_4_url?: string
  }
): Array<ProctoringSnapshot & { url: string; displayIndex: number }> {
  const list = (snapshots || []).filter((s) => s && (s.url || s.index))

  const hasRoundTagged = list.some(
    (s) => typeof s.round_number === 'number' && s.round_number >= 1
  )

  if (hasRoundTagged || list.length > 4) {
    const sorted = [...list].sort((a, b) => {
      const ra = a.round_number || 0
      const rb = b.round_number || 0
      if (ra !== rb) return ra - rb
      return (a.index || 0) - (b.index || 0)
    })
    return sorted.map((snap, i) => ({
      ...snap,
      index: snap.index,
      displayIndex: i + 1,
      url: resolveSnapshotUrl(snap.url || ''),
      captured_at: snap.captured_at,
      round_number: snap.round_number,
    }))
  }

  // Legacy: exactly 4 slots from index or flat URL fields
  const byIndex = new Map<number, ProctoringSnapshot>()
  for (const snap of list) {
    if (snap?.index >= 1 && snap.index <= 4) byIndex.set(snap.index, snap)
  }
  if (urlFields) {
    ;([1, 2, 3, 4] as const).forEach((i) => {
      const key = `proctoring_snapshot_${i}_url` as keyof typeof urlFields
      const url = urlFields[key]
      if (url) {
        const existing = byIndex.get(i)
        byIndex.set(i, { index: i, url, ...existing })
      }
    })
  }
  return ([1, 2, 3, 4] as const).map((index) => {
    const existing = byIndex.get(index)
    return {
      index,
      displayIndex: index,
      url: resolveSnapshotUrl(existing?.url || ''),
      captured_at: existing?.captured_at,
      round_number: existing?.round_number,
    }
  })
}

export function countCapturedSnapshots(attempt: {
  proctoring_snapshot_count?: number
  proctoring_snapshots?: ProctoringSnapshot[] | null
  proctoring_snapshot_1_url?: string
  proctoring_snapshot_2_url?: string
  proctoring_snapshot_3_url?: string
  proctoring_snapshot_4_url?: string
}): number {
  if (Array.isArray(attempt.proctoring_snapshots) && attempt.proctoring_snapshots.length) {
    return attempt.proctoring_snapshots.filter((s) => s?.url).length
  }
  if (typeof attempt.proctoring_snapshot_count === 'number') {
    return attempt.proctoring_snapshot_count
  }
  return [
    attempt.proctoring_snapshot_1_url,
    attempt.proctoring_snapshot_2_url,
    attempt.proctoring_snapshot_3_url,
    attempt.proctoring_snapshot_4_url,
  ].filter(Boolean).length
}
