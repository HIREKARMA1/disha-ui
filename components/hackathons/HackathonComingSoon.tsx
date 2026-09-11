'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Bell,
  BellRing,
  Briefcase,
  Calendar,
  ChevronRight,
  Clock,
  Code2,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const NOTIFY_KEY = 'hackathon_module_notify_interest'

const upcomingFeatures = [
  {
    id: 'challenges',
    title: 'Live challenges',
    hint: 'Build in rounds',
    detail:
      'Timed problem statements from hiring partners — submit a working prototype and climb the leaderboard.',
    icon: Code2,
    tone: 'from-violet-500 to-indigo-500',
    chip: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
  },
  {
    id: 'teams',
    title: 'Team matching',
    hint: 'Find teammates',
    detail:
      'Join as a team or get matched with students from other campuses who complement your skills.',
    icon: Users,
    tone: 'from-sky-500 to-cyan-500',
    chip: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
  },
  {
    id: 'mentors',
    title: 'Mentor hours',
    hint: 'Industry coaches',
    detail:
      'Office hours with engineers and recruiters during the event so you can unblock and ship faster.',
    icon: Sparkles,
    tone: 'from-amber-500 to-orange-500',
    chip: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  },
  {
    id: 'prizes',
    title: 'Interviews & prizes',
    hint: 'Win more than swag',
    detail:
      'Top teams get shortlisted for interviews, internships, and cash or goodies from campus hiring partners.',
    icon: Trophy,
    tone: 'from-emerald-500 to-teal-500',
    chip: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  },
] as const

const liveShortcuts = [
  {
    href: '/events',
    title: 'Events',
    copy: 'Workshops, contests, and campus sessions are live.',
    icon: Calendar,
  },
  {
    href: '/jobs',
    title: 'Jobs',
    copy: 'Browse open roles while hackathons are being set up.',
    icon: Briefcase,
  },
]

export function HackathonComingSoon() {
  const [selectedFeature, setSelectedFeature] = useState<(typeof upcomingFeatures)[number]['id']>(
    'challenges'
  )
  const [notifyOn, setNotifyOn] = useState(false)

  useEffect(() => {
    try {
      setNotifyOn(localStorage.getItem(NOTIFY_KEY) === '1')
    } catch {
      /* ignore private-mode storage */
    }
  }, [])

  const feature = upcomingFeatures.find((item) => item.id === selectedFeature) ?? upcomingFeatures[0]
  const FeatureIcon = feature.icon

  const toggleNotify = () => {
    const next = !notifyOn
    setNotifyOn(next)
    try {
      localStorage.setItem(NOTIFY_KEY, next ? '1' : '0')
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-1 py-4 sm:py-6">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-violet-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-violet-200/70 to-indigo-100/40 blur-2xl dark:from-violet-700/20 dark:to-indigo-900/10" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm shadow-violet-600/20 dark:bg-violet-500 sm:mb-4">
              <Clock className="h-3.5 w-3.5" />
              Coming soon
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">
              Hackathons are on the way
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-base">
              Campus buildathons with live challenges, team matching, and interview shortlists. Get
              notified when the first Disha hackathon opens — and keep going with events and jobs in
              the meantime.
            </p>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
              <Button
                onClick={toggleNotify}
                variant={notifyOn ? 'success' : 'default'}
                className="h-11 w-full rounded-full sm:h-10 sm:w-auto"
              >
                {notifyOn ? <BellRing className="mr-2 h-4 w-4" /> : <Bell className="mr-2 h-4 w-4" />}
                {notifyOn ? 'You will be notified' : 'Notify me when it launches'}
              </Button>
              <Button asChild variant="outline" className="h-11 w-full rounded-full sm:h-10 sm:w-auto">
                <Link href="/events">
                  Browse events
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            className="mx-auto hidden h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-200 dark:shadow-none sm:flex sm:h-32 sm:w-32 lg:mx-0"
          >
            <Code2 className="h-14 w-14 text-white sm:h-16 sm:w-16" />
          </motion.div>
        </div>
      </motion.section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-600" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Tap a card to preview
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {upcomingFeatures.map((item) => {
            const Icon = item.icon
            const active = item.id === selectedFeature
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedFeature(item.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  active
                    ? 'border-violet-400 bg-white shadow-md ring-2 ring-violet-200 dark:border-violet-500 dark:bg-gray-900 dark:ring-violet-900'
                    : 'border-gray-200 bg-white/80 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900'
                }`}
              >
                <div
                  className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.tone} text-white`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">{item.title}</div>
                <div className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${item.chip}`}>
                  {item.hint}
                </div>
              </button>
            )
          })}
        </div>
        <motion.div
          key={feature.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/70 p-4 dark:border-violet-900/40 dark:bg-violet-950/20"
        >
          <div className="mt-0.5 rounded-lg bg-white p-2 text-violet-600 shadow-sm dark:bg-gray-900">
            <FeatureIcon className="h-4 w-4" />
          </div>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{feature.detail}</p>
        </motion.div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {liveShortcuts.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-white">{item.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{item.copy}</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-violet-600" />
            </Link>
          )
        })}
      </section>
    </div>
  )
}
