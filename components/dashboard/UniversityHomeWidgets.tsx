'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import {
  Briefcase,
  Users,
  Layers,
  BarChart3,
  Settings,
  Clock,
  ChevronRight,
  Calendar,
  FileText,
} from 'lucide-react'
import { CorporateGlassCard } from '@/components/corporate/ui/CorporateGlassCard'
import { UniversityAnalyticsDashboardData } from '@/types/universityAnalytics'
import { apiClient } from '@/lib/api'
import { contestEventService } from '@/services/contestEventService'
import type { ContestEventListItem } from '@/types/contestEvent'
import { CONTEST_STATUS_LABELS } from '@/types/contestEvent'
import { AnalyticsTooltip } from '@/components/analytics/AnalyticsTooltip'
import { cn } from '@/lib/utils'

const BRANCH_COLORS = ['#3B82F6', '#34D399', '#A78BFA', '#FBBF24', '#2DD4BF']

const QUICK_ACTIONS = [
  { label: 'Students', href: '/dashboard/university/students', icon: Users, color: 'bg-blue-500/15 text-blue-500' },
  { label: 'Jobs', href: '/dashboard/university/jobs', icon: Briefcase, color: 'bg-emerald-500/15 text-emerald-500' },
  { label: 'Practice', href: '/dashboard/university/practice', icon: Layers, color: 'bg-violet-500/15 text-violet-500' },
  { label: 'Applications', href: '/dashboard/university/applications', icon: FileText, color: 'bg-orange-500/15 text-orange-500' },
  { label: 'Analytics', href: '/dashboard/university/analytics', icon: BarChart3, color: 'bg-teal-500/15 text-teal-500' },
  { label: 'Profile', href: '/dashboard/university/profile', icon: Settings, color: 'bg-gray-500/15 text-gray-400' },
]

function modeLabel(mode?: string) {
  if (!mode) return '—'
  if (mode === 'online') return 'Online'
  if (mode === 'hybrid') return 'Hybrid'
  if (mode === 'offline') return 'Offline'
  return mode.charAt(0).toUpperCase() + mode.slice(1)
}

