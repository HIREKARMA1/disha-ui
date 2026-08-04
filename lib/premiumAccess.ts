/** Shared Premium / MOU apply-rejection copy and support route. */

export const PREMIUM_REQUIRED_MESSAGE =
  "You can't apply for this job as you are not a Premium user."

export const PREMIUM_REQUIRED_ASSISTANCE =
  'Please contact our Support Team for assistance.'

export const CONTACT_SUPPORT_PATH = '/contact'
export const CONTACT_SUPPORT_LABEL = 'Contact Support'

const LEGACY_PREMIUM_SNIPPETS = [
  'applications are enabled only for premium users',
  "your access isn't",
  'not available for your college',
  'university is not enrolled under the premium',
  'university_not_mou',
]

export function isPremiumRequiredError(message: string | null | undefined): boolean {
  if (!message) return false
  const lower = message.toLowerCase()
  if (
    lower.includes('premium') &&
    (lower.includes('apply') || lower.includes('access') || lower.includes('user'))
  ) {
    return true
  }
  return LEGACY_PREMIUM_SNIPPETS.some((s) => lower.includes(s))
}
