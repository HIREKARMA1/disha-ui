/**
 * Sanitize event description HTML for safe rendering.
 * Plain-text (legacy) descriptions are escaped and newline-preserved.
 * DOMPurify runs in the browser only (Next.js client components).
 */

import DOMPurify from 'dompurify'

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
  'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'a', 'img',
  'blockquote', 'pre', 'code',
  'span', 'div', 'sub', 'sup',
]

const ALLOWED_ATTR = [
  'href', 'target', 'rel', 'src', 'alt', 'title', 'class',
  'style', 'width', 'height',
]

function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Convert legacy plain text into safe HTML paragraphs. */
function plainTextToHtml(value: string): string {
  const escaped = escapeHtml(value)
  return escaped
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, '<br>')}</p>`)
    .join('')
}

/**
 * Lightweight SSR-safe strip when DOMPurify is unavailable (no browser).
 * Removes script/style/iframe and event handlers; not a full sanitizer.
 */
function stripDangerousForSsr(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/javascript:/gi, '')
}

/**
 * Prepare description HTML for display (sanitized).
 * Empty / Quill-empty values fall back to the provided fallback string.
 */
export function sanitizeEventDescriptionHtml(
  raw?: string | null,
  fallback = 'No description available.'
): string {
  const value = (raw || '').trim()
  if (!value || value === '<p><br></p>' || value === '<p></p>') {
    return escapeHtml(fallback)
  }

  const html = looksLikeHtml(value) ? value : plainTextToHtml(value)

  if (typeof window === 'undefined') {
    return stripDangerousForSsr(html)
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'style'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    ADD_ATTR: ['target'],
  })
}

/** Normalize Quill empty document to empty string before save. */
export function normalizeRichTextHtml(html?: string | null): string {
  const value = (html || '').trim()
  if (!value || value === '<p><br></p>' || value === '<p></p>') return ''
  return value
}