function formatEventTime(event: ContestEventListItem) {
  if (!event.event_start_date) return null
  const start = new Date(event.event_start_date)
  if (Number.isNaN(start.getTime())) return null
  const startStr = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (!event.event_end_date) return startStr
  const end = new Date(event.event_end_date)
  if (Number.isNaN(end.getTime())) return startStr
  return `${startStr} - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
}

function statusLabel(status?: string) {
  if (!status) return 'Upcoming'
  return CONTEST_STATUS_LABELS[status] || status.charAt(0).toUpperCase() + status.slice(1)
}

function eventDateParts(iso?: string) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return {
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: d.toLocaleDateString('en-US', { day: '2-digit' }),
  }
}

interface UniversityHomeWidgetsProps {
  className?: string
}

export function UniversityHomeWidgets({ className = '' }: UniversityHomeWidgetsProps) {
  const [data, setData] = useState<UniversityAnalyticsDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState<ContestEventListItem[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [eventsError, setEventsError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const analytics = await apiClient.getUniversityAnalyticsDashboard().catch(() => null)
        setData(analytics)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setEventsLoading(true)
        setEventsError(null)
        const res = await contestEventService.getUpcomingEvents(5)
        const list = (res.events || []).filter((event) => {
          if (event.is_cancelled) return false
          if (event.contest_status === 'cancelled' || event.contest_status === 'archived') return false
          if (event.contest_status === 'closed' || event.contest_status === 'draft') return false
          if (event.is_published === false) return false
          return event.contest_status === 'upcoming' || event.contest_status === 'live'
        })
        setEvents(list.slice(0, 3))
      } catch {
        setEventsError('Unable to load events')
        setEvents([])
      } finally {
        setEventsLoading(false)
      }
    }
    loadEvents()
  }, [])

  const placementSegments = useMemo(() => data?.placement_status ?? [], [data])
  const totalPlaced = useMemo(
    () => placementSegments.reduce((sum, s) => sum + (s.count || 0), 0),
    [placementSegments]
  )

  const branchData = useMemo(() => {
    const branches = data?.branch_wise_placement ?? []
    const max = Math.max(...branches.map((b) => b.eligible_students || 0), 1)
    return branches.slice(0, 6).map((b) => ({
      ...b,
      widthPercent: Math.max(6, ((b.placed_students || 0) / max) * 100),
    }))
  }, [data])

  const topRecruiters = useMemo(() => {
    const companies = data?.top_recruiting_corporates ?? []
    const max = Math.max(...companies.map((c) => c.offers || 0), 1)
    return companies.slice(0, 5).map((c) => ({
      ...c,
      widthPercent: Math.max(6, ((c.offers || 0) / max) * 100),
    }))
  }, [data])

  const hiringVelocity = useMemo(() => data?.hiring_velocity ?? [], [data])

  const radarData = useMemo(
    () =>
      (data?.skill_performance ?? []).map((s) => ({
        subject: s.subject,
        score: s.average_score,
        fullMark: s.full_mark,
      })),
    [data]
  )

  const placementBlock = (
    <CorporateGlassCard
      title="Placement Status Breakdown"
      subtitle="Placed · Higher Studies · Unplaced · Opted Out"
      delay={0.05}
      className="max-md:!p-3"
      action={
        <Link
          href="/dashboard/university/analytics"
          className="text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5 flex-shrink-0"
        >
          View Full Report <ChevronRight className="w-3 h-3" />
        </Link>
      }
    >
      {isLoading ? (
        <div className="h-[120px] animate-pulse bg-gray-200 dark:bg-white/10 rounded-xl" />
      ) : placementSegments.length === 0 || totalPlaced === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
          Placement data will appear once students are registered.
        </p>
      ) : (
        <div className="flex flex-row items-center gap-3 min-w-0">
          <div className="relative w-[100px] h-[100px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={placementSegments}
                  cx="50%"
                  cy="50%"
                  innerRadius={32}
                  outerRadius={46}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="name"
                  stroke="none"
                >
                  {placementSegments.map((entry) => (
                    <Cell key={entry.key} fill={entry.color || '#3B82F6'} />
                  ))}
                </Pie>
                <Tooltip content={<AnalyticsTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-bold text-gray-900 dark:text-white tabular-nums leading-none">
                {totalPlaced || '—'}
              </span>
              <span className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">Total</span>
            </div>
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            {placementSegments.map((s) => (
              <div key={s.key} className="flex items-center justify-between text-[11px] gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-gray-600 dark:text-gray-300 truncate">{s.name}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white tabular-nums flex-shrink-0">
                  {s.percentage != null ? `${Math.round(s.percentage)}%` : s.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </CorporateGlassCard>
  )

  const branchBlock = (
    <CorporateGlassCard
      title="Branch Placement Analytics"
      subtitle="Eligible vs placed students by branch"
      delay={0.08}
      className="max-md:!p-3"
      action={
        <Link
          href="/dashboard/university/analytics"
          className="text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5 flex-shrink-0"
        >
          View Details <ChevronRight className="w-3 h-3" />
        </Link>
      }
    >
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 dark:bg-white/10 rounded" />
          ))}
        </div>
      ) : branchData.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center">No branch data yet.</p>
      ) : (
        <div className="space-y-2.5">
          {branchData.map((branch, i) => (
            <div key={branch.branch}>
              <div className="flex items-center justify-between text-[11px] mb-1 gap-1">
                <span className="font-medium text-gray-700 dark:text-gray-200 truncate">{branch.branch}</span>
                <span className="font-bold text-gray-900 dark:text-white tabular-nums flex-shrink-0">
                  {branch.placed_students}/{branch.eligible_students}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${branch.widthPercent}%` }}
                  transition={{ duration: 0.7, delay: 0.08 * i }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${BRANCH_COLORS[i % BRANCH_COLORS.length]}, ${BRANCH_COLORS[i % BRANCH_COLORS.length]}cc)`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </CorporateGlassCard>
  )

  const velocityBlock = (
    <CorporateGlassCard
      title="Hiring Velocity"
      subtitle="Weekly placements during placement season"
      delay={0.12}
      className="max-md:!p-3"
      action={
        <Link
          href="/dashboard/university/analytics"
          className="text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5 flex-shrink-0"
        >
          View Details <ChevronRight className="w-3 h-3" />
        </Link>
      }
    >
      {isLoading ? (
        <div className="h-[140px] animate-pulse bg-gray-200 dark:bg-white/10 rounded-xl" />
      ) : hiringVelocity.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 py-6 text-center">No velocity data yet.</p>
      ) : (
        <div className="h-[110px] md:h-[220px] -mx-0.5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hiringVelocity} margin={{ top: 2, right: 2, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="uniVelocityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 8, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 8, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={24} />
              <Tooltip content={<AnalyticsTooltip />} />
              <Area
                type="monotone"
                dataKey="placements"
                stroke="#34D399"
                strokeWidth={2}
                fill="url(#uniVelocityFill)"
                dot={{ r: 2.5, fill: '#34D399', strokeWidth: 0 }}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </CorporateGlassCard>
  )

  const recruitersBlock = (
    <CorporateGlassCard
      title="Top Recruiting Companies"
      subtitle="Companies ranked by offers made"
      delay={0.15}
      className="max-md:!p-3"
      action={
        <Link
          href="/dashboard/university/analytics"
          className="text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
        >
          View Details <ChevronRight className="w-3 h-3" />
        </Link>
      }
    >
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 dark:bg-white/10 rounded" />
          ))}
        </div>
      ) : topRecruiters.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center">No recruiting data yet.</p>
      ) : (
        <div className="space-y-2.5">
          {topRecruiters.map((company, i) => (
            <div key={company.company_name}>
              <div className="flex items-center justify-between text-[11px] mb-1 gap-1">
                <span className="font-medium text-gray-700 dark:text-gray-200 truncate">
                  {company.company_name}
                </span>
                <span className="font-bold text-gray-900 dark:text-white tabular-nums flex-shrink-0">
                  {company.offers}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${company.widthPercent}%` }}
                  transition={{ duration: 0.7, delay: 0.08 * i }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-400"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </CorporateGlassCard>
  )

  const skillBlock = (
    <CorporateGlassCard
      title="Skill Gap Analysis"
      subtitle="Average student performance across assessment areas"
      delay={0.18}
      className="max-md:!p-3"
      action={
        <Link
          href="/dashboard/university/analytics"
          className="text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5 flex-shrink-0"
        >
          View Details <ChevronRight className="w-3 h-3" />
        </Link>
      }
    >
      {isLoading ? (
        <div className="h-[140px] animate-pulse bg-gray-200 dark:bg-white/10 rounded-xl" />
      ) : !radarData.some((r) => r.score > 0) ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 py-6 text-center">
          Assessment scores will appear here once students complete practice.
        </p>
      ) : (
        <div className="h-[140px] md:h-[200px] -mx-0.5">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
              <PolarGrid strokeOpacity={0.2} />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#9CA3AF' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: '#9CA3AF' }} />
              <Radar
                name="Avg Score"
                dataKey="score"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.35}
                strokeWidth={2}
              />
              <Tooltip content={<AnalyticsTooltip valueFormatter={(v) => `${v}%`} />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </CorporateGlassCard>
  )

  const eventsBlock = (
    <CorporateGlassCard
      title="Upcoming Events"
      delay={0.12}
      className="max-md:!p-4"
      action={
        <Link
          href="/events"
          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
        >
          View All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      {eventsLoading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-white/10 rounded-xl" />
          ))}
        </div>
      ) : eventsError ? (
        <p className="text-sm text-red-500 dark:text-red-400 py-4 text-center">{eventsError}</p>
      ) : events.length === 0 ? (
        <div className="text-center py-6">
          <Calendar className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">No upcoming events</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {events.map((event) => {
            const slug = event.slug || event.id
            const dateParts = eventDateParts(event.event_start_date)
            const timeLabel = formatEventTime(event)
            const status = event.contest_status || 'upcoming'
            return (
              <Link
                key={event.id}
                href={`/events/${slug}`}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors group"
              >
                <div className="w-12 flex flex-col items-center justify-center flex-shrink-0 pt-0.5">
                  {dateParts ? (
                    <>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase leading-none">
                        {dateParts.month}
                      </span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400 leading-tight">
                        {dateParts.day}
                      </span>
                    </>
                  ) : (
                    <Calendar className="w-5 h-5 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {event.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                    <span>{modeLabel(event.mode)}</span>
                    {timeLabel && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeLabel}
                      </span>
                    )}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-orange-500 flex-shrink-0 pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  {statusLabel(status)}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </CorporateGlassCard>
  )

  const quickActionsBlock = (
    <CorporateGlassCard title="Quick Actions" delay={0.2} className="max-md:!p-4">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3">
        {QUICK_ACTIONS.map((action, i) => (
          <Link key={action.label} href={action.href}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i }}
              className="flex flex-col items-center justify-center gap-1.5 p-2.5 md:p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/60 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.06] transition-all min-h-[76px] md:min-h-[88px]"
            >
              <div className={cn('p-1.5 md:p-2 rounded-lg md:rounded-xl', action.color)}>
                <action.icon className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <span className="text-[10px] md:text-[11px] font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                {action.label}
              </span>
            </motion.div>
          </Link>
        ))}
      </div>
    </CorporateGlassCard>
  )

  return (
    <div className={cn(className)}>
      {/* Mobile layout */}
      <div className="md:hidden space-y-3">
        {placementBlock}
        {branchBlock}
        {eventsBlock}
        <div className="grid grid-cols-2 gap-2.5 items-start min-w-0">
          <div className="min-w-0">{recruitersBlock}</div>
          <div className="min-w-0">{velocityBlock}</div>
        </div>
        {skillBlock}
        {quickActionsBlock}
      </div>

      {/* Desktop 3-column layout */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
        <div className="space-y-6">
          {placementBlock}
          {branchBlock}
        </div>
        <div className="space-y-6">
          {velocityBlock}
          {recruitersBlock}
        </div>
        <div className="space-y-6 md:col-span-2 xl:col-span-1">
          {eventsBlock}
          {skillBlock}
          {quickActionsBlock}
        </div>
      </div>
    </div>
  )
}
