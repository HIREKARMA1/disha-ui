"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { contestEventService } from '@/services/contestEventService'
import type { ContestEventAnalytics } from '@/types/contestEvent'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, Eye, Users, UserCheck, Award, TrendingDown } from 'lucide-react'

interface PageProps {
  params: { id: string }
}

export default function EventAnalyticsPage({ params }: PageProps) {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<ContestEventAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    contestEventService.getAnalytics(params.id)
      .then(setAnalytics)
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false))
  }, [params.id])

  const stats = [
    { label: 'Total Views', value: analytics?.total_views ?? 0, icon: Eye, color: 'text-blue-600' },
    { label: 'Unique Visitors', value: analytics?.unique_visitors ?? 0, icon: Users, color: 'text-purple-600' },
    { label: 'Registrations', value: analytics?.registrations ?? 0, icon: UserCheck, color: 'text-green-600' },
    { label: 'Dropouts', value: analytics?.dropouts ?? 0, icon: TrendingDown, color: 'text-orange-600' },
    { label: 'Completed', value: analytics?.completed ?? 0, icon: UserCheck, color: 'text-teal-600' },
    { label: 'Certificates Issued', value: analytics?.certificates_issued ?? 0, icon: Award, color: 'text-yellow-600' },
  ]

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Event Analytics</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
        ) : !analytics ? (
          <p className="text-gray-500">Failed to load analytics</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {stats.map(({ label, value, icon: Icon, color }) => (
                <Card key={label}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {analytics.daily_registrations.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Daily Traffic</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.daily_registrations.map((d) => (
                      <div key={d.date} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <span className="text-gray-600 dark:text-gray-400">{d.date}</span>
                        <div className="flex gap-4">
                          <span>{d.views} views</span>
                          <span className="text-green-600">{d.registrations} registrations</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Top Universities', data: analytics.top_universities },
                { title: 'Top Branches', data: analytics.top_branches },
                { title: 'Top Locations', data: analytics.top_locations },
              ].map(({ title, data }) => (
                <Card key={title}>
                  <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
                  <CardContent>
                    {data.length === 0 ? (
                      <p className="text-sm text-gray-500">No data yet</p>
                    ) : (
                      <div className="space-y-2">
                        {data.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300 truncate">{item.name}</span>
                            <span className="font-medium text-gray-900 dark:text-white ml-2">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminDashboardLayout>
  )
}
