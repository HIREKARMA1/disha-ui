'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Loader2,
  XCircle,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { AdminPageHero } from '@/components/admin/ui/AdminPageHero'
import { campusDriveRequestService } from '@/services/campusDriveRequestService'
import type {
  CampusDriveRequest,
  CampusDriveRequestStatus,
} from '@/types/campusDriveRequest'
import { cn } from '@/lib/utils'

const STATUS_FILTERS: { value: 'all' | CampusDriveRequestStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
]

function statusStyles(status: CampusDriveRequestStatus) {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
    case 'accepted':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

function statusLabel(status: CampusDriveRequestStatus) {
  if (status === 'accepted') return 'Accepted'
  if (status === 'rejected') return 'Rejected'
  return 'Pending'
}

function requestTypeLabel(item: CampusDriveRequest) {
  if (item.request_type === 'premium') return 'Premium Users'
  return item.campus_drive_label || item.company_name || 'Campus Drive'
}

const PAGE_SIZE = 10
const EXPORT_PAGE_SIZE = 200

type PageItem = number | 'ellipsis'

function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }
  if (currentPage <= 3) return [1, 2, 3, 4, 'ellipsis', totalPages]
  if (currentPage >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }
  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages]
}

function csvCell(value: unknown): string {
  let text = value == null ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`
  }
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function exportFilename() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `job-requests-${now.getFullYear()}-${month}-${day}.csv`
}

function downloadJobRequestsCsv(rows: CampusDriveRequest[]) {
  const headers = [
    'Student Name',
    'Student Email',
    'Student Phone',
    'College/University',
    'Job Title',
    'Job ID',
    'Request ID',
    'Request Date',
    'Status',
    'Request Type',
    'Company',
    'Reviewed At',
  ]
  const lines = rows.map((item) =>
    [
      item.student_name || '',
      item.student_email || '',
      item.student_phone || '',
      item.university_name || '',
      item.job_title || '',
      item.job_id || '',
      item.id || '',
      formatDate(item.requested_at),
      statusLabel(item.status),
      requestTypeLabel(item),
      item.company_name || '',
      item.reviewed_at ? formatDate(item.reviewed_at) : '',
    ]
      .map(csvCell)
      .join(',')
  )
  const csv = `\uFEFF${[headers.map(csvCell).join(','), ...lines].join('\n')}`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = exportFilename()
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function CampusDriveRequestList() {
  const [requests, setRequests] = useState<CampusDriveRequest[]>([])
  const [total, setTotal] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [acceptedCount, setAcceptedCount] = useState(0)
  const [rejectedCount, setRejectedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | CampusDriveRequestStatus>('pending')
  const [page, setPage] = useState(1)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<CampusDriveRequest | null>(null)
  const [exporting, setExporting] = useState(false)
  const loadSeq = useRef(0)

  const fetchRequests = useCallback(async (pageToLoad: number, filter: 'all' | CampusDriveRequestStatus) => {
    const seq = ++loadSeq.current
    setLoading(true)
    try {
      const result = await campusDriveRequestService.listAdmin({
        status: filter === 'all' ? undefined : filter,
        skip: (pageToLoad - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      })
      if (seq !== loadSeq.current) return
      const maxPage = Math.max(1, Math.ceil(result.total_count / PAGE_SIZE))
      if (result.total_count > 0 && pageToLoad > maxPage) {
        setPage(maxPage)
        return
      }
      setRequests(result.requests)
      setTotal(result.total_count)
      setPendingCount(result.pending_count)
      setAcceptedCount(result.accepted_count)
      setRejectedCount(result.rejected_count)
    } catch (err: unknown) {
      if (seq !== loadSeq.current) return
      const status =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { status?: number } }).response?.status === 'number'
          ? (err as { response: { status: number } }).response.status
          : undefined
      if (status === 401 || status === 403) {
        toast.error('Admin login required to view job requests')
      } else {
        toast.error('Failed to load job requests')
      }
      setRequests([])
      setTotal(0)
    } finally {
      if (seq === loadSeq.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchRequests(page, statusFilter)
  }, [fetchRequests, page, statusFilter])

  const handleExport = async () => {
    setExporting(true)
    try {
      const rows: CampusDriveRequest[] = []
      let skip = 0
      let totalCount = 0
      do {
        const result = await campusDriveRequestService.listAdmin({
          status: statusFilter === 'all' ? undefined : statusFilter,
          skip,
          limit: EXPORT_PAGE_SIZE,
        })
        totalCount = result.total_count
        rows.push(...result.requests)
        if (result.requests.length < EXPORT_PAGE_SIZE) break
        skip += result.requests.length
      } while (rows.length < totalCount)

      if (rows.length === 0) {
        toast.error('No job requests match the current filters')
        return
      }
      downloadJobRequestsCsv(rows)
      toast.success(`Exported ${rows.length} job request${rows.length === 1 ? '' : 's'}`)
    } catch {
      toast.error('Failed to export job requests')
    } finally {
      setExporting(false)
    }
  }

  const handleAccept = async (item: CampusDriveRequest) => {
    setBusyId(item.id)
    try {
      await campusDriveRequestService.accept(item.id)
      toast.success('Request accepted and application submitted')
      await fetchRequests(page, statusFilter)
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { detail?: unknown; error?: unknown } } })
        .response?.data
      const detail = data?.detail ?? data?.error
      const message =
        typeof detail === 'string'
          ? detail
          : detail &&
              typeof detail === 'object' &&
              detail !== null &&
              'message' in detail &&
              typeof (detail as { message?: unknown }).message === 'string'
            ? (detail as { message: string }).message
            : 'Failed to accept request'
      toast.error(message)
    } finally {
      setBusyId(null)
    }
  }

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return
    setBusyId(rejectTarget.id)
    try {
      await campusDriveRequestService.reject(rejectTarget.id)
      toast.success('Request rejected')
      setRejectTarget(null)
      await fetchRequests(page, statusFilter)
    } catch {
      toast.error('Failed to reject request')
    } finally {
      setBusyId(null)
    }
  }

  const stats = [
    { label: 'Total Requests', value: pendingCount + acceptedCount + rejectedCount, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Pending', value: pendingCount, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Accepted', value: acceptedCount, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Rejected', value: rejectedCount, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  ]

  return (
    <div className="space-y-6">
      <AdminPageHero
        title="Job Requests"
        subtitle="Review student interest requests for campus drives and Premium Users jobs."
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleExport()}
            disabled={exporting}
            className="border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900"
          >
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {exporting ? 'Exporting…' : 'Export'}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              'rounded-xl border border-gray-200 p-4 dark:border-gray-700',
              stat.bg
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <stat.icon className={cn('h-6 w-6', stat.color)} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => {
              setStatusFilter(filter.value)
              setPage(1)
            }}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              statusFilter === filter.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-[#151b2b]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr>
                {[
                  'Student',
                  'Email',
                  'Phone',
                  'University',
                  'Job',
                  'Request Type',
                  'Requested Time',
                  'Status',
                  'Actions',
                ].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-3 py-10 text-center text-gray-500">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-10 text-center text-gray-500 dark:text-gray-400">
                    No job requests found.
                  </td>
                </tr>
              ) : (
                requests.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 dark:hover:bg-white/5">
                    <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {item.student_name || '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {item.student_email || '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {item.student_phone || '—'}
                    </td>
                    <td className="max-w-[140px] truncate px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {item.university_name || '—'}
                    </td>
                    <td className="max-w-[160px] truncate px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {item.job_title || '—'}
                    </td>
                    <td className="max-w-[160px] truncate px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {requestTypeLabel(item)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {formatDate(item.requested_at)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
                          statusStyles(item.status)
                        )}
                      >
                        {statusLabel(item.status)}
                      </span>
                      {item.reviewed_at && item.status !== 'pending' && (
                        <p className="mt-1 text-xs text-gray-400">
                          Reviewed {formatDate(item.reviewed_at)}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {item.status === 'pending' ? (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAccept(item)}
                            disabled={busyId === item.id}
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            {busyId === item.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              'Accept'
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRejectTarget(item)}
                            disabled={busyId === item.id}
                            className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {total > 0 && (
          <JobRequestPagination
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            disabled={loading}
            onPageChange={setPage}
          />
        )}
      </div>

      <ConfirmationModal
        isOpen={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
        title="Reject request?"
        message={
          rejectTarget?.request_type === 'premium'
            ? 'The student will remain ineligible for this Premium Users job and cannot submit another request for the same job.'
            : 'The student will remain ineligible for this campus drive and cannot submit another request for the same job.'
        }
        confirmText="Reject"
        cancelText="Cancel"
        variant="danger"
        isLoading={busyId === rejectTarget?.id}
      />
    </div>
  )
}

function JobRequestPagination({
  page,
  pageSize,
  total,
  disabled,
  onPageChange,
}: {
  page: number
  pageSize: number
  total: number
  disabled: boolean
  onPageChange: (page: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  const items = getPageItems(page, totalPages)
  const buttonClass =
    'inline-flex h-9 items-center rounded-md border border-gray-300 bg-white px-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-[#151b2b] dark:text-gray-300 dark:hover:bg-white/5 sm:px-3 sm:text-sm'

  return (
    <div className="border-t border-gray-200 px-3 py-4 dark:border-gray-700 sm:px-4">
      <div className="flex min-w-0 flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-center text-xs text-gray-600 dark:text-gray-300 sm:text-sm sm:text-left">
          Showing <span className="font-medium text-gray-900 dark:text-white">{start}</span> to{' '}
          <span className="font-medium text-gray-900 dark:text-white">{end}</span> of{' '}
          <span className="font-medium text-gray-900 dark:text-white">{total}</span> results
        </p>
        <nav aria-label="Job request pages" className="flex max-w-full flex-wrap items-center justify-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={disabled || page <= 1}
            className={buttonClass}
          >
            <span className="sm:hidden" aria-hidden="true">‹</span>
            <span className="hidden sm:inline">Previous</span>
          </button>
          {items.map((item, index) =>
            item === 'ellipsis' ? (
              <span
                key={`ellipsis-${index}`}
                aria-hidden="true"
                className="inline-flex h-9 min-w-5 items-center justify-center text-sm text-gray-500 dark:text-gray-400"
              >
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Page ${item}`}
                onClick={() => onPageChange(item)}
                disabled={disabled}
                className={
                  item === page
                    ? 'inline-flex h-9 min-w-8 items-center justify-center rounded-md border border-primary-500 bg-primary-50 px-2 text-sm font-medium text-primary-700 dark:border-primary-500 dark:bg-primary-900/20 dark:text-primary-300 sm:min-w-9'
                    : `${buttonClass} min-w-8 justify-center px-2 sm:min-w-9`
                }
              >
                {item}
              </button>
            )
          )}
          <button
            type="button"
            aria-label="Next page"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={disabled || page >= totalPages}
            className={buttonClass}
          >
            <span className="sm:hidden" aria-hidden="true">›</span>
            <span className="hidden sm:inline">Next</span>
          </button>
        </nav>
      </div>
    </div>
  )
}
