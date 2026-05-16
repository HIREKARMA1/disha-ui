import { config } from '@/lib/config'

/**
 * Absolute URL students open to sign in (if needed) and start the exam on Solviq.
 */
export function buildStudentExamTakeUrl(assessmentId: string): string {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : (config.app?.url || 'http://localhost:3000').replace(/\/$/, '')
  return `${origin.replace(/\/$/, '')}/assessments/exam/${assessmentId}`
}
