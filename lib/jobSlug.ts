/**
 * Build /jobs/{company}/{role} path from API slug or fallback fields.
 */
export function getJobDetailPath(job: {
  slug?: string | null
  id: string
  title?: string
  company_name?: string | null
  corporate_name?: string | null
}): string {
  if (job.slug && job.slug.includes('/')) {
    const [company, ...rest] = job.slug.split('/')
    const role = rest.join('/')
    return `/jobs/${encodeURIComponent(company)}/${encodeURIComponent(role)}`
  }

  const company = slugifyClient(job.company_name || job.corporate_name || 'company')
  const role = slugifyClient(job.title || 'role')
  // Fallback deep-link by id until slug is backfilled
  return `/jobs/${company}/${role}-${job.id.replace(/-/g, '').slice(0, 8)}?id=${encodeURIComponent(job.id)}`
}

export function slugifyClient(value: string): string {
  return (value || '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'job'
}
