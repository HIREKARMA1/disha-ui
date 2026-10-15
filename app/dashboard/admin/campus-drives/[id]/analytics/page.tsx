'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { RegisteredUsersAnalytics } from '@/components/admin/RegisteredUsersAnalytics'
import { CampusDriveAnalyticsUnsupportedFeedback } from '@/components/admin/CampusDriveAnalyticsUnsupportedFeedback'
import { CampusDriveAnalyticsUnsupportedAttendance } from '@/components/admin/CampusDriveAnalyticsUnsupportedAttendance'
import { campusDriveService, apiErrorMessage } from '@/services/campusDriveService'
import type { CampusDriveAnalytics } from '@/types/campusDrive'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, Eye, Users, UserCheck, Award, TrendingDown } from 'lucide-react'

function MetricValue({ supported, value }: { supported: boolean; value?: number | null }) {
  if (!supported) {
    return <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Not tracked</p>
  }
  return (
    <p className="text-2xl font-bold text-gray-900 dark:text-white">
      {(value ?? 0).toLocaleString()}
    </p>
  )
}

export default function CampusDriveAnalyticsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<CampusDriveAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    campusDriveService
      .getAnalytics(params.id)
      .then(setAnalytics)
      .catch((err) => {
        setAnalytics(null)
        setError(apiErrorMessage(err, 'Failed to load analytics'))
      })
      .finally(() => setLoading(false))
  }, [params.id])

  const availability = analytics?.availability

  const stats = analytics
    ? [
        {
          label: 'Total Views',
          supported: availability?.total_views ?? false,
          value: analytics.total_views,
          icon: Eye,
          color: 'text-blue-600',
          hint: 'Page view tracking is not implemented for campus drive public pages.',
        },
        {
          label: 'Unique Visitors',
          supported: availability?.unique_visitors ?? false,
          value: analytics.unique_visitors,
          icon: Users,
          color: 'text-purple-600',
          hint: 'Unique visitor tracking is not implemented for campus drives.',
        },
        {
          label: 'Registrations',
          supported: availability?.registrations ?? true,
          value: analytics.registrations,
          icon: UserCheck,
          color: 'text-green-600',
          hint: 'Students who registered for this campus drive program (one row per student).',
        },
        {
          label: 'Dropouts',
          supported: availability?.dropouts ?? true,
          value: analytics.dropouts,
          icon: TrendingDown,
          color: 'text-orange-600',
          hint: 'Rejected or withdrawn job applications for selected jobs.',
        },
        {
          label: 'Completed',
          supported: availability?.completed ?? true,
          value: analytics.completed,
          icon: UserCheck,
          color: 'text-teal-600',
          hint: 'Applications marked selected for jobs in this campus drive.',
        },
        {
          label: 'Certificates Issued',
          supported: availability?.certificates_issued ?? false,
          value: analytics.certificates_issued,
          icon: Award,
          color: 'text-yellow-600',
          hint: 'Event certificate issuance is not used for campus drives.',
        },
      ]
    : []

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campus Drive Analytics</h1>
            {analytics && (
              <p className="text-sm text-gray-500">
                {analytics.title} · {analytics.publication_status}
              </p>
            )}
          </div>
          <Link href={`/dashboard/admin/campus-drives/${params.id}/edit`}>
            <Button variant="outline" size="sm">Edit Campus Drive</Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : error || !analytics ? (
          <p className="text-gray-500">{error || 'Failed to load analytics'}</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {stats.map(({ label, supported, value, icon: Icon, color, hint }) => (
                <Card key={label} title={hint}>
                  <CardContent className="pt-6">
                    <div className="mb-2 flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${color}`} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                    </div>
                    <MetricValue supported={supported} value={value} />
                  </CardContent>
                </Card>
              ))}
            </div>

            {analytics.daily_registrations.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Daily Traffic</CardTitle>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Page views are not tracked for campus drives. Daily program registrations and interest requests are
                    shown below.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.daily_registrations.map((d) => (
                      <div
                        key={d.date}
                        className="flex items-center justify-between border-b border-gray-100 py-2 text-sm last:border-0 dark:border-gray-700"
                      >
                        <span className="text-gray-600 dark:text-gray-400">{d.date}</span>
                        <div className="flex flex-wrap gap-4">
                          {availability?.daily_page_views ? (
                            <span>{d.views ?? 0} views</span>
                          ) : null}
                          <span className="text-green-600">{d.registrations} registrations</span>
                          {typeof d.interest_requests === 'number' ? (
                            <span className="text-blue-600">{d.interest_requests} interest requests</span>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Daily Traffic</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">No daily registration or interest activity yet.</p>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { title: 'Top Universities', data: analytics.top_universities },
                { title: 'Top Branches', data: analytics.top_branches },
                { title: 'Top Locations', data: analytics.top_locations },
              ].map(({ title, data }) => (
                <Card key={title}>
                  <CardHeader>
                    <CardTitle className="text-base">{title}</CardTitle>
                    <p className="text-xs text-gray-500">Based on students registered for this campus drive</p>
                  </CardHeader>
                  <CardContent>
                    {data.length === 0 ? (
                      <p className="text-sm text-gray-500">No data yet</p>
                    ) : (
                      <div className="space-y-2">
                        {data.map((item, i) => (
                          <div key={`${item.name}-${i}`} className="flex justify-between text-sm">
                            <span className="truncate text-gray-700 dark:text-gray-300">{item.name}</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <RegisteredUsersAnalytics driveId={params.id} />

            <CampusDriveAnalyticsUnsupportedFeedback />

            <CampusDriveAnalyticsUnsupportedAttendance />
          </>
        )}
      </div>
    </AdminDashboardLayout>
  )
}
