'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { EXECUTIVE_MODULES, executiveHasModule, executivePathForAdminPath } from '@/lib/executiveModules'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'

export default function ExecutiveDashboardPage() {
  const { user } = useAuth()
  const modules = EXECUTIVE_MODULES.filter(({ key }) => executiveHasModule(user, key))

  return (
    <AdminDashboardLayout>
      <section className="mx-auto max-w-6xl space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Executive</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">Your workspace</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Open an assigned module to continue.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map(({ key, label, href }) => (
            <Link key={key} href={executivePathForAdminPath(href)} className="rounded-xl border border-gray-200 bg-white p-5 font-semibold text-gray-900 shadow-sm transition hover:border-blue-400 hover:shadow dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              {label}<span className="ml-2 text-blue-600" aria-hidden>→</span>
            </Link>
          ))}
        </div>
        {!modules.length && <p className="rounded-lg border border-gray-200 p-4 text-gray-600 dark:border-gray-700 dark:text-gray-300">No modules are assigned yet. Ask an Admin to update your permissions.</p>}
      </section>
    </AdminDashboardLayout>
  )
}
