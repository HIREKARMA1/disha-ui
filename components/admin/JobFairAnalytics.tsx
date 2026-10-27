"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BarChart3, Briefcase, Users } from 'lucide-react'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'

type Candidate = { id: string; name: string; email: string; phone?: string | null; institution?: string | null; graduation_year?: number | null; status: string; registered_at?: string; applied_at?: string }
type ManualJobAnalytics = { id: string; title: string; company_name: string; application_count: number; applications: Candidate[] }
type Analytics = { job_fair: { id: string; title: string; slug: string }; registration_count: number; registrations: Candidate[]; manual_jobs: ManualJobAnalytics[] }

function formatDate(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

function CandidateTable({ rows, dateKey, empty }: { rows: Candidate[]; dateKey: 'registered_at' | 'applied_at'; empty: string }) {
  if (!rows.length) return <p className="rounded-lg bg-gray-50 p-5 text-sm text-gray-500">{empty}</p>
  return <div className="overflow-x-auto rounded-lg border"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-4 py-3">Candidate</th><th className="px-4 py-3">Email / phone</th><th className="px-4 py-3">Institution</th><th className="px-4 py-3">Year</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th></tr></thead><tbody className="divide-y">{rows.map(row => <tr key={row.id}><td className="px-4 py-3 font-medium text-gray-900">{row.name}</td><td className="px-4 py-3 text-gray-600">{row.email}<br/>{row.phone || '—'}</td><td className="px-4 py-3 text-gray-600">{row.institution || '—'}</td><td className="px-4 py-3 text-gray-600">{row.graduation_year || '—'}</td><td className="px-4 py-3 capitalize text-gray-600">{row.status}</td><td className="px-4 py-3 text-gray-600">{formatDate(row[dateKey])}</td></tr>)}</tbody></table></div>
}

export function JobFairAnalytics({ fairId }: { fairId: string }) {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    apiClient.client.get(`/job-fairs/admin/${encodeURIComponent(fairId)}/analytics`)
      .then(({ data: result }) => { if (active) setData(result) })
      .catch(() => { if (active) toast.error('Could not load Job Fair analytics') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [fairId])

  return <AdminDashboardLayout><main className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
    <Link href="/dashboard/admin/job-fairs" className="inline-flex items-center gap-2 text-sm text-gray-600"><ArrowLeft className="h-4 w-4"/>All Job Fairs</Link>
    <header><p className="text-xs font-semibold uppercase tracking-[.18em] text-primary-600">Job Fair analytics</p><h1 className="mt-1 text-2xl font-bold">{data?.job_fair.title || (loading ? 'Loading analytics…' : 'Analytics')}</h1><p className="text-sm text-gray-500">Candidate registrations and applications for each manually created job.</p></header>
    {loading ? <div className="rounded-xl border bg-white p-8 text-sm text-gray-500">Loading analytics…</div> : data && <>
      <section className="grid gap-4 sm:grid-cols-2"><article className="flex items-center justify-between rounded-xl border bg-white p-5 shadow-sm"><div><p className="text-sm text-gray-500">Job Fair registrations</p><p className="mt-1 text-3xl font-bold">{data.registration_count}</p></div><Users className="h-8 w-8 text-primary-600"/></article><article className="flex items-center justify-between rounded-xl border bg-white p-5 shadow-sm"><div><p className="text-sm text-gray-500">Manual job applications</p><p className="mt-1 text-3xl font-bold">{data.manual_jobs.reduce((sum, job) => sum + job.application_count, 0)}</p></div><Briefcase className="h-8 w-8 text-primary-600"/></article></section>
      <section className="space-y-3 rounded-xl border bg-white p-5"><div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary-600"/><h2 className="text-lg font-semibold">Registered candidates</h2></div><CandidateTable rows={data.registrations} dateKey="registered_at" empty="No candidates have registered for this Job Fair yet."/></section>
      <section className="space-y-4"><div className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary-600"/><h2 className="text-lg font-semibold">Manual job applicants</h2></div>{data.manual_jobs.length ? data.manual_jobs.map(job => <article key={job.id} className="space-y-3 rounded-xl border bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-semibold">{job.title}</h3><p className="text-sm text-gray-500">{job.company_name}</p></div><span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-700">{job.application_count} {job.application_count === 1 ? 'applicant' : 'applicants'}</span></div><CandidateTable rows={job.applications} dateKey="applied_at" empty="No applications for this job yet."/></article>) : <p className="rounded-xl border bg-white p-6 text-sm text-gray-500">No manually created jobs are attached to this fair.</p>}</section>
    </>}
    {!loading && !data && <div className="rounded-xl border bg-white p-8 text-sm text-gray-500">Analytics are unavailable. Return to the Job Fair list and try again.</div>}
    <Link href="/dashboard/admin/job-fairs"><Button variant="outline">Back to Job Fairs</Button></Link>
  </main></AdminDashboardLayout>
}
