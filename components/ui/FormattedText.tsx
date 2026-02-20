"use client"

import { useMemo, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Matches URLs (http, https, and www) for linkification.
 */
const URL_REGEX = /(https?:\/\/[^\s<>\]\)]+|www\.[^\s<>\]\)]+)/gi

function ensureProtocol(url: string): string {
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^www\./i.test(trimmed)) return `https://${trimmed}`
  return `https://${trimmed}`
}

export interface FormattedTextProps {
  /** Raw text that may contain line breaks and URLs */
  children: string
  /** Additional class names for the wrapper */
  className?: string
  /** Link class names */
  linkClassName?: string
  /** When true, first line is rendered as a bold heading and the rest as body (with links + line breaks) */
  firstLineAsHeading?: boolean
  /** When true, each new line is rendered as a bullet point; otherwise text is treated as a single paragraph */
  bulletPointsForNewLines?: boolean
}

/**
 * Renders text with:
 * - Preserved line breaks (whitespace-pre-wrap)
 * - URLs as clickable links
 * - Optional: first line as bold heading
 */
/** Renders a string with URLs as clickable links (no bullets, no first-line heading). */
function renderWithLinks(
  text: string,
  className: string | undefined,
  linkClassName: string
): ReactNode {
  const parts: Array<{ type: 'text' | 'url'; value: string }> = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  const re = new RegExp(URL_REGEX.source, 'gi')
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'url', value: match[0] })
    lastIndex = re.lastIndex
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) })
  }
  if (parts.length === 0) {
    return <span className={cn('break-words', className)}>{text}</span>
  }
  return (
    <span className={cn('break-words', className)}>
      {parts.map((seg, i) =>
        seg.type === 'url' ? (
          <a
            key={i}
            href={ensureProtocol(seg.value)}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClassName}
          >
            {seg.value}
          </a>
        ) : (
          <span key={i}>{seg.value}</span>
        )
      )}
    </span>
  )
}

export function FormattedText({
  children,
  className,
  linkClassName = 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline hover:no-underline transition-colors break-all',
  firstLineAsHeading = false,
  bulletPointsForNewLines = false,
}: FormattedTextProps) {
  const segments = useMemo(() => {
    if (typeof children !== 'string' || !children) return []
    const parts: Array<{ type: 'text' | 'url'; value: string }> = []
    let lastIndex = 0
    let match: RegExpExecArray | null
    const re = new RegExp(URL_REGEX.source, 'gi')
    while ((match = re.exec(children)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', value: children.slice(lastIndex, match.index) })
      }
      parts.push({ type: 'url', value: match[0] })
      lastIndex = re.lastIndex
    }
    if (lastIndex < children.length) {
      parts.push({ type: 'text', value: children.slice(lastIndex) })
    }
    return parts
  }, [children])

  if (typeof children !== 'string' || !children) return null

  const hasNewlines = children.includes('\n')
  const lines = hasNewlines ? children.split('\n').map((l) => l.trim()).filter(Boolean) : []

  if (firstLineAsHeading && hasNewlines && lines.length > 0) {
    const firstLine = lines[0]
    const restLines = lines.slice(1)
    return (
      <div className="space-y-1">
        <div className="font-bold text-gray-900 dark:text-white">
          {firstLine}
        </div>
        {restLines.length > 0 && (
          <div className={cn('text-sm text-gray-600 dark:text-gray-400', className)}>
            {bulletPointsForNewLines ? (
              <ul className="list-disc pl-5 space-y-1">
                {restLines.map((line, i) => (
                  <li key={i}>
                    {renderWithLinks(line, undefined, linkClassName)}
                  </li>
                ))}
              </ul>
            ) : (
              <FormattedText className={className} linkClassName={linkClassName} firstLineAsHeading={false} bulletPointsForNewLines={false}>
                {restLines.join('\n')}
              </FormattedText>
            )}
          </div>
        )}
      </div>
    )
  }

  if (bulletPointsForNewLines && hasNewlines && lines.length > 0) {
    return (
      <ul className={cn('list-disc pl-5 space-y-1 whitespace-normal', className)}>
        {lines.map((line, i) => (
          <li key={i} className="break-words">
            {renderWithLinks(line, undefined, linkClassName)}
          </li>
        ))}
      </ul>
    )
  }

  if (segments.length === 0) {
    return (
      <span className={cn('whitespace-pre-wrap break-words', className)}>
        {children}
      </span>
    )
  }

  return (
    <span className={cn('whitespace-pre-wrap break-words', className)}>
      {segments.map((seg, i) =>
        seg.type === 'url' ? (
          <a
            key={i}
            href={ensureProtocol(seg.value)}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClassName}
          >
            {seg.value}
          </a>
        ) : (
          <span key={i}>{seg.value}</span>
        )
      )}
    </span>
  )
}
