'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  BarChart3,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  PieChart,
  School,
  Users,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { campusDriveService, apiErrorMessage } from '@/services/campusDriveService'
import type { CampusDriveStatistics as CampusDriveStatisticsData } from '@/types/campusDrive'
import { CATEGORY_LABELS } from '@/types/contestEvent'

const TIME_RANGE_MONTHS: Record<string, number> = {
  '1month': 1,
  '3months': 3,
  '6months': 6,
  '1year': 12,
}

const statusLabels: Record<string, string> = {
  published: 'Published',
  draft: 'Draft',
}

export function CampusDriveStatistics() {
  const [stats, setStats] = useState<CampusDriveStatisticsData | null>(null)
  const [timeRange, setTimeRange] = useState('6months')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const months = TIME_RANGE_MONTHS[timeRange] ?? 6
    setLoading(true)
    setError(null)
    campusDriveService
      .getStatistics(months)
      .then(setStats)
      .catch((err) => {
        setStats(null)
        setError(apiErrorMessage(err, 'Failed to load campus drive statistics'))
      })
      .finally(() => setLoading(false))
  }, [timeRange])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (error || !stats) {
    return <p className="text-gray-500">{error || 'Failed to load statistics'}</p>
  }

  const categoryTotal = Object.values(stats.drives_by_category).reduce((sum, value) => sum + value, 0) || 1
  const statusTotal = Object.values(stats.drives_by_publication_status).reduce((sum, value) => sum + value, 0) || 1

  const statCards = [
    {
      title: 'Total Campus Drives',
      value: stats.total_campus_drives,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Published',
      value: stats.published_count,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Upcoming',
      value: stats.upcoming_count,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Completed',
      value: stats.completed_count,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      title: 'Selected Jobs',
      value: stats.total_jobs,
      icon: Briefcase,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    },
    {
      title: 'University Assignments',
      value: stats.total_university_assignments,
      icon: School,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
    {
      title: 'Interest Requests',
      value: stats.total_interest_requests,
      icon: Users,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    },
    {
      title: 'Drafts',
      value: stats.draft_count,
      icon: BarChart3,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campus Drive Statistics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Platform analytics for campus drive programs, jobs, and assignments
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/dashboard/admin/campus-drives">
            <Button variant="outline" size="sm">All Campus Drives</Button>
          </Link>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value.toLocaleString()}</p>
                </div>
                <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary-600" />
              <span>Drives by Category</span>
            </CardTitle>
            <CardDescription>New drives created in the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.drives_by_category).length === 0 ? (
              <p className="text-sm text-gray-500">No data yet</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(stats.drives_by_category).map(([type, count]) => {
                  const percentage = Math.round((count / categoryTotal) * 100)
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{CATEGORY_LABELS[type] || type}</Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{count} drives</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 rounded-full bg-gray-200 dark:bg-gray-700">
                          <div className="h-2 rounded-full bg-primary-500" style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="w-8 text-sm font-medium text-gray-900 dark:text-white">{percentage}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary-600" />
              <span>Drives by Status</span>
            </CardTitle>
            <CardDescription>Publication status for drives created in the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.drives_by_publication_status).length === 0 ? (
              <p className="text-sm text-gray-500">No data yet</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(stats.drives_by_publication_status).map(([status, count]) => {
                  const percentage = Math.round((count / statusTotal) * 100)
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{statusLabels[status] || status}</Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{count} drives</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 rounded-full bg-gray-200 dark:bg-gray-700">
                          <div className="h-2 rounded-full bg-primary-500" style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="w-8 text-sm font-medium text-gray-900 dark:text-white">{percentage}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Creation Trend</CardTitle>
            <CardDescription>Campus drives created per month in the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.creation_trends.length === 0 ? (
              <p className="text-sm text-gray-500">No data yet</p>
            ) : (
              <div className="space-y-2">
                {stats.creation_trends.map((row) => (
                  <div
                    key={row.month}
                    className="flex items-center justify-between border-b border-gray-100 py-2 text-sm last:border-0 dark:border-gray-700"
                  >
                    <span className="text-gray-600 dark:text-gray-400">{row.month}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{row.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Campus Drives</CardTitle>
            <CardDescription>Most jobs selected among drives created in the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.top_drives.length === 0 ? (
              <p className="text-sm text-gray-500">No data yet</p>
            ) : (
              <div className="space-y-2">
                {stats.top_drives.map((drive) => (
                  <div key={drive.id} className="flex items-center justify-between gap-3 text-sm">
                    <Link
                      href={`/dashboard/admin/campus-drives/${drive.id}/analytics`}
                      className="truncate text-primary-600 hover:underline"
                    >
                      {drive.title}
                    </Link>
                    <span className="font-medium text-gray-900 dark:text-white">{drive.job_count} jobs</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
