"use client"

import { Calendar, Download, Filter, Search } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'not_resolved', label: 'Not resolved' },
  { value: 'connected', label: 'Connected' },
  { value: 'resolved', label: 'Resolved' },
]

const ENQUIRY_OPTIONS = [
  { value: 'all', label: 'All enquiries' },
  { value: 'disha', label: 'Disha' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'batch_enroll', label: 'Batch enroll' },
]

const fieldLabel = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 h-4'
const fieldControl =
  'h-10 w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200'

interface SupportToolbarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  enquiryFilter: string
  onEnquiryFilterChange: (value: string) => void
  dateFrom: string
  onDateFromChange: (value: string) => void
  dateTo: string
  onDateToChange: (value: string) => void
  onDownload: () => void
  isDownloading?: boolean
  disableDownload?: boolean
}

export function SupportToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  enquiryFilter,
  onEnquiryFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onDownload,
  isDownloading = false,
  disableDownload = false,
}: SupportToolbarProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onDownload}
          disabled={isDownloading || disableDownload}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          <span>{isDownloading ? 'Downloading...' : 'Download sheet'}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 items-end">
          <div>
            <label className={fieldLabel} htmlFor="support-search">
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="support-search"
                type="text"
                placeholder="Query no, phone, name, or problem"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`${fieldControl} pl-10 pr-3 placeholder-gray-500 dark:placeholder-gray-400`}
              />
            </div>
          </div>

          <div>
            <label className={fieldLabel} htmlFor="support-enquiry">
              Enquiry
            </label>
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                id="support-enquiry"
                value={enquiryFilter}
                onChange={(e) => onEnquiryFilterChange(e.target.value)}
                className={`${fieldControl} pl-10 pr-8 appearance-none`}
              >
                {ENQUIRY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={fieldLabel} htmlFor="support-status">
              Status
            </label>
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                id="support-status"
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className={`${fieldControl} pl-10 pr-8 appearance-none`}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={fieldLabel} htmlFor="support-date-from">
              From
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="support-date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                className={`${fieldControl} pl-10 pr-3`}
              />
            </div>
          </div>

          <div>
            <label className={fieldLabel} htmlFor="support-date-to">
              To
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="support-date-to"
                type="date"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
                className={`${fieldControl} pl-10 pr-3`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
