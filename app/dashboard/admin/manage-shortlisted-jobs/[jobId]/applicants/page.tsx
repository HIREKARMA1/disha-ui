"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Briefcase, Building2, Download, ExternalLink, Loader2, Search, Users } from 'lucide-react'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'react-hot-toast'

type Status = 'selected' | 'rejected' | 'shortlisted' | 'forwarded_to_company'
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
  applicant_source?: string
  shortlisted_batch_id?: string | null
  shortlisted_batch_name?: string | null
  applied_at?: string | null
}
type Job = {
  id: string
  title: string
  company: string
  location: string
  employmentType: string
  batches: Array<{ id: string; name: string }>
}

const LIST_URL = '/dashboard/admin/manage-shortlisted-jobs'
const normalizeStatus = (status?: string) => (status || 'applied').toLowerCase().replace(/ /g, '_')
const statusLabel = (status?: string) => {
  const normalized = normalizeStatus(status)
  return normalized === 'forwarded_to_company' ? 'Forwarded to Company' : normalized.charAt(0).toUpperCase() + normalized.slice(1)
}
const safeResumeUrl = (value?: string | null) => {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch { return null }
}

export default function ShortlistedApplicantsPage() {
  const params = useParams<{ jobId: string }>()
  const jobId = Array.isArray(params.jobId) ? params.jobId[0] : params.jobId
  const [job, setJob] = useState<Job | null>(null)
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [cohort, setCohort] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pending, setPending] = useState<{ applicant: Applicant; status: Status } | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const inFlight = useRef(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true); setError('')
      try {
        const allResponse = await apiClient.getAllJobsAdmin()
        const allJobs = Array.isArray(allResponse) ? allResponse : allResponse?.jobs || []
        const selected = allJobs.find((item: any) => String(item.id) === String(jobId))
        if (!selected) throw new Error('Job not found or you do not have access to it.')
        const batches = await apiClient.getAssignedShortlistedBatchesAdmin(jobId)
        if (!Array.isArray(batches) || batches.length === 0) throw new Error('This job is not assigned to any Shortlisted cohort.')
        const response = await apiClient.getAppliedStudentsAdmin(jobId)
        const records = (Array.isArray(response) ? response : []).filter((item: Applicant) => item.applicant_source === 'shortlisted') as Applicant[]
        const unique = new Map<string, Applicant>()
        for (const applicant of records) {
          const key = String(applicant.application_id || applicant.id)
          if (!unique.has(key)) unique.set(key, applicant)
        }
        if (!cancelled) {
          setJob({
            id: String(selected.id), title: selected.title || 'Untitled job',
            company: selected.company_name || selected.corporate_name || 'Company not specified',
            location: Array.isArray(selected.location) ? selected.location.join(', ') : selected.location || 'Location not specified',
            employmentType: selected.job_type || selected.employment_type || 'Employment type not specified',
            batches: batches.map((batch: any) => ({ id: String(batch.id), name: batch.name || 'Unnamed cohort' })),
          })
          setApplicants(Array.from(unique.values()))
        }
      } catch (err: any) {
        if (!cancelled) { setError(err?.response?.data?.detail || err?.message || 'Could not load applicants. Please try again.'); setJob(null); setApplicants([]) }
      } finally { if (!cancelled) setLoading(false) }
    }
    if (jobId) void load()
    return () => { cancelled = true }
  }, [jobId])

  const counts = useMemo(() => {
    const count = (status: string) => applicants.filter((a) => normalizeStatus(a.status) === status).length
    return { total: applicants.length, applied: count('applied') + count('pending'), shortlisted: count('shortlisted'), selected: count('selected'), rejected: count('rejected'), forwarded: count('forwarded_to_company') }
  }, [applicants])

  const cohorts = useMemo(() => job?.batches || [], [job])
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return applicants.filter((a) => {
      const matchesQuery = !query || [a.name, a.email].some((value) => value?.toLowerCase().includes(query))
      const matchesCohort = cohort === 'all' || String(a.shortlisted_batch_id || a.shortlisted_batch_name) === cohort
      const normalizedStatus = normalizeStatus(a.status)
      const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter || (statusFilter === 'applied' && normalizedStatus === 'pending')
      return matchesQuery && matchesCohort && matchesStatus
    })
  }, [applicants, search, cohort, statusFilter])

  const confirmStatusChange = useCallback(async () => {
    if (!job || !pending || inFlight.current) return
    const applicationId = pending.applicant.application_id
    if (!applicationId) { toast.error('Application ID is missing.'); return }
    inFlight.current = true
    try {
      setSavingId(applicationId)
      const response = await apiClient.updateShortlistedApplicationStatus(job.id, applicationId, pending.status)
      const updatedStatus = response?.status || pending.status
      setApplicants((current) => current.map((a) => a.application_id === applicationId ? { ...a, status: updatedStatus } : a))
      toast.success(`Candidate status updated to ${statusLabel(updatedStatus)}.`)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Could not update this application. Please try again.')
    } finally { inFlight.current = false; setSavingId(null); setPending(null) }
  }, [job, pending])

  return <AdminDashboardLayout><div className="mx-auto max-w-[1600px] space-y-6">
    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500"><Link href={LIST_URL} className="hover:text-indigo-600">Manage Shortlisted Jobs</Link><span>/</span><span className="text-gray-900 dark:text-white">Applicants</span></div>
    <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div className="flex items-start gap-4"><div className="rounded-xl bg-indigo-100 p-3 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"><Briefcase className="h-6 w-6" /></div><div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">{job?.title || 'Applicants'}</h1><p className="mt-1 flex flex-wrap items-center gap-1 text-sm text-gray-600 dark:text-gray-400"><Building2 className="h-4 w-4" />{job?.company} · {job?.location} · {job?.employmentType}</p><div className="mt-3 flex flex-wrap gap-2">{job?.batches.map((b) => <span key={b.id} className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">{b.name}</span>)}</div></div></div><Button asChild variant="outline"><Link href={LIST_URL}><ArrowLeft className="mr-2 h-4 w-4" />Back to Manage Shortlisted Jobs</Link></Button></div>
    </header>
    {loading ? <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-20 dark:border-white/10 dark:bg-gray-900"><Loader2 className="h-7 w-7 animate-spin text-indigo-500" /><span className="ml-3 text-sm text-gray-500">Loading applicants…</span></div> : error ? <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">{error}</div> : <>
      <section aria-label="Application summary" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">{[
        ['Total Applicants', counts.total], ['Applied', counts.applied], ['Shortlisted', counts.shortlisted], ['Selected', counts.selected], ['Rejected', counts.rejected], ['Forwarded to Company', counts.forwarded],
      ].map(([label, value]) => <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-gray-900"><p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p></div>)}</section>
      <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900">
        <div className="grid gap-3 md:grid-cols-3"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><Input className="pl-9" placeholder="Search name or email" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <Select value={cohort} onValueChange={setCohort}><SelectTrigger aria-label="Filter by cohort"><SelectValue placeholder="All cohorts" /></SelectTrigger><SelectContent className="z-[120]"><SelectItem value="all">All cohorts</SelectItem>{cohorts.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger aria-label="Filter by application status"><SelectValue placeholder="All statuses" /></SelectTrigger><SelectContent className="z-[120]"><SelectItem value="all">All statuses</SelectItem><SelectItem value="applied">Applied</SelectItem><SelectItem value="shortlisted">Shortlisted</SelectItem><SelectItem value="selected">Selected</SelectItem><SelectItem value="rejected">Rejected</SelectItem><SelectItem value="forwarded_to_company">Forwarded to Company</SelectItem></SelectContent></Select></div>
        {filtered.length ? <><div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10"><table className="w-full min-w-[1450px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-white/[0.03]"><tr>{['Student Name', 'Email', 'Phone Number', 'College / Institution', 'Cohort', 'Applied Date', 'Resume', 'Current Status', 'Update Application Status'].map((label) => <th key={label} className="px-3 py-3">{label}</th>)}</tr></thead><tbody className="divide-y divide-gray-100 dark:divide-white/5">{filtered.map((a, i) => <ApplicantRow key={a.application_id || a.id || i} applicant={a} disabled={savingId === a.application_id} onStatusSelect={(status) => setPending({ applicant: a, status })} />)}</tbody></table></div><p className="text-xs text-gray-500">Showing {filtered.length} of {applicants.length} applicants</p></> : <div className="py-12 text-center"><Users className="mx-auto h-9 w-9 text-gray-400" /><p className="mt-2 font-medium text-gray-700 dark:text-gray-200">{applicants.length ? 'No applicants match these filters' : 'No Shortlisted applicants yet'}</p></div>}
      </section>
    </>}
    {pending && <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 p-4" role="alertdialog" aria-modal="true" aria-labelledby="status-confirm-title"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"><h2 id="status-confirm-title" className="text-lg font-semibold text-gray-900 dark:text-white">Confirm status change</h2><p className="mt-3 text-sm text-gray-600 dark:text-gray-300">Change {pending.applicant.name || 'this candidate'}’s application status from {statusLabel(pending.applicant.status)} to {statusLabel(pending.status)}?</p><div className="mt-6 flex justify-end gap-3"><Button variant="outline" disabled={Boolean(savingId)} onClick={() => setPending(null)}>Cancel</Button><Button disabled={Boolean(savingId)} onClick={confirmStatusChange}>{savingId ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : 'Confirm'}</Button></div></div></div>}
  </div></AdminDashboardLayout>
}

function StatusBadge({ status }: { status: string }) {
  const tones: Record<string, string> = { applied: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300', shortlisted: 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300', selected: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300', rejected: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300', forwarded_to_company: 'bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300' }
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${tones[status] || 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300'}`}>{statusLabel(status)}</span>
}

function ApplicantRow({ applicant, disabled, onStatusSelect }: { applicant: Applicant; disabled: boolean; onStatusSelect: (status: Status) => void }) {
  const resume = safeResumeUrl(applicant.resume || applicant.resume_url)
  return <tr><td className="px-3 py-3 font-medium text-gray-900 dark:text-white">{applicant.name || 'Applicant'}</td><td className="px-3 py-3">{applicant.email || '—'}</td><td className="px-3 py-3">{applicant.phone || '—'}</td><td className="px-3 py-3">{applicant.institution || applicant.college || '—'}</td><td className="px-3 py-3">{applicant.shortlisted_batch_name || '—'}</td><td className="px-3 py-3">{applicant.applied_at ? new Date(applicant.applied_at).toLocaleDateString() : '—'}</td>
    <td className="px-3 py-3">{resume ? <div className="flex gap-3"><a href={resume} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-300"><ExternalLink className="h-3.5 w-3.5" />View</a><a href={resume} download className="inline-flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-300"><Download className="h-3.5 w-3.5" />Download</a></div> : <span className="text-gray-400">Resume not uploaded.</span>}</td><td className="px-3 py-3"><StatusBadge status={normalizeStatus(applicant.status)} /></td><td className="px-3 py-3"><div className="flex min-w-[200px] items-center gap-2"><Select value={['selected', 'rejected', 'shortlisted', 'forwarded_to_company'].includes(normalizeStatus(applicant.status)) ? normalizeStatus(applicant.status) : ''} onValueChange={(value) => { if (value !== normalizeStatus(applicant.status)) onStatusSelect(value as Status) }} disabled={disabled || !applicant.application_id}><SelectTrigger aria-label="Update Application Status" className="h-9"><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent className="z-[120] min-w-[230px]"><SelectItem value="selected">Selected</SelectItem><SelectItem value="rejected">Rejected</SelectItem><SelectItem value="shortlisted">Shortlisted</SelectItem><SelectItem value="forwarded_to_company">Forwarded to Company</SelectItem></SelectContent></Select>{disabled && <Loader2 className="h-4 w-4 animate-spin text-indigo-500" aria-label="Updating status" />}</div></td></tr>
}
