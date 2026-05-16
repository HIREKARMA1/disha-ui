/** Helpers for admin assessment analytics (scores, evaluation state). */

export type AssessmentRoundLike = {
  config?: { num_questions?: number } | null
}

export type AssessmentLike = {
  rounds?: AssessmentRoundLike[]
  passing_criteria?: { overall_percentage?: number } | null
}

export type AttemptLike = {
  status?: string
  total_score?: number | null
  percentage?: number | null
  submitted_at?: string | null
  result_data?: { rounds?: unknown[] } | null
  total_questions?: number | null
}

const EVALUATED_STATUSES = new Set(['COMPLETED', 'PASSED', 'FAILED', 'SUBMITTED'])

export function getTotalQuestionsFromAssessment(assessment?: AssessmentLike | null): number {
  if (!assessment?.rounds?.length) return 0
  return assessment.rounds.reduce((sum, round) => {
    const n = round.config?.num_questions
    return sum + (typeof n === 'number' && n > 0 ? n : 0)
  }, 0)
}

/** Max score denominator: prefer evaluated result_data, else configured question count. */
export function getAttemptMaxScore(attempt: AttemptLike, assessment?: AssessmentLike | null): number {
  if (attempt.total_questions && attempt.total_questions > 0) {
    return attempt.total_questions
  }

  const rounds = attempt.result_data?.rounds
  if (Array.isArray(rounds) && rounds.length > 0) {
    const fromResults = rounds.reduce((sum: number, round: unknown) => {
      const r = round as { total_score?: number; questions?: { max_score?: number }[] }
      if (typeof r.total_score === 'number' && r.total_score > 0) return sum + r.total_score
      if (Array.isArray(r.questions)) {
        return (
          sum +
          r.questions.reduce((qSum, q) => qSum + (typeof q.max_score === 'number' ? q.max_score : 1), 0)
        )
      }
      return sum
    }, 0)
    if (fromResults > 0) return fromResults
  }

  if (
    typeof attempt.total_score === 'number' &&
    typeof attempt.percentage === 'number' &&
    attempt.percentage > 0
  ) {
    return Math.round(attempt.total_score / (attempt.percentage / 100))
  }

  const configured = getTotalQuestionsFromAssessment(assessment)
  return configured > 0 ? configured : 0
}

export function isAttemptEvaluated(attempt: AttemptLike): boolean {
  if (attempt.submitted_at) return true
  if (attempt.result_data?.rounds?.length) return true
  const status = (attempt.status || '').toUpperCase()
  return EVALUATED_STATUSES.has(status)
}

export function getPassingPercentage(assessment?: AssessmentLike | null): number {
  return assessment?.passing_criteria?.overall_percentage ?? 60
}

export function getPassFailLabel(
  attempt: AttemptLike,
  assessment?: AssessmentLike | null
): 'PASS' | 'FAIL' | 'PENDING' {
  if (!isAttemptEvaluated(attempt)) return 'PENDING'
  const threshold = getPassingPercentage(assessment)
  const status = (attempt.status || '').toUpperCase()
  if (status === 'PASSED') return 'PASS'
  if (status === 'FAILED') return 'FAIL'
  if (typeof attempt.percentage === 'number') {
    return attempt.percentage >= threshold ? 'PASS' : 'FAIL'
  }
  return 'PENDING'
}

export function formatAttemptScore(attempt: AttemptLike, assessment?: AssessmentLike | null): string {
  const max = getAttemptMaxScore(attempt, assessment)
  if (!isAttemptEvaluated(attempt)) {
    return max > 0 ? `— / ${max}` : '—'
  }
  const score = typeof attempt.total_score === 'number' ? attempt.total_score.toFixed(1) : '—'
  return max > 0 ? `${score} / ${max}` : String(score)
}

export function formatAttemptPercentage(attempt: AttemptLike): string {
  if (!isAttemptEvaluated(attempt) || typeof attempt.percentage !== 'number') {
    return '—'
  }
  return `${attempt.percentage.toFixed(1)}%`
}
