"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { Briefcase, Building2, Users, X, Search, Loader2, AlertCircle, Eye, ExternalLink } from 'lucide-react'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'react-hot-toast'

type Applicant = {
  id: string
  application_id?: string
  name?: string
  email?: string
  phone?: string
  institution?: string
  college?: string
  resume?: string | null
  resume_url?: string | null
  status?: string
  applicant_source?: 'shortlisted' | 'campus'
  shortlisted_batch_id?: string | null
  shortlisted_batch_name?: string | null
  applied_at?: string | null
}

type ManagedJob = {
  id: string
  title: string
  corporate_name?: string
  company_name?: string
  batches: Array<{ id: string; name: string }>
  applicants: Applicant[]
}

const normalizeStatus = (status?: string) => (status || 'applied').toLowerCase()
const safeResumeUrl = (value?: string | null) => {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}

export default function ManageShortlistedJobsPage() {
  const [jobs, setJobs] = useState<ManagedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [activeJob, setActiveJob] = useState<ManagedJob | null>(null)
  const [pendingChange, setPendingChange] = useState<{ applicant: Applicant; status: 'selected' | 'rejected' | 'shortlisted' | 'forwarded_to_company' } | null>(null)
  const [updatingApplicationId, setUpdatingApplicationId] = useState<string | null>(null)
  const updateInFlight = useRef(false)

  const updateApplicantLocally = (applicationId: string, status: string) => {
    const update = (job: ManagedJob) => ({
      ...job,
      applicants: job.applicants.map((applicant) => applicant.application_id === applicationId
        ? { ...applicant, status }
        : applicant),
    })
    setJobs((current) => current.map(update))
    setActiveJob((current) => current ? update(current) : current)
  }

  const confirmStatusChange = async () => {
    if (!activeJob || !pendingChange || updateInFlight.current) return
    const { applicant, status } = pendingChange
    const applicationId = applicant.application_id
    if (!applicationId) return
    updateInFlight.current = true
    try {
      setUpdatingApplicationId(applicationId)
      const response = await apiClient.updateShortlistedApplicationStatus(activeJob.id, applicationId, status)
      updateApplicantLocally(applicationId, response?.status || status)
      setPendingChange(null)
      const messages = {
        shortlisted: 'Candidate shortlisted successfully.',
        selected: 'Candidate selected successfully.',
        rejected: 'Candidate rejected successfully.',
        forwarded_to_company: 'Candidate forwarded to company successfully.',
      }
      toast.success(messages[status])
    } catch (err: any) {
      setPendingChange(null)
      toast.error(err?.response?.data?.detail || 'Could not update this application. Please try again.')
    } finally {
      updateInFlight.current = false
      setUpdatingApplicationId(null)
    }
  }

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await apiClient.getAllJobsAdmin()
        const allJobs = Array.isArray(response) ? response : response?.jobs || []
        const assigned = await Promise.all(allJobs.map(async (job: any) => {
          const batches = await apiClient.getAssignedShortlistedBatchesAdmin(job.id)
          return { job, batches: Array.isArray(batches) ? batches : [] }
        }))
        const visible = assigned.filter(({ batches }) => batches.length > 0)
        const rows = await Promise.all(visible.map(async ({ job, batches }) => {
          const applicantsResponse = await apiClient.getAppliedStudentsAdmin(job.id)
          const shortlistedApplicants = (Array.isArray(applicantsResponse) ? applicantsResponse : [])
            .filter((applicant: Applicant) => applicant.applicant_source === 'shortlisted')
          const uniqueApplicants = new Map<string, Applicant>()
          for (const applicant of shortlistedApplicants as Applicant[]) {
            if (!uniqueApplicants.has(applicant.id)) uniqueApplicants.set(applicant.id, applicant)
          }
          const applicants: Applicant[] = Array.from(uniqueApplicants.values())
          return {
            id: String(job.id),
            title: job.title || 'Untitled job',
            corporate_name: job.corporate_name || job.company_name,
            company_name: job.company_name || job.corporate_name,
            batches: batches.map((batch: any) => ({ id: String(batch.id), name: batch.name || 'Unnamed cohort' })),
            applicants,
          } satisfies ManagedJob
        }))
        if (!cancelled) setJobs(rows)
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.detail || 'Could not load Shortlisted job assignments. Please try again.')
          setJobs([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [])

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return jobs
    return jobs.filter((job) =>
      [job.title, job.company_name, ...job.batches.map((batch) => batch.name)]
        .some((value) => value?.toLowerCase().includes(query))
    )
  }, [jobs, search])

  const selectedStatusFor = (applicant: Applicant) => {
    if (pendingChange && pendingChange.applicant.application_id === applicant.application_id) {
      return pendingChange.status
    }
    return statusSelectValue(applicant.status)
  }

  return (
    <AdminDashboardLayout>
      <div className="mx-auto max-w-[1600px] space-y-6">
        <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-indigo-100 p-3 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"><Briefcase className="h-6 w-6" /></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Shortlisted Jobs</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Review jobs assigned to Shortlisted cohorts and track their applicants.</p>
            </div>
          </div>
        </header>

        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input className="pl-9" placeholder="Search jobs, companies, or cohorts" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-20 dark:border-white/10 dark:bg-gray-900"><Loader2 className="h-7 w-7 animate-spin text-indigo-500" /><span className="ml-3 text-sm text-gray-500">Loading assigned jobs…</span></div>
        ) : error ? (
          <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><p>{error}</p></div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-white/10 dark:bg-gray-900"><Briefcase className="mx-auto h-10 w-10 text-gray-400" /><h2 className="mt-3 font-semibold text-gray-900 dark:text-white">{jobs.length ? 'No matching jobs' : 'No jobs assigned to Shortlisted'}</h2><p className="mt-1 text-sm text-gray-500">{jobs.length ? 'Try another search.' : 'Jobs assigned to a Shortlisted cohort will appear here.'}</p></div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:border-white/10 dark:bg-white/[0.03]"><tr><th className="px-5 py-4">Company / Job</th><th className="px-5 py-4">Assigned cohorts</th><th className="px-5 py-4">Total</th><th className="px-5 py-4">Applied / Pending</th><th className="px-5 py-4">Shortlisted</th><th className="px-5 py-4">Selected</th><th className="px-5 py-4">Rejected</th><th className="px-5 py-4">Forwarded to Company</th><th className="px-5 py-4">Action</th></tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredJobs.map((job) => {
                  const selected = job.applicants.filter((applicant) => normalizeStatus(applicant.status) === 'selected').length
                  const rejected = job.applicants.filter((applicant) => normalizeStatus(applicant.status) === 'rejected').length
                  const appliedPending = job.applicants.filter((applicant) => ['applied', 'pending'].includes(normalizeStatus(applicant.status))).length
                  const shortlisted = job.applicants.filter((applicant) => normalizeStatus(applicant.status) === 'shortlisted').length
                  const forwarded = job.applicants.filter((applicant) => normalizeStatus(applicant.status) === 'forwarded_to_company').length
                  return <tr key={job.id} className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02]">
                    <td className="px-5 py-4"><div className="flex items-start gap-3"><Building2 className="mt-0.5 h-4 w-4 text-gray-400" /><div><div className="font-semibold text-gray-900 dark:text-white">{job.company_name || 'Company not specified'}</div><div className="mt-0.5 text-gray-500">{job.title}</div></div></div></td>
                    <td className="px-5 py-4"><div className="flex flex-wrap gap-1.5">{job.batches.map((batch) => <span key={batch.id} title={batch.id} className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">{batch.name}</span>)}</div></td>
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">{job.applicants.length}</td><td className="px-5 py-4">{appliedPending}</td><td className="px-5 py-4">{shortlisted}</td><td className="px-5 py-4">{selected}</td><td className="px-5 py-4">{rejected}</td><td className="px-5 py-4">{forwarded}</td>
                    <td className="px-5 py-4"><Button size="sm" variant="outline" onClick={() => setActiveJob(job)}><Eye className="mr-2 h-4 w-4" />View Applicants</Button></td>
                  </tr>
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activeJob && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-2 sm:p-4" onClick={() => setActiveJob(null)}>
        <section role="dialog" aria-modal="true" aria-label={`Applicants for ${activeJob.title}`} className="flex max-h-[94vh] w-full max-w-[96rem] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900" onClick={(event) => event.stopPropagation()}>
          <header className="flex items-center justify-between border-b border-gray-200 p-5 dark:border-white/10"><div><h2 className="font-semibold text-gray-900 dark:text-white">Shortlisted Applicants</h2><p className="mt-1 text-sm text-gray-500">{activeJob.company_name} · {activeJob.title}</p></div><Button variant="ghost" size="sm" aria-label="Close applicants" onClick={() => setActiveJob(null)}><X className="h-5 w-5" /></Button></header>
          <div className="overflow-auto p-3 sm:p-5">{activeJob.applicants.length ? <>
            <div className="hidden overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10 md:block">
              <table className="w-full min-w-[1500px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-white/[0.03]"><tr>{['Student Name', 'Email', 'Phone', 'College / Institution', 'Cohort', 'Applied Date', 'Resume', 'Current Status', 'Update Application Status'].map((label) => <th key={label} className="px-3 py-3">{label}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">{activeJob.applicants.map((applicant, index) => <ApplicantRow key={applicant.application_id || applicant.id || index} applicant={applicant} disabled={updatingApplicationId === applicant.application_id} selectedStatus={selectedStatusFor(applicant)} onStatusSelect={(status) => setPendingChange({ applicant, status })} />)}</tbody>
              </table>
            </div>
            <div className="space-y-3 md:hidden">{activeJob.applicants.map((applicant, index) => <ApplicantCard key={applicant.application_id || applicant.id || index} applicant={applicant} disabled={updatingApplicationId === applicant.application_id} selectedStatus={selectedStatusFor(applicant)} onStatusSelect={(status) => setPendingChange({ applicant, status })} />)}</div>
          </> : <div className="py-10 text-center"><Users className="mx-auto h-8 w-8 text-gray-400" /><p className="mt-2 text-sm text-gray-500">No Shortlisted applicants yet.</p></div>}</div>
        </section>
      </div>}
      {pendingChange && activeJob && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4" role="alertdialog" aria-modal="true" aria-labelledby="status-confirm-title">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"><h2 id="status-confirm-title" className="text-lg font-semibold text-gray-900 dark:text-white">Confirm status change</h2><p className="mt-3 text-sm text-gray-600 dark:text-gray-300">Are you sure you want to change {pendingChange.applicant.name || 'this candidate'}'s application status from {statusLabel(pendingChange.applicant.status)} to {statusLabel(pendingChange.status)}?</p><div className="mt-6 flex justify-end gap-3"><Button variant="outline" disabled={Boolean(updatingApplicationId)} onClick={() => setPendingChange(null)}>Cancel</Button><Button disabled={Boolean(updatingApplicationId)} onClick={confirmStatusChange}>{updatingApplicationId ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : 'Confirm'}</Button></div></div>
      </div>}
    </AdminDashboardLayout>
  )
}

function statusLabel(status?: string) {
  const normalized = normalizeStatus(status)
  if (normalized === 'forwarded_to_company') return 'Forwarded to Company'
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

function StatusBadge({ status }: { status: string }) {
  const tones: Record<string, string> = {
    applied: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
    shortlisted: 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300',
    selected: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
    forwarded_to_company: 'bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300',
  }
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${tones[status] || 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300'}`}>{statusLabel(status)}</span>
}

type SelectableStatus = 'selected' | 'rejected' | 'shortlisted' | 'forwarded_to_company'

function statusSelectValue(status?: string): SelectableStatus | '' {
  const normalized = normalizeStatus(status)
  return ['selected', 'rejected', 'shortlisted', 'forwarded_to_company'].includes(normalized)
    ? normalized as SelectableStatus
    : ''
}

function ApplicantStatusSelect({ selectedStatus, disabled, onStatusSelect }: { selectedStatus: SelectableStatus | ''; disabled: boolean; onStatusSelect: (status: SelectableStatus) => void }) {
  return <div className="flex min-w-[190px] items-center gap-2">
    <Select value={selectedStatus} onValueChange={(value) => { if (value !== selectedStatus) onStatusSelect(value as SelectableStatus) }} disabled={disabled}>
      <SelectTrigger aria-label="Update Application Status" className="h-9"><SelectValue placeholder="Select status" /></SelectTrigger>
      <SelectContent className="z-[120] min-w-[230px]">
        <SelectItem value="selected" className="cursor-pointer text-green-700 dark:text-green-300">Selected</SelectItem>
        <SelectItem value="rejected" className="cursor-pointer text-red-700 dark:text-red-300">Rejected</SelectItem>
        <SelectItem value="shortlisted" className="cursor-pointer text-purple-700 dark:text-purple-300">Shortlisted</SelectItem>
        <SelectItem value="forwarded_to_company" className="cursor-pointer text-sky-700 dark:text-sky-300">Forwarded to Company</SelectItem>
      </SelectContent>
    </Select>
    {disabled && <Loader2 className="h-4 w-4 animate-spin text-indigo-500" aria-label="Updating status" />}
  </div>
}

function ApplicantRow({ applicant, disabled, selectedStatus, onStatusSelect }: { applicant: Applicant; disabled: boolean; selectedStatus: SelectableStatus | ''; onStatusSelect: (status: SelectableStatus) => void }) {
  const status = normalizeStatus(applicant.status)
  const resume = safeResumeUrl(applicant.resume || applicant.resume_url)
  return <tr>
    <td className="px-3 py-3 font-medium text-gray-900 dark:text-white">{applicant.name || 'Applicant'}</td><td className="px-3 py-3">{applicant.email || '—'}</td><td className="px-3 py-3">{applicant.phone || '—'}</td><td className="px-3 py-3">{applicant.institution || applicant.college || '—'}</td><td className="px-3 py-3">{applicant.shortlisted_batch_name || '—'}</td><td className="px-3 py-3">{applicant.applied_at ? new Date(applicant.applied_at).toLocaleDateString() : '—'}</td>
    <td className="px-3 py-3">{resume ? <a href={resume} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-300"><ExternalLink className="h-3.5 w-3.5" />View Resume</a> : <span className="text-gray-400">Resume not uploaded</span>}</td><td className="px-3 py-3"><StatusBadge status={status} /></td><td className="px-3 py-3"><ApplicantStatusSelect selectedStatus={selectedStatus} disabled={disabled || !applicant.application_id} onStatusSelect={onStatusSelect} /></td>
  </tr>
}

function ApplicantCard({ applicant, disabled, selectedStatus, onStatusSelect }: { applicant: Applicant; disabled: boolean; selectedStatus: SelectableStatus | ''; onStatusSelect: (status: SelectableStatus) => void }) {
  const status = normalizeStatus(applicant.status)
  const resume = safeResumeUrl(applicant.resume || applicant.resume_url)
  return <article className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-white/10">
    <div className="flex items-start justify-between gap-2"><div><h3 className="font-semibold text-gray-900 dark:text-white">{applicant.name || 'Applicant'}</h3><p className="break-all text-sm text-gray-500">{applicant.email || '—'}</p></div><StatusBadge status={status} /></div>
    <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm"><div><dt className="text-xs text-gray-400">Phone</dt><dd>{applicant.phone || '—'}</dd></div><div><dt className="text-xs text-gray-400">College / Institution</dt><dd>{applicant.institution || applicant.college || '—'}</dd></div><div><dt className="text-xs text-gray-400">Cohort</dt><dd>{applicant.shortlisted_batch_name || '—'}</dd></div><div><dt className="text-xs text-gray-400">Applied</dt><dd>{applicant.applied_at ? new Date(applicant.applied_at).toLocaleDateString() : '—'}</dd></div></dl>
    {resume ? <a href={resume} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-300"><ExternalLink className="h-4 w-4" />View Resume</a> : <p className="text-sm text-gray-400">Resume not uploaded</p>}
    <div><p className="mb-1 text-xs font-medium text-gray-500">Update Application Status</p><ApplicantStatusSelect selectedStatus={selectedStatus} disabled={disabled || !applicant.application_id} onStatusSelect={onStatusSelect} /></div>
  </article>
}
