/** Slug helpers aligned with backend `app/utils/job_helpers.py`. */

export function slugifyPart(text: string, maxLen = 100): string {
  const raw = (text || '').trim().toLowerCase()
  let slug = raw.replace(/[^\w\s-]/g, '')
  slug = slug.replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
  const trimmed = slug.slice(0, maxLen)
  return trimmed || ''
}

/** Split backend slug `company/role` or `company/role-abc123`. */
export function splitJobSlug(slug: string): { companySlug: string; jobSlug: string } {
  const normalized = (slug || '').replace(/^\/+|\/+$/g, '')
  const slash = normalized.indexOf('/')
  if (slash === -1) {
    return { companySlug: normalized || 'company', jobSlug: 'role' }
  }
  return {
    companySlug: normalized.slice(0, slash),
    jobSlug: normalized.slice(slash + 1),
  }
}

/** Returns `/jobs/{company}/{role}` — prefers backend slug when available. */
export function buildJobPath(
  slug?: string | null,
  companyName?: string,
  title?: string,
  jobId?: string
): string {
  if (slug) {
    const { companySlug, jobSlug } = splitJobSlug(slug)
    return `/jobs/${encodeURIComponent(companySlug)}/${encodeURIComponent(jobSlug)}`
  }

  const companyPart = slugifyPart(companyName || '') || 'company'
  let titlePart = slugifyPart(title || '') || 'role'

  if (jobId) {
    const shortId = jobId.replace(/-/g, '').slice(0, 6)
    if (shortId) {
      titlePart = `${titlePart}-${shortId}`
    }
  }

  return `/jobs/${encodeURIComponent(companyPart)}/${encodeURIComponent(titlePart)}`
}
