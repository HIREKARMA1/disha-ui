import { config } from '@/lib/config'

/**
 * Absolute URL students open to sign in (if needed) and start the exam on Disha.
 */
export function buildStudentExamTakeUrl(assessmentId: string): string {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : (config.app?.url || 'http://localhost:3001').replace(/\/$/, '')
  return `${origin.replace(/\/$/, '')}/assessments/exam/${assessmentId}`
}

/** Pathname (+ search) for in-app navigation from a redirect query value. */
export function normalizeAppRedirectPath(redirect: string): string {
  let value = redirect
  try {
    value = decodeURIComponent(redirect)
  } catch {
    // keep raw
  }
  try {
    if (/^https?:\/\//i.test(value)) {
      const u = new URL(value)
      return `${u.pathname}${u.search}${u.hash}`
    }
  } catch {
    // keep value
  }
  if (!value.startsWith('/')) return `/${value}`
  return value
}

/** True when redirect targets the student exam / mock-test entry or take page. */
export function isStudentExamRedirectPath(redirect: string | null | undefined): boolean {
  if (!redirect) return false
  const path = normalizeAppRedirectPath(redirect)
  return path.startsWith('/assessments/exam/')
}
