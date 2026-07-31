"use client"

import { useEffect, useMemo, useState } from 'react'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { AdminStudentManagementHeader } from '@/components/dashboard/AdminStudentManagementHeader'
import { AdminStudentTable } from '@/components/dashboard/AdminStudentTable'
import { CreateAdminStudentModal } from '@/components/dashboard/CreateAdminStudentModal'
import { EditAdminStudentModal } from '@/components/dashboard/EditAdminStudentModal'
import { AdminStudentBulkUploadModal } from '@/components/dashboard/AdminStudentBulkUploadModal'
import { adminStudentManagementService } from '@/services/adminStudentManagementService'
import {
  AdminStudentListItem,
  CreateAdminStudentRequest,
  UpdateAdminStudentRequest,
} from '@/types/adminStudent'
import { toast } from 'react-hot-toast'
import { getErrorMessage } from '@/lib/error-handler'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Download, Upload, X } from 'lucide-react'

function matchesRegistrationFilter(createdAt: string | null | undefined, filter: string): boolean {
  if (filter === 'all' || !createdAt) return filter === 'all' ? true : false
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

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<AdminStudentListItem[]>([])
  const [stats, setStats] = useState({
    total_students: 0,
    active_students: 0,
    verified_students: 0,
    registered_today: 0,
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
  const [showExportMenu, setShowExportMenu] = useState(false)

  const fetchStudents = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await adminStudentManagementService.getStudents(false)
      setStudents(response.students || [])
      setStats({
        total_students: response.total_students || 0,
        active_students: response.active_students || 0,
        verified_students: response.verified_students || 0,
        registered_today: response.registered_today || 0,
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
    return students.filter((student) => {
      const matchesSearch =
        searchTerm === '' ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.phone && student.phone.includes(searchTerm))

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'verified' && student.email_verified) ||
        (filterStatus === 'unverified' && !student.email_verified) ||
        (filterStatus === 'active' && student.status === 'active') ||
        (filterStatus === 'inactive' && student.status === 'inactive')

      const matchesRegistration = matchesRegistrationFilter(student.created_at, registrationFilter)

      return matchesSearch && matchesStatus && matchesRegistration
    })
  }, [students, searchTerm, filterStatus, registrationFilter])

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
                  ✅ {stats.active_students} Active Students
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                  ✔️ {stats.verified_students} Verified Students
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200">
                  🆕 {stats.registered_today} Registered Today
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
        />

        <AdminStudentTable
          students={filteredStudents}
          isLoading={isLoading}
          error={error}
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
      </div>
    </AdminDashboardLayout>
  )
}
