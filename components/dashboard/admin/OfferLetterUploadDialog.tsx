'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle,
  FileText,
  Loader2,
  Upload,
  X,
} from 'lucide-react'
import { AsyncSearchableSelect } from '@/components/ui/async-searchable-select'
import { listColleges } from '@/services/lookupAdminService'

export type OfferLetterUploadFormValues = {
  student_name: string
  company_name: string
  college_id: string
  college_label: string
  passout_year: number
  designation?: string
  salary_ctc?: string
  salary_in_hand?: string
  file: File
}

type OfferLetterUploadDialogProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: OfferLetterUploadFormValues) => Promise<void>
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const MAX_SIZE = 10 * 1024 * 1024

function buildYearOptions() {
  const current = new Date().getFullYear()
  const years: number[] = []
  for (let y = current + 2; y >= current - 10; y -= 1) {
    years.push(y)
  }
  return years
}

export function OfferLetterUploadDialog({
  isOpen,
  onClose,
  onSubmit,
}: OfferLetterUploadDialogProps) {
  const yearOptions = useMemo(() => buildYearOptions(), [])
  const [studentName, setStudentName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [collegeId, setCollegeId] = useState('')
  const [collegeLabel, setCollegeLabel] = useState('')
  const [passoutYear, setPassoutYear] = useState(String(new Date().getFullYear()))
  const [designation, setDesignation] = useState('')
  const [salaryCtc, setSalaryCtc] = useState('')
  const [salaryInHand, setSalaryInHand] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetForm = useCallback(() => {
    setStudentName('')
    setCompanyName('')
    setCollegeId('')
    setCollegeLabel('')
    setPassoutYear(String(new Date().getFullYear()))
    setDesignation('')
    setSalaryCtc('')
    setSalaryInHand('')
    setSelectedFile(null)
    setError(null)
    setIsDragOver(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  useEffect(() => {
    if (!isOpen) resetForm()
  }, [isOpen, resetForm])

  const fetchCollegeOptions = useCallback(async (searchTerm: string) => {
    const res = await listColleges({
      search: searchTerm.trim() || undefined,
      limit: 50,
      sort: 'name_asc',
    })
    return res.colleges.map((college) => ({
      value: college.id,
      label: college.name.replace(/['"]+/g, '').trim(),
    }))
  }, [])

  const handleFileSelect = (file: File) => {
    setError(null)
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please select a PDF, DOC, or DOCX file.')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('File size must be less than 10MB.')
      return
    }
    setSelectedFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!studentName.trim()) {
      setError('Student name is required.')
      return
    }
    if (!companyName.trim()) {
      setError('Company name is required.')
      return
    }
    if (!collegeId) {
      setError('Please select a college.')
      return
    }
    const year = Number(passoutYear)
    if (!Number.isFinite(year)) {
      setError('Please select a valid passout year.')
      return
    }
    if (!selectedFile) {
      setError('Please upload an offer letter file.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        student_name: studentName.trim(),
        company_name: companyName.trim(),
        college_id: collegeId,
        college_label: collegeLabel,
        passout_year: year,
        designation: designation.trim() || undefined,
        salary_ctc: salaryCtc.trim() || undefined,
        salary_in_hand: salaryInHand.trim() || undefined,
        file: selectedFile,
      })
      resetForm()
      onClose()
    } catch (err: unknown) {
      const detail =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { detail?: unknown } } }).response?.data?.detail ===
          'string'
          ? (err as { response: { data: { detail: string } } }).response.data.detail
          : null
      setError(detail || (err instanceof Error ? err.message : 'Failed to upload offer letter.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={() => !isSubmitting && onClose()}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-900"
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add Offer Letter
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Upload an offer letter with student and company details.
              </p>
            </div>
            <button
              type="button"
              onClick={() => !isSubmitting && onClose()}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="space-y-4 overflow-y-auto px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">
                    Student name <span className="text-red-500">*</span>
                  </span>
                  <input
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="Enter student name"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">
                    Company name <span className="text-red-500">*</span>
                  </span>
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="Enter company name"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <AsyncSearchableSelect
                    label="College"
                    fetchOptions={fetchCollegeOptions}
                    value={collegeId}
                    onChange={(value, option) => {
                      setCollegeId(value)
                      setCollegeLabel(option?.label || '')
                    }}
                    placeholder="Search and select college..."
                    searchPlaceholder="Type college name..."
                    debounceMs={400}
                    portal
                  />
                </div>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">
                    Passout year / batch <span className="text-red-500">*</span>
                  </span>
                  <select
                    value={passoutYear}
                    onChange={(e) => setPassoutYear(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">
                  Designation <span className="text-gray-400">(optional)</span>
                </span>
                <input
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="e.g. Software Engineer"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">
                    Salary CTC <span className="text-gray-400">(optional)</span>
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={salaryCtc}
                    onChange={(e) => setSalaryCtc(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="Annual CTC"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">
                    Salary in hand <span className="text-gray-400">(optional)</span>
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={salaryInHand}
                    onChange={(e) => setSalaryInHand(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="In-hand amount"
                  />
                </label>
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Offer letter file <span className="text-red-500">*</span>
                </span>
                <div
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragOver(false)
                    const files = Array.from(e.dataTransfer.files)
                    if (files[0]) handleFileSelect(files[0])
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragOver(true)
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault()
                    setIsDragOver(false)
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                    isDragOver
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-gray-300 hover:border-blue-400 dark:border-gray-600'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files
                      if (files?.[0]) handleFileSelect(files[0])
                    }}
                  />
                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle className="h-8 w-8 text-emerald-500" />
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                        <FileText className="h-4 w-4" />
                        {selectedFile.name}
                      </div>
                      <p className="text-xs text-gray-500">Click to replace</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Drag & drop or click to upload
                      </p>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload offer letter
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
