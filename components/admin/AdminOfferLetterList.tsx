'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Download,
  Eye,
  FileCheck,
  Loader2,
  Plus,
  Search,
  Upload,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { AdminPageHero } from '@/components/admin/ui/AdminPageHero'
import { OfferLetterBulkUploadModal } from '@/components/dashboard/admin/OfferLetterBulkUploadModal'
import { OfferLetterUploadDialog } from '@/components/dashboard/admin/OfferLetterUploadDialog'
import type { OfferLetterUploadFormValues } from '@/components/dashboard/admin/OfferLetterUploadDialog'
import { AsyncSearchableSelect } from '@/components/ui/async-searchable-select'
import { Button } from '@/components/ui/button'
import { adminOfferLetterService } from '@/services/adminOfferLetterService'
import { listColleges } from '@/services/lookupAdminService'
import type { AdminOfferLetter } from '@/types/adminOfferLetter'

const PAGE_SIZE = 20

function formatDate(value: string) {
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

function formatSalary(value?: number | string | null) {
  if (value === null || value === undefined || value === '') return '—'
  const num = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(num)) return String(value)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num)
}

export function AdminOfferLetterList() {
  const [items, setItems] = useState<AdminOfferLetter[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [collegeId, setCollegeId] = useState('')
  const [passoutYear, setPassoutYear] = useState('')
  const [passoutYears, setPassoutYears] = useState<number[]>([])
  const [page, setPage] = useState(1)
  const [showUpload, setShowUpload] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => window.clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, collegeId, passoutYear])

  const fetchYears = useCallback(async () => {
    try {
      const res = await adminOfferLetterService.listPassoutYears()
      setPassoutYears(res.years)
    } catch {
      setPassoutYears([])
    }
  }, [])

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const result = await adminOfferLetterService.list({
        search: debouncedSearch.trim() || undefined,
        college_id: collegeId || undefined,
        passout_year: passoutYear ? Number(passoutYear) : undefined,
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      })
      setItems(result.items)
      setTotal(result.total)
    } catch (err: unknown) {
      const status =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { status?: number } }).response?.status === 'number'
          ? (err as { response: { status: number } }).response.status
          : undefined
      if (status === 401 || status === 403) {
        toast.error('Admin login required to view offer letters')
      } else {
        toast.error('Failed to load offer letters')
      }
      setItems([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, collegeId, passoutYear, page])

  useEffect(() => {
    fetchYears()
  }, [fetchYears])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const fetchCollegeOptions = useCallback(async (term: string) => {
    const res = await listColleges({
      search: term.trim() || undefined,
      limit: 50,
      sort: 'name_asc',
    })
    return res.colleges.map((college) => ({
      value: college.id,
      label: college.name.replace(/['"]+/g, '').trim(),
    }))
  }, [])

  const handleUpload = async (values: OfferLetterUploadFormValues) => {
    await adminOfferLetterService.create({
      student_name: values.student_name,
      company_name: values.company_name,
      college_id: values.college_id,
      passout_year: values.passout_year,
      file: values.file,
      designation: values.designation,
      salary_ctc: values.salary_ctc,
      salary_in_hand: values.salary_in_hand,
    })
    toast.success('Offer letter uploaded successfully')
    setShowUpload(false)
    await fetchYears()
    if (page === 1) {
      await fetchItems()
    } else {
      setPage(1)
    }
  }

  const refreshAfterImport = async () => {
    await fetchYears()
    if (page === 1) {
      await fetchItems()
    } else {
      setPage(1)
    }
  }

  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true)
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
      toast.success('Template downloaded')
    } catch {
      toast.error('Failed to download template')
    } finally {
      setIsDownloadingTemplate(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 md:space-y-6">
      <AdminPageHero
        title="Offer Letters"
        subtitle="Upload and manage student offer letters by college and passout batch."
        chips={[
          { label: `${total} total` },
          { label: `${passoutYears.length} batches` },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Search by student, company, or college. Filter by college and passout year.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            disabled={isDownloadingTemplate}
            className="inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isDownloadingTemplate ? 'Downloading...' : 'Download template'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowBulkUpload(true)}
            className="inline-flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Bulk upload
          </Button>
          <Button onClick={() => setShowUpload(true)} className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Offer Letter
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, company, or college..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <AsyncSearchableSelect
                fetchOptions={fetchCollegeOptions}
                value={collegeId}
                onChange={(value) => setCollegeId(value)}
                placeholder="All colleges"
                searchPlaceholder="Search college..."
                debounceMs={400}
              />
            </div>
            {collegeId ? (
              <button
                type="button"
                onClick={() => setCollegeId('')}
                className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Clear
              </button>
            ) : null}
          </div>
          <select
            value={passoutYear}
            onChange={(e) => setPassoutYear(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All batches</option>
            {passoutYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        {loading ? (
          <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading offer letters...
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
            <FileCheck className="h-10 w-10 text-gray-300" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              No offer letters found
            </p>
            <p className="text-xs text-gray-500">
              Try adjusting filters or upload a new offer letter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/60">
                <tr>
                  {[
                    'Student',
                    'Company',
                    'College',
                    'Passout year',
                    'Designation',
                    'Salary (CTC / In hand)',
                    'Uploaded',
                    'Actions',
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {item.student_name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {item.company_name}
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {item.college_name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {item.passout_year}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {item.designation || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {formatSalary(item.salary_ctc)} / {formatSalary(item.salary_in_hand)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 dark:border-gray-600 dark:text-blue-300 dark:hover:bg-blue-950/40"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </a>
                        <a
                          href={item.file_url}
                          download={item.file_name || undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-gray-600 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > PAGE_SIZE && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 dark:border-gray-700">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <OfferLetterUploadDialog
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onSubmit={handleUpload}
      />

      <OfferLetterBulkUploadModal
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        onImported={refreshAfterImport}
      />
    </div>
  )
}
