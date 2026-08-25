/**
 * Resolve event/ad media URLs for the public Events portal.
 * Seeded relative paths like `/images/events/banners/...` are not present in
 * `public/`, so they 404 on localhost — map those to stable placeholders.
 */
export function resolveEventMediaUrl(url?: string | null): string | undefined {
  if (!url?.trim()) return undefined
  const trimmed = url.trim()

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
    return trimmed
  }

  const bannerMatch = trimmed.match(/\/images\/events\/banners\/([^/.]+)/i)
  if (bannerMatch) {
    const seed = encodeURIComponent(bannerMatch[1])
    return `https://picsum.photos/seed/${seed}/1200/675`
  }

  const logoMatch = trimmed.match(/\/images\/events\/logos\/([^/.]+)/i)
  if (logoMatch) {
    const name = logoMatch[1].replace(/-/g, ' ')
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&size=128&bold=true`
  }

  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '')
  if (trimmed.startsWith('/') && apiBase) {
    return `${apiBase}${trimmed}`
  }

  return trimmed
}
