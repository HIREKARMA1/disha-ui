"use client"

import { Headphones, Phone } from 'lucide-react'
import { SupportPaymentDecision, SupportQuery, SupportQueryStatus } from '@/types/supportQuery'

const STATUS_STYLES: Record<string, string> = {
  not_resolved: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  connected: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
}

const STATUS_OPTIONS: { value: SupportQueryStatus; label: string }[] = [
  { value: 'not_resolved', label: 'Not resolved' },
  { value: 'connected', label: 'Connected' },
  { value: 'resolved', label: 'Resolved' },
]

const PAYMENT_ACTIONABLE = new Set(['awaiting_verification', 'awaiting_offline'])

function statusLabel(status: string) {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label || status
}

function enquiryLabel(value?: string | null) {
  if (value === 'disha') return 'Disha'
  if (value === 'shortlisted') return 'Shortlisted'
  if (value === 'batch_enroll') return 'Batch enroll'
  return value || '—'
}

function paymentLabel(value?: string | null) {
  if (!value || value === 'none') return '—'
  return value.replaceAll('_', ' ')
}

function snippet(problem: string, max = 80) {
  const compact = (problem || '').replace(/\s+/g, ' ').trim()
  if (compact.length <= max) return compact
  return `${compact.slice(0, max - 1)}…`
}

function formatDate(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface SupportQueryTableProps {
  queries: SupportQuery[]
  isLoading: boolean
  error: string | null
  updatingQueryNumber: number | null
  onRetry: () => void
  onStatusChange: (queryNumber: number, status: SupportQueryStatus) => void
  onPaymentDecision: (queryNumber: number, decision: SupportPaymentDecision) => void
}

export function SupportQueryTable({
  queries,
  isLoading,
  error,
  updatingQueryNumber,
  onRetry,
  onStatusChange,
  onPaymentDecision,
}: SupportQueryTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading queries...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-500/30 p-8 text-center">
        <p className="text-red-700 dark:text-red-300 mb-3">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
        >
          Try again
        </button>
      </div>
    )
  }

  if (queries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center text-gray-500 dark:text-gray-400">
        <Headphones className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-lg font-medium">No queries found</p>
        <p className="text-sm mt-1">Try a different enquiry, status, date range, or search.</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/40">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Query No
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Enquiry
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Problem
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {queries.map((row) => {
              const busy = updatingQueryNumber === row.query_number
              const showPaymentActions =
                row.enquiry_type === 'batch_enroll' &&
                PAYMENT_ACTIONABLE.has(String(row.payment_status || ''))
              return (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.03]">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    #{row.query_number}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {enquiryLabel(row.enquiry_type)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {row.applicant_name || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {row.user_phone}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-md">
                    {snippet(row.problem)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        STATUS_STYLES[row.status] || STATUS_STYLES.not_resolved
                      }`}
                    >
                      {statusLabel(row.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap capitalize">
                    {paymentLabel(row.payment_status)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {formatDate(row.created_at)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col gap-2 min-w-[160px]">
                      <select
                        aria-label={`Update status for query ${row.query_number}`}
                        value={row.status}
                        disabled={busy}
                        onChange={(e) => {
                          const next = e.target.value as SupportQueryStatus
                          if (next !== row.status) {
                            onStatusChange(row.query_number, next)
                          }
                        }}
                        className="h-9 min-w-[140px] px-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white disabled:opacity-60"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {showPaymentActions && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => onPaymentDecision(row.query_number, 'approved')}
                            className="h-8 px-2 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-60"
                          >
                            Approve payment
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => onPaymentDecision(row.query_number, 'rejected')}
                            className="h-8 px-2 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-60"
                          >
                            Reject payment
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
