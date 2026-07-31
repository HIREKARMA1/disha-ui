"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { X, Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { adminStudentManagementService } from '@/services/adminStudentManagementService'
import { AdminStudentImportResponse } from '@/types/adminStudent'
import { getErrorMessage } from '@/lib/error-handler'

interface AdminStudentBulkUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (file: File) => Promise<AdminStudentImportResponse>
}

const MAX_SIZE = 10 * 1024 * 1024
const REQUIRED_COLUMNS = ['name', 'email']

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') inQuotes = !inQuotes
    else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else current += char
  }
  result.push(current.trim())
  return result
}

export function AdminStudentBulkUploadModal({
  isOpen,
  onClose,
  onSubmit,
}: AdminStudentBulkUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<AdminStudentImportResponse | null>(null)
  const [preview, setPreview] = useState<{
    rowCount: number
    sampleData: Record<string, string>[]
    validationErrors: string[]
  } | null>(null)

  const handleClose = () => {
    setSelectedFile(null)
    setError(null)
    setImportResult(null)
    setPreview(null)
    onClose()
  }

  const validateContent = async (file: File) => {
    const text = await file.text()
    const lines = text.split('\n').filter((l) => l.trim())
    if (lines.length === 0) {
      return { ok: false as const, error: 'CSV file is empty' }
    }

    const header = parseCSVLine(lines[0]).map((c) => c.trim().toLowerCase())
    const missing = REQUIRED_COLUMNS.filter((c) => !header.includes(c))
    if (missing.length) {
      return { ok: false as const, error: `Missing required columns: ${missing.join(', ')}` }
    }

    const sampleData: Record<string, string>[] = []
    const validationErrors: string[] = []
    const seen = new Set<string>()

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      const row: Record<string, string> = {}
      header.forEach((col, idx) => {
        row[col] = (values[idx] || '').trim()
      })
      if (i <= 3) sampleData.push(row)

      const rowErrors: string[] = []
      if (!row.name) rowErrors.push('name is required')
      if (!row.email) rowErrors.push('email is required')
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) rowErrors.push('invalid email')
      else if (seen.has(row.email.toLowerCase())) rowErrors.push('duplicate email in CSV')
      if (row.email) seen.add(row.email.toLowerCase())

      if (rowErrors.length && validationErrors.length < 10) {
        validationErrors.push(`Row ${i + 1}: ${rowErrors.join(', ')}`)
      }
    }

    return {
      ok: validationErrors.length === 0,
      error: validationErrors.length ? validationErrors.join('; ') : undefined,
      preview: {
        rowCount: lines.length - 1,
        sampleData,
        validationErrors,
      },
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setImportResult(null)
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file')
      setSelectedFile(null)
      setPreview(null)
      return
    }
    if (file.size > MAX_SIZE) {
      setError('File size must be less than 10MB')
      setSelectedFile(null)
      setPreview(null)
      return
    }
    if (file.size === 0) {
      setError('File is empty')
      setSelectedFile(null)
      setPreview(null)
      return
    }

    const result = await validateContent(file)
    if (!result.ok) {
      setError(result.error || 'Validation failed')
      setSelectedFile(null)
      setPreview(result.preview || null)
      return
    }
    setSelectedFile(file)
    setPreview(result.preview || null)
    setError(null)
  }

  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true)
    try {
      const blob = await adminStudentManagementService.downloadTemplate()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'student_import_template.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(getErrorMessage(err as any, 'Failed to download template'))
    } finally {
      setIsDownloadingTemplate(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      setError('Please select a CSV file to upload')
      return
    }
    setIsUploading(true)
    setError(null)
    try {
      const result = await onSubmit(selectedFile)
      setImportResult(result)
      setSelectedFile(null)
    } catch (err) {
      setError(getErrorMessage(err as any, 'Failed to import students'))
    } finally {
      setIsUploading(false)
    }
  }

  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Import Students</h2>
              <button type="button" onClick={handleClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Upload a CSV with columns: <code>name,email,phone_number</code> (max 10MB)
                </p>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  disabled={isDownloadingTemplate}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200"
                >
                  <Download className="w-4 h-4" />
                  {isDownloadingTemplate ? 'Downloading...' : 'Download Template'}
                </button>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 p-3 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {importResult && (
                <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 p-4 space-y-1">
                  <div className="flex items-center gap-2 text-green-800 dark:text-green-200 font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Import complete
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">Imported: {importResult.imported}</p>
                  <p className="text-sm text-green-700 dark:text-green-300">Skipped: {importResult.skipped}</p>
                  <p className="text-sm text-green-700 dark:text-green-300">Failed: {importResult.failed}</p>
                  {importResult.errors?.length > 0 && (
                    <div className="mt-2 text-xs text-amber-700 dark:text-amber-300 max-h-32 overflow-y-auto">
                      {importResult.errors.slice(0, 15).map((err, i) => (
                        <div key={i}>{err}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!importResult && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedFile ? selectedFile.name : 'Click to select CSV file'}
                    </span>
                    <input type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />
                  </label>

                  {preview && (
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                        <FileText className="w-4 h-4" />
                        Preview — {preview.rowCount} row(s)
                      </div>
                      <div className="overflow-x-auto text-xs">
                        <table className="min-w-full">
                          <thead>
                            <tr className="text-left text-gray-500">
                              <th className="pr-3 py-1">name</th>
                              <th className="pr-3 py-1">email</th>
                              <th className="py-1">phone_number</th>
                            </tr>
                          </thead>
                          <tbody>
                            {preview.sampleData.map((row, i) => (
                              <tr key={i} className="text-gray-700 dark:text-gray-300">
                                <td className="pr-3 py-1">{row.name}</td>
                                <td className="pr-3 py-1">{row.email}</td>
                                <td className="py-1">{row.phone_number || row.phone || ''}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedFile || isUploading}
                      className="px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 font-medium"
                    >
                      {isUploading ? 'Importing...' : 'Import Data'}
                    </button>
                  </div>
                </form>
              )}

              {importResult && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
