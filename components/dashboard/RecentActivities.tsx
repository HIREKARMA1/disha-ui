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
  apply: { Icon: Briefcase, bg: 'bg-emerald-500/15 text-emerald-500' },
  view: { Icon: Eye, bg: 'bg-blue-500/15 text-blue-500' },
  interview: { Icon: Calendar, bg: 'bg-violet-500/15 text-violet-500' },
  assessment: { Icon: CheckCircle, bg: 'bg-amber-500/15 text-amber-500' },
  resume: { Icon: FileText, bg: 'bg-sky-500/15 text-sky-500' },
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

        // Resume updated — if profile was updated recently
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
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h2>
        <Link
          href="/dashboard/student/applications"
          className="text-xs sm:text-sm font-semibold text-blue-500 hover:text-blue-400"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
            <Inbox className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">No recent activity</p>
          <p className="text-xs text-gray-500 mt-1 max-w-[220px]">
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
                className="flex items-center gap-2.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-white/[0.03] px-2.5 py-2"
              >
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', bg)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {activity.title}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
                    <Building2 className="w-3 h-3 shrink-0" />
                    {activity.company}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  <StatusBadge status={activity.status} />
                  {activity.time && (
                    <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
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
