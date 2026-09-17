'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Copy, Mail, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { CompanyLogo } from '@/components/jobs/CompanyLogo'
import { getJobDetailPath } from '@/lib/jobSlug'
import { cn } from '@/lib/utils'

export interface ShareJobModalJob {
  id: string
  title: string
  slug?: string | null
  company_name?: string | null
  corporate_name?: string | null
  company_logo?: string | null
}

interface ShareJobModalProps {
  isOpen: boolean
  onClose: () => void
  job: ShareJobModalJob | null
}

function getAbsoluteJobUrl(job: ShareJobModalJob): string {
  const path = getJobDetailPath(job)
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`
  }
  return path
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

/**
 * Share Job popup for students — X, WhatsApp, LinkedIn, Email, Copy Link.
 * Portaled to document.body to avoid card hover/re-render flicker.
 */
export function ShareJobModal({ isOpen, onClose, job }: ShareJobModalProps) {
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const onCloseRef = useRef(onClose)
  const titleId = useId()
  /** Ignore backdrop close for a tick after open (prevents click-through blink). */
  const allowBackdropCloseRef = useRef(false)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setCopied(false)
      allowBackdropCloseRef.current = false
      return
    }

    allowBackdropCloseRef.current = false
    const enableTimer = window.setTimeout(() => {
      allowBackdropCloseRef.current = true
    }, 200)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKey)

    return () => {
      window.clearTimeout(enableTimer)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  const handleBackdropClose = useCallback(() => {
    if (!allowBackdropCloseRef.current) return
    onCloseRef.current()
  }, [])

  const companyName =
    (job?.company_name && String(job.company_name)) ||
    (job?.corporate_name && String(job.corporate_name)) ||
    'Company'

  const shareUrl = job ? getAbsoluteJobUrl(job) : ''
  const shareTitle = job?.title || 'Job opportunity'
  const shareText = `Check out this job opportunity: ${shareTitle} at ${companyName}`

  const openExternal = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  const handleTwitter = () => {
    if (!job) return
    const params = new URLSearchParams({
      url: shareUrl,
      text: shareText,
    })
    openExternal(`https://twitter.com/intent/tweet?${params.toString()}`)
  }

  const handleWhatsApp = () => {
    if (!job) return
    openExternal(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`)
  }

  const handleLinkedIn = () => {
    if (!job) return
    openExternal(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    )
  }

  const handleEmail = () => {
    if (!job) return
    const subject = encodeURIComponent(`${shareTitle} — ${companyName}`)
    const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const handleCopy = async () => {
    if (!job) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copied')
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Unable to copy link')
    }
  }

  if (!mounted || !isOpen || !job) return null

  const actions = [
    {
      key: 'x',
      label: 'X',
      onClick: handleTwitter,
      className: 'bg-black text-white hover:bg-gray-800',
      icon: <XIcon className="h-4 w-4" />,
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      onClick: handleWhatsApp,
      className: 'bg-[#25D366] text-white hover:bg-[#1ebe57]',
      icon: <WhatsAppIcon className="h-4 w-4" />,
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      onClick: handleLinkedIn,
      className: 'bg-[#0A66C2] text-white hover:bg-[#0958a8]',
      icon: <LinkedInIcon className="h-4 w-4" />,
    },
    {
      key: 'email',
      label: 'Email',
      onClick: handleEmail,
      className: 'bg-[#EA4335] text-white hover:bg-[#d33426]',
      icon: <Mail className="h-4 w-4" />,
    },
    {
      key: 'copy',
      label: copied ? 'Copied' : 'Copy Link',
      onClick: handleCopy,
      className: cn(
        'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
        'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
        copied && 'border-emerald-400 text-emerald-700 dark:border-emerald-500 dark:text-emerald-300'
      ),
      icon: copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />,
    },
  ] as const

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleBackdropClose()
        }}
      />

      <div
        className={cn(
          'relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl',
          'dark:border-gray-700 dark:bg-gray-800'
        )}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onCloseRef.current()}
          className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4 pr-12 dark:border-white/10">
          <CompanyLogo
            logoUrl={job.company_logo || undefined}
            companyName={companyName}
            size="md"
          />
          <div className="min-w-0">
            <h2
              id={titleId}
              className="truncate text-base font-bold text-gray-900 dark:text-white"
            >
              {shareTitle}
            </h2>
            <p className="truncate text-sm text-gray-500 dark:text-gray-400">{companyName}</p>
          </div>
        </div>

        <div className="px-5 py-5">
          <p className="mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">Share With</p>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-start sm:gap-4">
            {actions.map((action) => (
              <button
                key={action.key}
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  action.onClick()
                }}
                className="flex min-w-[3.25rem] flex-col items-center gap-1.5"
                aria-label={action.label}
              >
                <span
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-95',
                    action.className
                  )}
                >
                  {action.icon}
                </span>
                <span className="max-w-[4.5rem] truncate text-[10px] font-medium text-gray-600 dark:text-gray-300">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
          {copied && (
            <p className="mt-3 text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Link copied
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
