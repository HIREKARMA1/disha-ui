export interface TopPerformerHighlight {
  mock_test_id: string
  assessment_name: string
  background_image_url?: string | null
  results_published?: boolean
  top_performer?: {
    rank: number
    student_name: string
    total_score?: number | null
    max_score?: number | null
    percentage?: number | null
  } | null
}

export function formatPerformerScore(
  p: NonNullable<TopPerformerHighlight['top_performer']>
): string | null {
  if (
    typeof p.total_score === 'number' &&
    typeof p.max_score === 'number' &&
    p.max_score > 0
  ) {
    return `${p.total_score}/${p.max_score}`
  }
  if (typeof p.percentage === 'number') return `${p.percentage.toFixed(1)}%`
  if (typeof p.total_score === 'number') return String(p.total_score)
  return null
}

export const publishedHighlights = (highlights: TopPerformerHighlight[]) =>
  highlights.filter((h) => h.results_published && h.top_performer)
