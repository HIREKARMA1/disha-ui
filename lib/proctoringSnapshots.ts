/**
 * Proctoring snapshot helpers for DISHA admin analytics (data from Solviq).
 */

const SOLVIQ_MEDIA_BASE =
  (process.env.NEXT_PUBLIC_SOLVIQ_API_URL || process.env.NEXT_PUBLIC_SOLVIQ_BACKEND_URL || '')
    .replace(/\/+$/, '') || 'http://localhost:8002'

export type ProctoringSnapshot = {
  index: number
  url?: string
  captured_at?: string
  round_number?: number
}

export function resolveSnapshotUrl(url: string | undefined | null): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const base = SOLVIQ_MEDIA_BASE
  return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`
}

export function buildProctoringSlots(
  snapshots?: ProctoringSnapshot[] | null,
  urlFields?: {
    proctoring_snapshot_1_url?: string
    proctoring_snapshot_2_url?: string
    proctoring_snapshot_3_url?: string
    proctoring_snapshot_4_url?: string
  }
): Array<ProctoringSnapshot & { url: string }> {
  const byIndex = new Map<number, ProctoringSnapshot>()
  for (const snap of snapshots || []) {
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
      url: resolveSnapshotUrl(existing?.url || ''),
      captured_at: existing?.captured_at,
      round_number: existing?.round_number,
    }
  })
}

export function countCapturedSnapshots(attempt: {
  proctoring_snapshot_count?: number
  proctoring_snapshot_1_url?: string
  proctoring_snapshot_2_url?: string
  proctoring_snapshot_3_url?: string
  proctoring_snapshot_4_url?: string
}): number {
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
