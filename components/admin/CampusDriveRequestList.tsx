'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  CheckCircle2,
  Clock,
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

export function CampusDriveRequestList() {
  const [requests, setRequests] = useState<CampusDriveRequest[]>([])
  const [total, setTotal] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [acceptedCount, setAcceptedCount] = useState(0)
  const [rejectedCount, setRejectedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | CampusDriveRequestStatus>('pending')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<CampusDriveRequest | null>(null)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const result = await campusDriveRequestService.listAdmin({
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: 100,
      })
      setRequests(result.requests)
      setTotal(result.total_count)
      setPendingCount(result.pending_count)
      setAcceptedCount(result.accepted_count)
      setRejectedCount(result.rejected_count)
    } catch (err: unknown) {
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
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleAccept = async (item: CampusDriveRequest) => {
    setBusyId(item.id)
    try {
      const updated = await campusDriveRequestService.accept(item.id)
      toast.success('Request accepted and application submitted')
      if (statusFilter === 'pending') {
        setRequests((prev) => prev.filter((r) => r.id !== item.id))
        setTotal((t) => Math.max(0, t - 1))
        setPendingCount((c) => Math.max(0, c - 1))
        setAcceptedCount((c) => c + 1)
      } else {
        setRequests((prev) => prev.map((r) => (r.id === item.id ? updated : r)))
      }
    } catch (err: unknown) {
      const detail =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { detail?: unknown } } }).response?.data
          ?.detail !== 'undefined'
          ? (err as { response: { data: { detail: unknown } } }).response.data.detail
          : undefined
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
      const updated = await campusDriveRequestService.reject(rejectTarget.id)
      toast.success('Request rejected')
      if (statusFilter === 'pending') {
        setRequests((prev) => prev.filter((r) => r.id !== rejectTarget.id))
        setTotal((t) => Math.max(0, t - 1))
        setPendingCount((c) => Math.max(0, c - 1))
        setRejectedCount((c) => c + 1)
      } else {
        setRequests((prev) => prev.map((r) => (r.id === rejectTarget.id ? updated : r)))
      }
      setRejectTarget(null)
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
            onClick={() => setStatusFilter(filter.value)}
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
                      {item.request_type === 'premium'
                        ? 'Premium Users'
                        : item.campus_drive_label || item.company_name || 'Campus Drive'}
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
        {!loading && (
          <div className="border-t border-gray-200 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            Showing {requests.length} of {total} request{total === 1 ? '' : 's'}
          </div>
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
