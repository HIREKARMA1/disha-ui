"use client"

import { useEffect, useMemo, useState } from 'react'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { AdminStudentManagementHeader } from '@/components/dashboard/AdminStudentManagementHeader'
import { AdminStudentTable, formatLastLoginLabel } from '@/components/dashboard/AdminStudentTable'
import { AdminStudentBulkActionBar } from '@/components/dashboard/AdminStudentBulkActionBar'
import { CreateAdminStudentModal } from '@/components/dashboard/CreateAdminStudentModal'
import { EditAdminStudentModal } from '@/components/dashboard/EditAdminStudentModal'
import { AdminStudentBulkUploadModal } from '@/components/dashboard/AdminStudentBulkUploadModal'
import { adminStudentManagementService } from '@/services/adminStudentManagementService'
import {
  AdminStudentListItem,
  AdminStudentBulkAction,
  CreateAdminStudentRequest,
  UpdateAdminStudentRequest,
} from '@/types/adminStudent'
import { toast } from 'react-hot-toast'
import { getErrorMessage } from '@/lib/error-handler'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Download, Upload, X } from 'lucide-react'

function matchesRegistrationFilter(createdAt: string | null | undefined, filter: string): boolean {
  if (filter === 'all') return true
  if (!createdAt) return false
  const created = new Date(createdAt)
  if (Number.isNaN(created.getTime())) return false
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (filter === 'today') return created >= startOfToday
  if (filter === 'last_7_days') {
    const d = new Date(now)
    d.setDate(d.getDate() - 7)
    return created >= d
  }
  if (filter === 'last_30_days') {
    const d = new Date(now)
    d.setDate(d.getDate() - 30)
    return created >= d
  }
  return true
}

function matchesLastLoginFilter(
  lastLogin: string | null | undefined,
  status: string,
  filter: string
): boolean {
  if (filter === 'all') return true
  const now = new Date()
  if (filter === 'never') return !lastLogin
  if (filter === 'inactive30') {
    if (status !== 'inactive') return false
    if (!lastLogin) return true
    const last = new Date(lastLogin)
    if (Number.isNaN(last.getTime())) return true
    const cutoff = new Date(now)
    cutoff.setDate(cutoff.getDate() - 30)
    return last < cutoff
  }
  if (!lastLogin) return false
  const last = new Date(lastLogin)
  if (Number.isNaN(last.getTime())) return false
  if (filter === 'today') {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return last >= startOfToday
  }
  if (filter === '7days') {
    const d = new Date(now)
    d.setDate(d.getDate() - 7)
    return last >= d
  }
  if (filter === '30days') {
    const d = new Date(now)
    d.setDate(d.getDate() - 30)
    return last >= d
  }
  return true
}

const BULK_CONFIRM: Record<
  AdminStudentBulkAction,
  { title: string; message: (n: number) => string; danger?: boolean }
