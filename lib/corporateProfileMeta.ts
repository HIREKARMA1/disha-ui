/**
 * Extended corporate profile fields that are not first-class columns
 * are persisted in the existing `bio` field as versioned JSON so they
 * round-trip through GET/PUT /corporates/profile without schema changes.
 */

export const CORP_EXT_MARKER = '__hk_corp_ext_v1' as const

export interface CorporateSocialLinks {
  linkedin?: string
  threads?: string
  facebook?: string
  instagram?: string
  youtube?: string
  website?: string
}

export interface CorporateDocumentMeta {
  id: string
  name: string
  url: string
  type: string
  size?: string
  uploaded_at?: string
}

export interface CorporateExtMeta {
  [CORP_EXT_MARKER]: true
  gst_number?: string
  pan_number?: string
  registration_number?: string
  date_of_incorporation?: string
  social_links?: CorporateSocialLinks
  documents?: CorporateDocumentMeta[]
  plain_bio?: string
}

export function isCorpExtMeta(value: unknown): value is CorporateExtMeta {
  return (
    !!value &&
    typeof value === 'object' &&
    (value as CorporateExtMeta)[CORP_EXT_MARKER] === true
  )
}

export function parseCorpExtMeta(bio?: string | null): CorporateExtMeta {
  if (!bio || typeof bio !== 'string') {
    return { [CORP_EXT_MARKER]: true }
  }
  const trimmed = bio.trim()
  if (!trimmed.startsWith('{')) {
    return { [CORP_EXT_MARKER]: true, plain_bio: bio }
  }
  try {
    const parsed = JSON.parse(trimmed)
    if (isCorpExtMeta(parsed)) return parsed
    return { [CORP_EXT_MARKER]: true, plain_bio: bio }
  } catch {
    return { [CORP_EXT_MARKER]: true, plain_bio: bio }
  }
}

export function serializeCorpExtMeta(meta: CorporateExtMeta): string {
  return JSON.stringify({ ...meta, [CORP_EXT_MARKER]: true })
}

export function mergeCorpExtMeta(
  currentBio: string | null | undefined,
  patch: Partial<Omit<CorporateExtMeta, typeof CORP_EXT_MARKER>>
): string {
  const existing = parseCorpExtMeta(currentBio)
  return serializeCorpExtMeta({
    ...existing,
    ...patch,
    social_links:
      patch.social_links !== undefined ? patch.social_links : existing.social_links,
    documents: patch.documents !== undefined ? patch.documents : existing.documents,
    [CORP_EXT_MARKER]: true,
  })
}

export function isValidHttpUrl(value: string): boolean {
  if (!value.trim()) return true
  try {
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`
    const url = new URL(withProtocol)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function normalizeUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export function formatFileSize(bytes?: number): string {
  if (bytes == null || Number.isNaN(bytes)) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
