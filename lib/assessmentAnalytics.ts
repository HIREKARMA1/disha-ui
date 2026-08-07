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
  result_data?: {
    rounds?: unknown[]
    disqualification_reason?: string | null
    max_points?: number | null
  } | null
  total_questions?: number | null
  disqualification_reason?: string | null
}

const EVALUATED_STATUSES = new Set([
  'COMPLETED',
  'PASSED',
  'FAILED',
  'SUBMITTED',
  'DISQUALIFIED',
  'AUTO_SUBMITTED',
])

export function getTotalQuestionsFromAssessment(assessment?: AssessmentLike | null): number {
  if (!assessment?.rounds?.length) return 0
  return assessment.rounds.reduce((sum, round) => {
    const n = round.config?.num_questions
    return sum + (typeof n === 'number' && n > 0 ? n : 0)
  }, 0)
}

/** Max score denominator: prefer evaluated result_data, else configured question count. */
export function getAttemptMaxScore(attempt: AttemptLike, assessment?: AssessmentLike | null): number {
  const fromResultMax = attempt.result_data?.max_points
  if (typeof fromResultMax === 'number' && fromResultMax > 0) {
    return fromResultMax
  }

  if (attempt.total_questions && attempt.total_questions > 0) {
    return attempt.total_questions
  }

  const rounds = attempt.result_data?.rounds
  if (Array.isArray(rounds) && rounds.length > 0) {
    const fromResults = rounds.reduce((sum: number, round: unknown) => {
      const r = round as {
        total_score?: number
        max?: number
        questions?: { max_score?: number }[]
      }
      if (typeof r.total_score === 'number' && r.total_score > 0) return sum + r.total_score
      if (typeof r.max === 'number' && r.max > 0) return sum + r.max
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

/** Normalize round payloads from local scoring (earned/max and score/total_score shapes). */
export function normalizeAttemptRounds(attempt: AttemptLike | any): any[] {
  const raw = attempt?.result_data?.rounds
  if (!Array.isArray(raw) || raw.length === 0) return []

  return raw.map((round: any, idx: number) => {
    const score =
      typeof round.score === 'number'
        ? round.score
        : typeof round.earned === 'number'
          ? round.earned
          : null
    const total =
      typeof round.total_score === 'number'
        ? round.total_score
        : typeof round.max === 'number'
          ? round.max
          : Array.isArray(round.questions)
            ? round.questions.reduce(
                (acc: number, q: any) => acc + (typeof q.max_score === 'number' ? q.max_score : 1),
                0
              )
            : null
    let percentage =
      typeof round.percentage === 'number'
        ? round.percentage
        : score != null && total != null && total > 0
          ? Math.round((score / total) * 1000) / 10
          : null

    return {
      ...round,
      round_number: round.round_number ?? idx + 1,
      round_name: round.round_name || round.round_type || `Round ${round.round_number ?? idx + 1}`,
      score,
      total_score: total,
      percentage,
      questions: Array.isArray(round.questions) ? round.questions : [],
    }
  })
}

export function isAttemptEvaluated(attempt: AttemptLike): boolean {
  if (attempt.submitted_at) return true
  if (attempt.result_data?.rounds?.length) return true
  if (typeof attempt.percentage === 'number' || typeof attempt.total_score === 'number') return true
  const status = (attempt.status || '').toUpperCase()
  return EVALUATED_STATUSES.has(status)
}

export function getPassingPercentage(assessment?: AssessmentLike | null): number {
  return assessment?.passing_criteria?.overall_percentage ?? 60
}

export function getDisqualificationReason(attempt: AttemptLike): string | null {
  const reason =
    attempt.disqualification_reason ||
    attempt.result_data?.disqualification_reason ||
    null
  return reason ? String(reason).trim() : null
}

/** Human-readable malpractice reason for admin UI. */
export function formatDisqualificationReason(reason: string | null | undefined): string | null {
  if (!reason) return null
  const key = reason.trim().toUpperCase()
  if (key === 'FULLSCREEN_EXIT') return 'Fullscreen exit'
  if (key === 'TAB_SWITCH') return 'Tab switch'
  return reason.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())
}

export function getPassFailLabel(
  attempt: AttemptLike,
  assessment?: AssessmentLike | null
): 'PASS' | 'FAIL' | 'MALPRACTICE' | 'PENDING' {
  if (!isAttemptEvaluated(attempt)) return 'PENDING'
  const status = (attempt.status || '').toUpperCase()
  const reason = getDisqualificationReason(attempt)
  if (status === 'DISQUALIFIED' || reason) return 'MALPRACTICE'

  const threshold = getPassingPercentage(assessment)
  if (status === 'PASSED') return 'PASS'
  if (status === 'FAILED') return 'FAIL'
  if (typeof attempt.percentage === 'number') {
    return attempt.percentage >= threshold ? 'PASS' : 'FAIL'
  }
  return 'PENDING'
}

/** Display text for pass/fail/disqualified badges and exports. */
export function formatPassFailDisplay(
  label: 'PASS' | 'FAIL' | 'MALPRACTICE' | 'PENDING'
): string {
  if (label === 'MALPRACTICE') return 'Disqualified'
  return label
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
