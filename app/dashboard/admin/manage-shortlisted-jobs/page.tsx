"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Briefcase, Building2, Search, Loader2, AlertCircle, Eye } from 'lucide-react'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
export default function ManageShortlistedJobsPage() {
  const [jobs, setJobs] = useState<ManagedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
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
                    <td className="px-5 py-4"><Button asChild size="sm" variant="outline"><Link href={`/dashboard/admin/manage-shortlisted-jobs/${encodeURIComponent(job.id)}/applicants`}><Eye className="mr-2 h-4 w-4" />View Applicants</Link></Button></td>
                  </tr>
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </AdminDashboardLayout>
  )
}
