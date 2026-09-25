'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  Clock,
  Loader2,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { AdminPageHero } from '@/components/admin/ui/AdminPageHero'
import { AdminPagination } from '@/components/admin/ui/AdminPagination'
import { universityApprovalService } from '@/services/universityApprovalService'
import type {
  UniversityApprovalItem,
  UniversityApprovalStatus,
} from '@/types/universityApproval'
import { cn } from '@/lib/utils'

const STATUS_FILTERS: { value: 'all' | UniversityApprovalStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const PAGE_SIZE = 20

function statusStyles(status: UniversityApprovalStatus) {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
    case 'approved':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return value
  }
}

function formatJobType(value?: string | null) {
  if (!value) return '—'
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function statusLabel(status: UniversityApprovalStatus) {
  if (status === 'approved') return 'Approved'
  if (status === 'rejected') return 'Rejected'
  return 'Pending'
}

function extractErrorMessage(err: unknown, fallback: string) {
  const detail =
    typeof err === 'object' &&
    err !== null &&
    'response' in err &&
    typeof (err as { response?: { data?: { detail?: unknown } } }).response?.data?.detail !==
      'undefined'
      ? (err as { response: { data: { detail: unknown } } }).response.data.detail
      : undefined

  if (typeof detail === 'string') return detail
  if (
    detail &&
    typeof detail === 'object' &&
    detail !== null &&
    'message' in detail &&
    typeof (detail as { message?: unknown }).message === 'string'
  ) {
    return (detail as { message: string }).message
  }
  return fallback
}

export function UniversityApprovalList() {
  const [items, setItems] = useState<UniversityApprovalItem[]>([])
  const [total, setTotal] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [approvedCount, setApprovedCount] = useState(0)
  const [rejectedCount, setRejectedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | UniversityApprovalStatus>('pending')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<{
    item: UniversityApprovalItem
    action: 'approve' | 'reject'
  } | null>(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const result = await universityApprovalService.listAdmin({
        status: statusFilter === 'all' ? 'all' : statusFilter,
        search: search || undefined,
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      })
      setItems(result.items || [])
      setTotal(result.total_count || 0)
      setPendingCount(result.pending_count || 0)
      setApprovedCount(result.approved_count || 0)
      setRejectedCount(result.rejected_count || 0)
    } catch (err: unknown) {
      const status =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { status?: number } }).response?.status === 'number'
          ? (err as { response: { status: number } }).response.status
          : undefined
      if (status === 401 || status === 403) {
        toast.error('Admin login required to view university approvals')
      } else {
        toast.error('Failed to load university approvals')
      }
      setItems([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search, page])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, search])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total])

  const runAction = async (item: UniversityApprovalItem, action: 'approve' | 'reject') => {
    const key = `${item.job_id}:${item.university_id}`
    if (busyKey) return
    setBusyKey(key)
    try {
      if (action === 'approve') {
        await universityApprovalService.approve(item.job_id, item.university_id)
        toast.success('Job approved successfully')
      } else {
        await universityApprovalService.reject(item.job_id, item.university_id)
        toast.success('Job rejected successfully')
      }
      setConfirmTarget(null)
      await fetchItems()
    } catch (err: unknown) {
      toast.error(
        extractErrorMessage(
          err,
          action === 'approve' ? 'Failed to approve job' : 'Failed to reject job'
        )
      )
      // Revalidate if another actor already changed status
      await fetchItems()
    } finally {
      setBusyKey(null)
    }
  }

  const stats = [
    {
      label: 'Total Assignments',
      value: pendingCount + approvedCount + rejectedCount,
      icon: ShieldCheck,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Pending',
      value: pendingCount,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      label: 'Approved',
      value: approvedCount,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Rejected',
      value: rejectedCount,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-900/20',
    },
  ]

  return (
    <div className="space-y-6">
      <AdminPageHero
        title="University Approval"
        subtitle="Approve or reject university-assigned jobs using the same approval status as the University panel."
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

        <form
          className="relative w-full sm:max-w-xs"
          onSubmit={(e) => {
            e.preventDefault()
            setSearch(searchInput.trim())
          }}
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search job, company, university..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-[#151b2b] dark:text-white"
          />
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-[#151b2b]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr>
                {[
                  'Job Title',
                  'Company',
                  'University',
                  'Location',
                  'Job Type',
                  'Posted',
                  'Expiry',
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
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-10 text-center text-gray-500 dark:text-gray-400">
                    No university approvals found.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const key = `${item.job_id}:${item.university_id}`
                  const isBusy = busyKey === key
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 dark:hover:bg-white/5">
                      <td className="max-w-[180px] truncate px-3 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {item.job_title || '—'}
                      </td>
                      <td className="max-w-[140px] truncate px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {item.company_name || '—'}
                      </td>
                      <td className="max-w-[160px] truncate px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {item.university_name || '—'}
                      </td>
                      <td className="max-w-[120px] truncate px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {item.location || '—'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {formatJobType(item.job_type)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {formatDate(item.posted_at)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {formatDate(item.expiry_at)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
                            statusStyles(item.approval_status)
                          )}
                        >
                          {statusLabel(item.approval_status)}
                        </span>
                        {item.approved_at && item.approval_status !== 'pending' && (
                          <p className="mt-1 text-xs text-gray-400">
                            {formatDate(item.approved_at)}
                          </p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {item.approval_status === 'pending' ? (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              onClick={() => setConfirmTarget({ item, action: 'approve' })}
                              disabled={Boolean(busyKey)}
                              className="bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                              {isBusy && confirmTarget?.action === 'approve' ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                'Approve'
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setConfirmTarget({ item, action: 'reject' })}
                              disabled={Boolean(busyKey)}
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
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && totalPages > 1 && (
          <div className="border-t border-gray-200 px-2 py-2 dark:border-gray-700">
            <AdminPagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={PAGE_SIZE}
              onPageChange={setPage}
              itemLabel="assignments"
              className="border-0 shadow-none bg-transparent dark:bg-transparent"
            />
          </div>
        )}
        {!loading && totalPages <= 1 && (
          <div className="border-t border-gray-200 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            Showing {items.length} of {total} assignment{total === 1 ? '' : 's'}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={Boolean(confirmTarget)}
        onClose={() => {
          if (!busyKey) setConfirmTarget(null)
        }}
        onConfirm={async () => {
          if (!confirmTarget) return
          await runAction(confirmTarget.item, confirmTarget.action)
        }}
        title={
          confirmTarget?.action === 'reject'
            ? 'Reject university assignment?'
            : 'Approve university assignment?'
        }
        message={
          confirmTarget?.action === 'reject'
            ? `This will reject "${confirmTarget.item.job_title}" for ${confirmTarget.item.university_name} using the same rejection status as University rejection.`
            : `This will approve "${confirmTarget?.item.job_title}" for ${confirmTarget?.item.university_name} using the same approval status as University approval.`
        }
        confirmText={confirmTarget?.action === 'reject' ? 'Reject' : 'Approve'}
        cancelText="Cancel"
        variant={confirmTarget?.action === 'reject' ? 'danger' : 'info'}
        isLoading={Boolean(
          confirmTarget &&
            busyKey === `${confirmTarget.item.job_id}:${confirmTarget.item.university_id}`
        )}
      />
    </div>
  )
}
