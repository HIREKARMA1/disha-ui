'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Briefcase,
  Building2,
  Clock,
  CheckCircle,
  Eye,
  Calendar,
  FileText,
  Inbox,
  ArrowRight,
} from 'lucide-react'
import { StudentSectionCard } from '@/components/student/ui/StudentSectionCard'
import { StatusBadge } from '@/components/student/ui/StatusBadge'
import { apiClient } from '@/lib/api'
import { cn } from '@/lib/utils'

interface Activity {
  id: string
  title: string
  company: string
  time: string
  status: string
  icon: 'apply' | 'view' | 'interview' | 'assessment' | 'resume'
}

const iconMap = {
  apply: { Icon: Briefcase, bg: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-900' },
  view: { Icon: Eye, bg: 'bg-primary-50 text-primary-600 ring-1 ring-primary-100 dark:bg-primary-950/40 dark:text-primary-400 dark:ring-primary-900' },
  interview: { Icon: Calendar, bg: 'bg-violet-50 text-violet-600 ring-1 ring-violet-100 dark:bg-violet-950/40 dark:text-violet-400 dark:ring-violet-900' },
  assessment: { Icon: CheckCircle, bg: 'bg-amber-50 text-amber-600 ring-1 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-900' },
  resume: { Icon: FileText, bg: 'bg-sky-50 text-sky-600 ring-1 ring-sky-100 dark:bg-sky-950/40 dark:text-sky-400 dark:ring-sky-900' },
}

function relativeTime(dateString?: string) {
  if (!dateString) return ''
  try {
    const diff = Date.now() - new Date(dateString).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${Math.max(mins, 1)}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  } catch {
    return ''
  }
}

function mapApplicationToActivity(app: any): Activity {
  const status = (app.status || 'applied').toLowerCase()
  const title = app.job_title || 'Job'
  const company = app.corporate_name || app.company_name || 'Company'
  const time = relativeTime(app.updated_at || app.applied_at)

  if (status === 'shortlisted') {
    return {
      id: app.id,
      title: `Interview shortlisted — ${title}`,
      company,
      time,
      status: 'shortlisted',
      icon: 'interview',
    }
  }
  if (status === 'selected') {
    return {
      id: app.id,
      title: `Selected for ${title}`,
      company,
      time,
      status: 'selected',
      icon: 'assessment',
    }
  }
  if (status === 'rejected') {
    return {
      id: app.id,
      title: `Update on ${title}`,
      company,
      time,
      status: 'rejected',
      icon: 'view',
    }
  }
  return {
    id: app.id,
    title: `Applied for ${title}`,
    company,
    time,
    status: status || 'applied',
    icon: 'apply',
  }
}

export function RecentActivities({ className = '' }: { className?: string }) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const [appsRes, profile] = await Promise.all([
          apiClient.getStudentApplications({
            sort_by: 'updated_at',
            sort_order: 'desc',
            page: 1,
            limit: 8,
          }).catch(() => null),
          apiClient.getStudentProfile().catch(() => null),
        ])

        const apps = (appsRes?.applications || appsRes?.items || []) as any[]
        const mapped = apps.map(mapApplicationToActivity)

        if (profile?.updated_at || profile?.resume) {
          const resumeTime = profile.updated_at
          const age = resumeTime ? Date.now() - new Date(resumeTime).getTime() : Infinity
          if (age < 1000 * 60 * 60 * 24 * 30) {
            mapped.unshift({
              id: `resume-${profile.id || 'me'}`,
              title: 'Resume Updated',
              company: 'Your profile',
              time: relativeTime(resumeTime),
              status: 'under_review',
              icon: 'resume',
            })
          }
        }

        if (!cancelled) setActivities(mapped.slice(0, 6))
      } catch {
        if (!cancelled) setActivities([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <StudentSectionCard className={cn('relative', className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-gray-900 dark:text-white sm:text-[22px]">
          <span className="h-5 w-1 shrink-0 rounded-sm bg-primary-500 sm:h-6" aria-hidden />
          Recent Activity
        </h2>
        <Link
          href="/dashboard/student/applications"
          className={cn(
            'group inline-flex shrink-0 items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5',
            'text-xs font-semibold text-primary-700 shadow-sm transition-colors sm:text-sm',
            'hover:border-primary-400 hover:bg-primary-100',
            'dark:border-primary-800 dark:bg-primary-950/50 dark:text-primary-300 dark:hover:bg-primary-900/60'
          )}
        >
          <span>View All</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white transition-transform group-hover:translate-x-0.5">
            <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
          </span>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
            <Inbox className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">No recent activity</p>
          <p className="mt-1 max-w-[220px] text-xs text-gray-500">
            Apply to jobs or update your profile to see activity here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => {
            const { Icon, bg } = iconMap[activity.icon]
            return (
              <div
                key={activity.id}
                className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50/80 px-2.5 py-2.5 dark:border-gray-700 dark:bg-gray-800/50"
              >
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', bg)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="flex items-center gap-1 truncate text-[11px] text-gray-500 dark:text-gray-400">
                    <Building2 className="h-3 w-3 shrink-0" />
                    {activity.company}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <StatusBadge status={activity.status} />
                  {activity.time && (
                    <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                      <Clock className="h-2.5 w-2.5" />
                      {activity.time}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </StudentSectionCard>
  )
}
