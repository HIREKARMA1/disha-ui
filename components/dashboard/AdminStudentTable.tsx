"use client"

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  KeyRound,
  Mail,
  User,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react'
import { AdminStudentListItem } from '@/types/adminStudent'

interface AdminStudentTableProps {
  students: AdminStudentListItem[]
  isLoading: boolean
  error: string | null
  selectedIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
  selectAllFiltered: boolean
  onView: (student: AdminStudentListItem) => void
  onEdit: (student: AdminStudentListItem) => void
  onDelete: (studentId: string) => Promise<void> | void
  onResetPassword: (studentId: string) => Promise<void> | void
  onSendWelcomeEmail: (studentId: string) => Promise<void> | void
  onRetry: () => void
}

type SortField = 'name' | 'email' | 'phone' | 'status' | 'email_verified' | 'created_at' | 'last_login'
type SortDirection = 'asc' | 'desc' | null

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function formatLastLoginLabel(dateString?: string | null): string {
  if (!dateString) return 'Never Logged In'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Never Logged In'

  const now = new Date()
  const today = startOfLocalDay(now)
  const target = startOfLocalDay(date)
  const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24))

  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (diffDays === 0) return `Today ${time}`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatLastLoginTooltip(dateString?: string | null): string {
  if (!dateString) return 'Never logged in'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Never logged in'
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function AdminStudentTable({
  students,
  isLoading,
  error,
  selectedIds,
  onSelectionChange,
  selectAllFiltered,
  onView,
  onEdit,
  onDelete,
  onResetPassword,
  onSendWelcomeEmail,
  onRetry,
}: AdminStudentTableProps) {
  const [sortField, setSortField] = useState<SortField | null>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminStudentListItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  useEffect(() => {
    setCurrentPage(1)
  }, [students.length])

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc')
      else if (sortDirection === 'desc') {
        setSortField(null)
        setSortDirection(null)
      } else setSortDirection('asc')
    } else {
      setSortField(field)
      // Newest login first by default for last_login
      setSortDirection(field === 'last_login' ? 'desc' : 'asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />
    if (sortDirection === 'asc') return <ChevronUp className="w-3.5 h-3.5" />
    if (sortDirection === 'desc') return <ChevronDown className="w-3.5 h-3.5" />
    return <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />
  }

  const sortedStudents = useMemo(() => {
    if (!sortField || !sortDirection) return students
    return [...students].sort((a, b) => {
      if (sortField === 'last_login') {
        const aTime = a.last_login ? new Date(a.last_login).getTime() : -1
        const bTime = b.last_login ? new Date(b.last_login).getTime() : -1
        // Never logged in sorts last for newest, first for oldest
        if (aTime < 0 && bTime < 0) return 0
        if (aTime < 0) return sortDirection === 'desc' ? 1 : -1
        if (bTime < 0) return sortDirection === 'desc' ? -1 : 1
        return sortDirection === 'asc' ? aTime - bTime : bTime - aTime
      }

      let aVal: any = a[sortField]
      let bVal: any = b[sortField]
      if (sortField === 'email_verified') {
        aVal = a.email_verified ? 1 : 0
        bVal = b.email_verified ? 1 : 0
      }
      if (aVal == null) aVal = ''
      if (bVal == null) bVal = ''
      if (typeof aVal === 'string') aVal = aVal.toLowerCase()
      if (typeof bVal === 'string') bVal = bVal.toLowerCase()
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [students, sortField, sortDirection])

  const totalPages = Math.max(1, Math.ceil(sortedStudents.length / itemsPerPage))
  const page = Math.min(currentPage, totalPages)
  const pageStudents = sortedStudents.slice((page - 1) * itemsPerPage, page * itemsPerPage)
  const pageIds = pageStudents.map((s) => s.id)
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id))
  const somePageSelected = pageIds.some((id) => selectedIds.has(id)) && !allPageSelected

  const toggleSelectAllPage = () => {
    const next = new Set(selectedIds)
    if (allPageSelected) {
      pageIds.forEach((id) => next.delete(id))
    } else {
      pageIds.forEach((id) => next.add(id))
    }
    onSelectionChange(next)
  }

  const toggleRow = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectionChange(next)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await onDelete(deleteTarget.id)
      setDeleteTarget(null)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-[18px] border border-gray-200/70 dark:border-white/[0.08] bg-white/90 dark:bg-[#0D1628] backdrop-blur-md shadow-sm p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700/50 rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[18px] border border-gray-200/70 dark:border-white/[0.08] bg-white/90 dark:bg-[#0D1628] backdrop-blur-md shadow-sm p-8 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button onClick={onRetry} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Retry
        </button>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="rounded-[18px] border border-gray-200/70 dark:border-white/[0.08] bg-white/90 dark:bg-[#0D1628] backdrop-blur-md shadow-sm p-12 text-center">
        <User className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No students found</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Try adjusting filters or add a new student to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-[18px] border border-gray-200/70 dark:border-white/[0.08] bg-white/90 dark:bg-[#0D1628] backdrop-blur-md shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        <input
          type="checkbox"
          checked={allPageSelected || selectAllFiltered}
          ref={(el) => {
            if (el) el.indeterminate = somePageSelected && !selectAllFiltered
          }}
          onChange={toggleSelectAllPage}
          className="rounded border-gray-300"
          aria-label="Select all on page"
        />
        <span>
          Select All ({pageStudents.length})
          {selectedIds.size > 0 && (
            <span className="ml-2 text-blue-700 dark:text-blue-300 font-medium">
              Selected: {selectAllFiltered ? students.length : selectedIds.size} Students
            </span>
          )}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/40">
            <tr>
              <th className="px-4 py-3 w-10" />
              {(
                [
                  { key: 'name' as SortField, label: 'Student Name' },
                  { key: 'email' as SortField, label: 'Email' },
                  { key: 'phone' as SortField, label: 'Phone Number' },
                  { key: 'status' as SortField, label: 'Account Status' },
                  { key: 'email_verified' as SortField, label: 'Verification' },
                  { key: 'last_login' as SortField, label: 'Last Login' },
                  { key: 'created_at' as SortField, label: 'Registered Date' },
                ] as const
              ).map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none"
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    <SortIcon field={col.key} />
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {pageStudents.map((student, index) => (
              <motion.tr
                key={student.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700/40 ${
                  selectedIds.has(student.id) || selectAllFiltered ? 'bg-blue-50/60 dark:bg-blue-900/20' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectAllFiltered || selectedIds.has(student.id)}
                    onChange={() => toggleRow(student.id)}
                    className="rounded border-gray-300"
                    aria-label={`Select ${student.name}`}
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center overflow-hidden">
                      {student.profile_picture ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={student.profile_picture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{student.name}</div>
                      {student.institution && (
                        <div className="text-xs text-gray-500 truncate max-w-[180px]">{student.institution}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{student.email}</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{student.phone || '—'}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                      student.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                    }`}
                  >
                    <span className="text-[10px]">{student.status === 'active' ? '🟢' : '🔴'}</span>
                    {student.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      student.email_verified
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200'
                    }`}
                  >
                    {student.email_verified ? 'Verified' : 'Unverified'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap" title={formatLastLoginTooltip(student.last_login)}>
                  {student.last_login ? (
                    <span className="text-gray-700 dark:text-gray-300">{formatLastLoginLabel(student.last_login)}</span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      Never Logged In
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {formatDate(student.created_at)}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap relative">
                  <button
                    type="button"
                    onClick={() => setOpenMenuId(openMenuId === student.id ? null : student.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                  {openMenuId === student.id && (
                    <div className="absolute right-4 z-20 mt-1 w-52 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1 text-left">
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                        onClick={() => {
                          setOpenMenuId(null)
                          onView(student)
                        }}
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                        onClick={() => {
                          setOpenMenuId(null)
                          onEdit(student)
                        }}
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </button>
                      <button
                        type="button"
                        disabled={actionLoadingId === student.id}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                        onClick={async () => {
                          setOpenMenuId(null)
                          setActionLoadingId(student.id)
                          try {
                            await onResetPassword(student.id)
                          } finally {
                            setActionLoadingId(null)
                          }
                        }}
                      >
                        <KeyRound className="w-4 h-4" /> Reset Password
                      </button>
                      <button
                        type="button"
                        disabled={actionLoadingId === student.id}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                        onClick={async () => {
                          setOpenMenuId(null)
                          setActionLoadingId(student.id)
                          try {
                            await onSendWelcomeEmail(student.id)
                          } finally {
                            setActionLoadingId(null)
                          }
                        }}
                      >
                        <Mail className="w-4 h-4" /> Send Welcome Email
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                        onClick={() => {
                          setOpenMenuId(null)
                          setDeleteTarget(student)
                        }}
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500">
          Showing {(page - 1) * itemsPerPage + 1}–{Math.min(page * itemsPerPage, sortedStudents.length)} of{' '}
          {sortedStudents.length}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-2 py-1.5 text-sm text-gray-600 dark:text-gray-300">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Student</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to permanently delete <strong>{deleteTarget.name}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
