"use client"

import { AdminStudentBulkAction } from '@/types/adminStudent'
import { CheckCircle, Ban, ShieldCheck, ShieldOff, Trash2, X } from 'lucide-react'

interface AdminStudentBulkActionBarProps {
  selectedCount: number
  totalFilteredCount: number
  selectAllFiltered: boolean
  onSelectAllFiltered: () => void
  onClearSelection: () => void
  onAction: (action: AdminStudentBulkAction) => void
  isProcessing: boolean
}

export function AdminStudentBulkActionBar({
  selectedCount,
  totalFilteredCount,
  selectAllFiltered,
  onSelectAllFiltered,
  onClearSelection,
  onAction,
  isProcessing,
}: AdminStudentBulkActionBarProps) {
  if (selectedCount <= 0) return null

  return (
    <div className="sticky top-2 z-30 rounded-xl border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 shadow-sm px-4 py-3">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="text-sm text-blue-900 dark:text-blue-100">
          <span className="font-semibold">{selectedCount}</span> Student{selectedCount === 1 ? '' : 's'} Selected
          {!selectAllFiltered && totalFilteredCount > selectedCount && (
            <button
              type="button"
              onClick={onSelectAllFiltered}
              className="ml-2 underline font-medium hover:text-blue-700 dark:hover:text-blue-200"
            >
              Select all {totalFilteredCount.toLocaleString()} students
            </button>
          )}
          {selectAllFiltered && (
            <span className="ml-2 text-blue-700 dark:text-blue-200">
              All {totalFilteredCount.toLocaleString()} matching students selected
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onAction('activate')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" /> Activate
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onAction('deactivate')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-600 text-white text-sm hover:bg-gray-700 disabled:opacity-50"
          >
            <Ban className="w-4 h-4" /> Deactivate
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onAction('verify')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" /> Verify
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onAction('unverify')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-sm hover:bg-amber-700 disabled:opacity-50"
          >
            <ShieldOff className="w-4 h-4" /> Unverify
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onAction('delete')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={onClearSelection}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-300 dark:border-blue-600 text-blue-800 dark:text-blue-100 text-sm hover:bg-blue-100 dark:hover:bg-blue-800/40 disabled:opacity-50"
          >
            <X className="w-4 h-4" /> Cancel Selection
          </button>
        </div>
      </div>
    </div>
  )
}
