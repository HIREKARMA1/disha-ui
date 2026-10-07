'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { apiClient } from '@/lib/api'
import type { CampusDriveJobSummary } from '@/types/campusDrive'
import { toast } from 'react-hot-toast'

interface AdminJobRow {
  id: string
  title: string
  description?: string
  location?: string | string[]
  job_type?: string
  status?: string
  corporate_name?: string
  company_name?: string
  salary_min?: number
  salary_max?: number
  salary_currency?: string
  slug?: string
}

function toSummary(job: AdminJobRow): CampusDriveJobSummary {
  const location = Array.isArray(job.location) ? job.location.filter(Boolean).join(', ') : job.location
  return {
    id: job.id,
    title: job.title,
    company_name: job.corporate_name || job.company_name || '',
    location: location || '',
    job_type: job.job_type,
    status: job.status,
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    salary_currency: job.salary_currency,
    slug: job.slug,
  }
}

interface CampusDriveJobPickerProps {
  open: boolean
  selected: CampusDriveJobSummary[]
  onClose: () => void
  onSave: (jobs: CampusDriveJobSummary[]) => void
}

export function CampusDriveJobPicker({ open, selected, onClose, onSave }: CampusDriveJobPickerProps) {
  const [jobs, setJobs] = useState<AdminJobRow[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [jobType, setJobType] = useState('all')
  const [picked, setPicked] = useState<Record<string, CampusDriveJobSummary>>({})

  useEffect(() => {
    if (!open) return
    const initial: Record<string, CampusDriveJobSummary> = {}
    selected.forEach((job) => {
      initial[job.id] = job
    })
    setPicked(initial)
    setSearch('')
    setStatus('all')
    setJobType('all')
  }, [open, selected])

  useEffect(() => {
    if (!open || jobs.length) return
    setLoading(true)
    apiClient
      .getAllJobsAdmin()
      .then((response) => {
        const list = Array.isArray(response) ? response : response?.jobs || []
        setJobs(list)
      })
      .catch(() => toast.error('Failed to load admin jobs'))
      .finally(() => setLoading(false))
  }, [open, jobs.length])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return jobs.filter((job) => {
      const company = (job.corporate_name || job.company_name || '').toLowerCase()
      const matchesSearch =
        !term || job.title.toLowerCase().includes(term) || company.includes(term)
      const matchesStatus = status === 'all' || job.status === status
      const matchesType = jobType === 'all' || job.job_type === jobType
      return matchesSearch && matchesStatus && matchesType
    })
  }, [jobs, search, status, jobType])

  if (!open) return null

  const toggle = (job: AdminJobRow) => {
    setPicked((current) => {
      const next = { ...current }
      if (next[job.id]) delete next[job.id]
      else next[job.id] = toSummary(job)
      return next
    })
  }

  const chosen = Object.values(picked)

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-t-2xl bg-white shadow-xl dark:bg-gray-900 sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Jobs</h2>
            <p className="text-xs text-gray-500">Same jobs as Admin → Jobs, including drafts and unpublished jobs.</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-2 border-b border-gray-200 p-4 dark:border-gray-700 sm:grid-cols-3">
          <div className="relative sm:col-span-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or company"
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={jobType} onValueChange={setJobType}>
            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full_time">Full Time</SelectItem>
              <SelectItem value="part_time">Part Time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">No jobs match these filters.</p>
          ) : (
            <ul className="space-y-2">
              {filtered.map((job) => {
                const summary = toSummary(job)
                const checked = Boolean(picked[job.id])
                return (
                  <li key={job.id}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                      <Checkbox checked={checked} onChange={() => toggle(job)} />
                      <span className="min-w-0">
                        <span className="block font-medium text-gray-900 dark:text-white">{summary.title}</span>
                        <span className="block text-sm text-gray-500">
                          {summary.company_name || 'Company not set'}
                          {summary.location ? ` · ${summary.location}` : ''}
                          {summary.status ? ` · ${summary.status}` : ''}
                        </span>
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 px-4 py-3 dark:border-gray-700">
          <span className="text-sm text-gray-500">{chosen.length} selected</span>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setPicked({})}>
              Clear selection
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={() => onSave(chosen)}>
              Save selected jobs
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
