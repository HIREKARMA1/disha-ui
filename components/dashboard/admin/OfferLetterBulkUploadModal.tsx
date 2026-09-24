'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle,
  Download,
  FileText,
  Loader2,
  Upload,
  X,
} from 'lucide-react'
import { adminOfferLetterService } from '@/services/adminOfferLetterService'
import type { AdminOfferLetterBulkImportResponse } from '@/types/adminOfferLetter'
import { getErrorMessage } from '@/lib/error-handler'

type OfferLetterBulkUploadModalProps = {
  isOpen: boolean
  onClose: () => void
  onImported: () => void | Promise<void>
}

const MAX_SIZE = 10 * 1024 * 1024
const REQUIRED_COLUMNS = [
  'student_name',
  'company_name',
  'college_name',
  'passout_year',
  'offer_letter_url',
]

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

function validateCsvHeaders(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || '')
      const firstLine = text.split(/\r?\n/).find((line) => line.trim()) || ''
      const headers = parseCSVLine(firstLine).map((h) => h.toLowerCase())
      const missing = REQUIRED_COLUMNS.filter((col) => !headers.includes(col))
      resolve(
        missing.length
          ? `Missing required columns: ${missing.join(', ')}`
          : null
      )
    }
    reader.onerror = () => resolve('Could not read CSV file')
    reader.readAsText(file.slice(0, 64 * 1024))
  })
}

export function OfferLetterBulkUploadModal({
  isOpen,
  onClose,
  onImported,
}: OfferLetterBulkUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<AdminOfferLetterBulkImportResponse | null>(
    null
  )

  const reset = () => {
    setSelectedFile(null)
    setError(null)
    setImportResult(null)
    setIsUploading(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true)
    setError(null)
    try {
      const blob = await adminOfferLetterService.downloadTemplate()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'offer_letter_import_template.csv'
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    setImportResult(null)
    setError(null)
    if (!file) {
      setSelectedFile(null)
      return
    }
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setSelectedFile(null)
      setError('Please select a CSV file')
      return
    }
    if (file.size > MAX_SIZE) {
      setSelectedFile(null)
      setError('CSV file must be less than 10MB')
      return
    }
    const headerError = await validateCsvHeaders(file)
    if (headerError) {
      setSelectedFile(null)
      setError(headerError)
      return
    }
    setSelectedFile(file)
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
      const result = await adminOfferLetterService.bulkImport(selectedFile)
      setImportResult(result)
      setSelectedFile(null)
      if (result.success_count > 0) {
        await onImported()
      }
    } catch (err) {
      setError(getErrorMessage(err as any, 'Failed to import offer letters'))
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
            onClick={() => !isUploading && handleClose()}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-gray-800"
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Bulk upload offer letters
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Import up to 50 rows from a CSV with public Drive links.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !isUploading && handleClose()}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Required columns:{' '}
                  <code className="text-xs">
                    student_name, company_name, college_name, passout_year,
                    offer_letter_url
                  </code>
                  . Drive links must be set to &quot;Anyone with the link&quot;.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  disabled={isDownloadingTemplate || isUploading}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-800 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-100"
                >
                  <Download className="h-4 w-4" />
                  {isDownloadingTemplate ? 'Downloading...' : 'Download template'}
                </button>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {importResult && (
                <div className="space-y-2 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                  <div className="flex items-center gap-2 font-medium text-green-800 dark:text-green-200">
                    <CheckCircle className="h-4 w-4" />
                    Import complete
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Total rows: {importResult.total}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Success: {importResult.success_count}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Failed: {importResult.failed_count}
                  </p>
                  {importResult.errors?.length > 0 && (
                    <div className="mt-2 max-h-40 overflow-y-auto text-xs text-amber-800 dark:text-amber-300">
                      {importResult.errors.map((err, i) => (
                        <div key={`${err.row}-${i}`}>
                          Row {err.row}
                          {err.student_name ? ` (${err.student_name})` : ''}: {err.reason}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!importResult && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <label className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700/40">
                    {isUploading ? (
                      <Loader2 className="mb-2 h-8 w-8 animate-spin text-gray-400" />
                    ) : (
                      <Upload className="mb-2 h-8 w-8 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedFile ? selectedFile.name : 'Click to select CSV file'}
                    </span>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      className="hidden"
                      disabled={isUploading}
                      onChange={handleFileSelect}
                    />
                  </label>

                  {selectedFile && (
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <FileText className="h-4 w-4" />
                      Ready to import — this may take a minute while files download from Drive.
                    </div>
                  )}

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isUploading}
                      className="rounded-lg border border-gray-200 px-4 py-2 dark:border-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedFile || isUploading}
                      className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isUploading ? 'Importing...' : 'Import CSV'}
                    </button>
                  </div>
                </form>
              )}

              {importResult && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
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
