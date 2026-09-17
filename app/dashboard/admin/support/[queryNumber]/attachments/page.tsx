"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, ExternalLink, FileText, ImageIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { AdminPageHero } from '@/components/admin/ui'
import { supportQueryService } from '@/services/supportQueryService'
import { SupportQuery } from '@/types/supportQuery'
import { getErrorMessage } from '@/lib/error-handler'

function isLikelyImage(url: string) {
  const lower = url.toLowerCase()
  return (
    lower.includes('.png') ||
    lower.includes('.jpg') ||
    lower.includes('.jpeg') ||
    lower.includes('.webp') ||
    lower.includes('.gif') ||
    lower.includes('image')
  )
}

export default function SupportAttachmentsPage() {
  const params = useParams()
  const queryNumber = useMemo(() => {
    const raw = params?.queryNumber
    const value = Array.isArray(raw) ? raw[0] : raw
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }, [params])

  const [query, setQuery] = useState<SupportQuery | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (queryNumber == null) {
      setError('Invalid query number.')
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const row = await supportQueryService.get(queryNumber)
      setQuery(row)
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to load attachments.')
      setError(message)
      setQuery(null)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [queryNumber])

  useEffect(() => {
    load()
  }, [load])

  const screenshotUrl = query?.payment_screenshot_url?.trim() || ''
  const resumeUrl = query?.resume_url?.trim() || ''

  return (
    <AdminDashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/admin/support"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Support
          </Link>
        </div>

        <AdminPageHero
          title={queryNumber != null ? `Attachments · #${queryNumber}` : 'Attachments'}
          subtitle="Payment screenshot and resume submitted for this WhatsApp enrollment"
        />

        {isLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading attachments...</span>
          </div>
        )}

        {!isLoading && error && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-500/30 p-8 text-center">
            <p className="text-red-700 dark:text-red-300 mb-3">{error}</p>
            <button
              type="button"
              onClick={load}
              className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !error && query && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Applicant</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {query.applicant_name || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Phone</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{query.user_phone}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-gray-500 dark:text-gray-400">Problem</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{query.problem}</dd>
                </div>
              </dl>
            </div>

            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-gray-500" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Payment screenshot
                </h2>
              </div>
              {screenshotUrl ? (
                <div className="space-y-3">
                  {isLikelyImage(screenshotUrl) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={screenshotUrl}
                      alt="Payment screenshot"
                      className="max-h-[70vh] w-auto max-w-full rounded-lg border border-gray-200 dark:border-gray-700 object-contain bg-gray-50 dark:bg-gray-900"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Screenshot stored as a file. Open it in a new tab to review.
                    </p>
                  )}
                  <a
                    href={screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    Open original
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No payment screenshot uploaded.</p>
              )}
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Resume</h2>
              </div>
              {resumeUrl ? (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Open / download resume
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No resume uploaded.</p>
              )}
            </section>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  )
}