> = {
  activate: {
    title: 'Activate Students',
    message: (n) => `Activate ${n} student${n === 1 ? '' : 's'}?`,
  },
  deactivate: {
    title: 'Deactivate Students',
    message: (n) => `Deactivate ${n} student${n === 1 ? '' : 's'}?`,
  },
  verify: {
    title: 'Verify Students',
    message: (n) => `Verify ${n} student${n === 1 ? '' : 's'}?`,
  },
  unverify: {
    title: 'Unverify Students',
    message: (n) => `Unverify ${n} student${n === 1 ? '' : 's'}?`,
  },
  delete: {
    title: 'Delete Students',
    message: (n) =>
      `Permanently delete ${n} student${n === 1 ? '' : 's'}? This action cannot be undone.`,
    danger: true,
  },
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<AdminStudentListItem[]>([])
  const [stats, setStats] = useState({
    total_students: 0,
    active_students: 0,
    inactive_students: 0,
    verified_students: 0,
    registered_today: 0,
    logged_in_today: 0,
    never_logged_in: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<AdminStudentListItem | null>(null)
  const [viewStudent, setViewStudent] = useState<AdminStudentListItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [registrationFilter, setRegistrationFilter] = useState('all')
  const [lastLoginFilter, setLastLoginFilter] = useState('all')
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectAllFiltered, setSelectAllFiltered] = useState(false)
  const [bulkConfirmAction, setBulkConfirmAction] = useState<AdminStudentBulkAction | null>(null)
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)

  const fetchStudents = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await adminStudentManagementService.getStudents(false)
      setStudents(response.students || [])
      setStats({
        total_students: response.total_students || 0,
        active_students: response.active_students || 0,
        inactive_students: response.inactive_students || 0,
        verified_students: response.verified_students || 0,
        registered_today: response.registered_today || 0,
        logged_in_today: response.logged_in_today || 0,
        never_logged_in: response.never_logged_in || 0,
      })
    } catch (err) {
      console.error('Failed to fetch students:', err)
      setError('Failed to load students. Please try again.')
      toast.error('Failed to load students.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return students.filter((student) => {
      const matchesSearch =
        term === '' ||
        student.name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        (student.phone && student.phone.includes(term)) ||
        student.id.toLowerCase().includes(term)

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'verified' && student.email_verified) ||
        (filterStatus === 'unverified' && !student.email_verified) ||
        (filterStatus === 'active' && student.status === 'active') ||
        (filterStatus === 'inactive' && student.status === 'inactive')

      const matchesRegistration = matchesRegistrationFilter(student.created_at, registrationFilter)
      const matchesLastLogin = matchesLastLoginFilter(student.last_login, student.status, lastLoginFilter)

      return matchesSearch && matchesStatus && matchesRegistration && matchesLastLogin
    })
  }, [students, searchTerm, filterStatus, registrationFilter, lastLoginFilter])

  // Clear stale selection when filters change
  useEffect(() => {
    setSelectedIds(new Set())
    setSelectAllFiltered(false)
  }, [searchTerm, filterStatus, registrationFilter, lastLoginFilter])

  const clearSelection = () => {
    setSelectedIds(new Set())
    setSelectAllFiltered(false)
  }

  const handleSelectionChange = (ids: Set<string>) => {
    setSelectAllFiltered(false)
    setSelectedIds(ids)
  }

  const selectedCount = selectAllFiltered ? filteredStudents.length : selectedIds.size
  const idsForBulk = selectAllFiltered
    ? filteredStudents.map((s) => s.id)
    : Array.from(selectedIds)

  const handleCreateStudent = async (data: CreateAdminStudentRequest) => {
    try {
      const result = await adminStudentManagementService.createStudent(data)
      toast.success('Student created successfully!')
      fetchStudents()
      return result
    } catch (err: any) {
      toast.error(getErrorMessage(err))
      throw err
    }
  }

  const handleUpdateStudent = async (studentId: string, data: UpdateAdminStudentRequest) => {
    try {
      const updated = await adminStudentManagementService.updateStudent(studentId, data)
      toast.success('Student updated successfully!')
      setShowEditModal(false)
      setSelectedStudent(null)
      fetchStudents()
      return updated
    } catch (err: any) {
      toast.error(getErrorMessage(err))
      throw err
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await adminStudentManagementService.deleteStudent(studentId)
      toast.success('Student deleted successfully!')
      fetchStudents()
      clearSelection()
    } catch (err: any) {
      toast.error(getErrorMessage(err))
      throw err
    }
  }

  const handleResetPassword = async (studentId: string) => {
    try {
      const result = await adminStudentManagementService.resetPassword(studentId, false)
      toast.success(`Password reset: ${result.temporary_password}`)
    } catch (err: any) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleSendWelcomeEmail = async (studentId: string) => {
    try {
      await adminStudentManagementService.sendWelcomeEmail(studentId)
      toast.success('Welcome email queued successfully!')
    } catch (err: any) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleExport = async (format: 'csv' | 'xlsx') => {
    setShowExportMenu(false)
    const toastId = toast.loading(`Exporting students as ${format.toUpperCase()}...`)
    try {
      const blob = await adminStudentManagementService.exportStudents({
        format,
        status: filterStatus,
        registration: registrationFilter,
        last_login: lastLoginFilter,
        search: searchTerm || undefined,
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `students_export_${new Date().toISOString().split('T')[0]}.${format === 'xlsx' ? 'xlsx' : 'csv'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Students exported successfully!', { id: toastId })
    } catch (err: any) {
      toast.error(getErrorMessage(err), { id: toastId })
    }
  }

  const handleImport = async (file: File) => {
    const result = await adminStudentManagementService.importStudents(file)
    toast.success(`Imported: ${result.imported} · Skipped: ${result.skipped} · Failed: ${result.failed}`)
    await fetchStudents()
    return result
  }

  const runBulkAction = async () => {
    if (!bulkConfirmAction || idsForBulk.length === 0) return
    setIsBulkProcessing(true)
    const toastId = toast.loading(`Processing ${idsForBulk.length} students...`)
    try {
      const result = await adminStudentManagementService.bulkAction(bulkConfirmAction, idsForBulk)
      toast.success(
        `${result.message}: ${result.updated_count} updated${result.failed_count ? `, ${result.failed_count} failed` : ''}`,
        { id: toastId }
      )
      setBulkConfirmAction(null)
      clearSelection()
      await fetchStudents()
    } catch (err: any) {
      toast.error(getErrorMessage(err), { id: toastId })
    } finally {
      setIsBulkProcessing(false)
    }
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Student Management 👨‍🎓
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                Manage students, import/export records, and onboard students efficiently.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                  📊 {stats.total_students} Total Students
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                  ✅ {stats.active_students} Active
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
                  🔴 {stats.inactive_students} Inactive
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                  ✔️ {stats.verified_students} Verified
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200">
                  🟢 {stats.logged_in_today} Logged In Today
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  ⏸ {stats.never_logged_in} Never Logged In
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Add Student</span>
          </motion.button>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowExportMenu((v) => !v)}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium shadow-sm w-full sm:w-auto"
            >
              <Download className="w-5 h-5" />
              <span>Export Data</span>
            </motion.button>
            {showExportMenu && (
              <div className="absolute z-20 mt-2 w-40 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1">
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleExport('csv')}
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleExport('xlsx')}
                >
                  Export Excel
                </button>
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowBulkUploadModal(true)}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium shadow-sm"
          >
            <Upload className="w-5 h-5" />
            <span>Import Data</span>
          </motion.button>
        </div>

        <AdminStudentManagementHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          registrationFilter={registrationFilter}
          onRegistrationFilterChange={setRegistrationFilter}
          lastLoginFilter={lastLoginFilter}
          onLastLoginFilterChange={setLastLoginFilter}
        />

        <AdminStudentBulkActionBar
          selectedCount={selectedCount}
          totalFilteredCount={filteredStudents.length}
          selectAllFiltered={selectAllFiltered}
          onSelectAllFiltered={() => {
            setSelectAllFiltered(true)
            setSelectedIds(new Set(filteredStudents.map((s) => s.id)))
          }}
          onClearSelection={clearSelection}
          onAction={(action) => setBulkConfirmAction(action)}
          isProcessing={isBulkProcessing}
        />

        <AdminStudentTable
          students={filteredStudents}
          isLoading={isLoading}
          error={error}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          selectAllFiltered={selectAllFiltered}
          onView={setViewStudent}
          onEdit={(student) => {
            setSelectedStudent(student)
            setShowEditModal(true)
          }}
          onDelete={handleDeleteStudent}
          onResetPassword={handleResetPassword}
          onSendWelcomeEmail={handleSendWelcomeEmail}
          onRetry={fetchStudents}
        />

        <CreateAdminStudentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateStudent}
        />
        <EditAdminStudentModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedStudent(null)
          }}
          student={selectedStudent}
          onSubmit={handleUpdateStudent}
        />
        <AdminStudentBulkUploadModal
          isOpen={showBulkUploadModal}
          onClose={() => setShowBulkUploadModal(false)}
          onSubmit={handleImport}
        />

        <AnimatePresence>
          {viewStudent && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50"
                onClick={() => setViewStudent(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Student Details</h3>
                  <button
                    type="button"
                    onClick={() => setViewStudent(null)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p><span className="font-medium">Name:</span> {viewStudent.name}</p>
                  <p><span className="font-medium">Email:</span> {viewStudent.email}</p>
                  <p><span className="font-medium">Phone:</span> {viewStudent.phone || '—'}</p>
                  <p><span className="font-medium">Status:</span> {viewStudent.status}</p>
                  <p><span className="font-medium">Verification:</span> {viewStudent.email_verified ? 'Verified' : 'Unverified'}</p>
                  <p><span className="font-medium">Last Login:</span> {formatLastLoginLabel(viewStudent.last_login)}</p>
                  <p><span className="font-medium">College:</span> {viewStudent.institution || '—'}</p>
                  <p><span className="font-medium">Department:</span> {viewStudent.degree || viewStudent.branch || '—'}</p>
                  <p><span className="font-medium">Year:</span> {viewStudent.graduation_year || '—'}</p>
                  <p><span className="font-medium">Registered:</span> {viewStudent.created_at ? new Date(viewStudent.created_at).toLocaleString() : '—'}</p>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudent(viewStudent)
                      setViewStudent(null)
                      setShowEditModal(true)
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Edit
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {bulkConfirmAction && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => !isBulkProcessing && setBulkConfirmAction(null)} />
            <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {BULK_CONFIRM[bulkConfirmAction].title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {BULK_CONFIRM[bulkConfirmAction].message(selectedCount)}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  disabled={isBulkProcessing}
                  onClick={() => setBulkConfirmAction(null)}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isBulkProcessing}
                  onClick={runBulkAction}
                  className={`px-4 py-2 rounded-lg text-white disabled:opacity-50 ${
                    BULK_CONFIRM[bulkConfirmAction].danger
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isBulkProcessing ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  )
}
