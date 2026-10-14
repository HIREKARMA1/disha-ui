"use client"

import { useState } from 'react'
import { Crown, Medal, Trophy, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface LeaderboardEntry {
  rank: number
  student_name: string
  total_score?: number | null
  max_score?: number | null
  percentage?: number | null
  status?: string | null
  profile_picture?: string | null
  university_name?: string | null
}

function formatScore(entry: LeaderboardEntry): string {
  if (
    typeof entry.total_score === 'number' &&
    typeof entry.max_score === 'number' &&
    entry.max_score > 0
  ) {
    return `${entry.total_score}/${entry.max_score}`
  }
  if (typeof entry.total_score === 'number') {
    return String(entry.total_score)
  }
  if (typeof entry.percentage === 'number') {
    return `${entry.percentage.toFixed(1)}%`
  }
  return '—'
}

function formatPercentage(entry: LeaderboardEntry): string {
  if (typeof entry.percentage === 'number') return `${entry.percentage.toFixed(1)}%`
  return '—'
}

function institutionLabel(entry: LeaderboardEntry): string {
  return entry.university_name?.trim() || 'University not provided'
}

function StudentAvatar({
  name,
  photoUrl,
}: {
  name: string
  photoUrl?: string | null
}) {
  const [failed, setFailed] = useState(false)
  const src = photoUrl?.trim()
  const showPhoto = Boolean(src) && !failed

  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      {showPhoto ? (
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <User className="h-5 w-5 text-gray-400" aria-hidden />
      )}
      <span className="sr-only">{name}</span>
    </span>
  )
}

function rankRowClass(rank: number): string {
  if (rank === 1) return 'bg-amber-50/80 dark:bg-amber-950/20'
  if (rank === 2) return 'bg-slate-50/80 dark:bg-slate-900/30'
  if (rank === 3) return 'bg-orange-50/70 dark:bg-orange-950/20'
  return ''
}

function RankedLeaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  const ranked = [...entries].sort((a, b) => a.rank - b.rank)

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-[#1A2233] dark:bg-[#141A29]">
      <div className="hidden grid-cols-[4.5rem_minmax(0,1.4fr)_minmax(0,1.2fr)_6rem_6.5rem] gap-3 border-b border-gray-100 bg-gray-50/80 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-400 md:grid md:px-5">
        <span>Rank</span>
        <span>Student</span>
        <span>University / College</span>
        <span className="text-right">Score</span>
        <span className="text-right">Percentage</span>
      </div>

      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
        {ranked.map((entry) => {
          const college = institutionLabel(entry)
          return (
            <li
              key={`${entry.rank}-${entry.student_name}`}
              className={cn('px-4 py-3.5 sm:px-5', rankRowClass(entry.rank))}
            >
              <div className="flex items-center gap-3 md:hidden">
                <RankBadge rank={entry.rank} />
                <StudentAvatar name={entry.student_name} photoUrl={entry.profile_picture} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white" title={entry.student_name}>
                    {entry.student_name}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400" title={college}>
                    {college}
                  </p>
                  <p className="mt-1 text-sm font-semibold tabular-nums text-gray-900 dark:text-white">
                    {formatScore(entry)}
                    <span className="ml-2 font-medium text-gray-500 dark:text-gray-400">
                      {formatPercentage(entry)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="hidden grid-cols-[4.5rem_minmax(0,1.4fr)_minmax(0,1.2fr)_6rem_6.5rem] items-center gap-3 md:grid">
                <RankBadge rank={entry.rank} />
                <div className="flex min-w-0 items-center gap-3">
                  <StudentAvatar name={entry.student_name} photoUrl={entry.profile_picture} />
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white" title={entry.student_name}>
                    {entry.student_name}
                  </p>
                </div>
                <p className="truncate text-sm text-gray-600 dark:text-gray-300" title={college}>
                  {college}
                </p>
                <p className="text-right text-sm font-semibold tabular-nums text-gray-900 dark:text-white">
                  {formatScore(entry)}
                </p>
                <p className="text-right text-sm font-semibold tabular-nums text-gray-700 dark:text-gray-200">
                  {formatPercentage(entry)}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md ring-2 ring-amber-200/80 dark:ring-amber-700/50">
        <Crown className="h-5 w-5" aria-hidden />
        <span className="sr-only">Rank 1</span>
      </span>
    )
  }
  if (rank === 2) {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-500 text-sm font-bold text-white shadow-md ring-2 ring-slate-200/80">
        2
      </span>
    )
  }
  if (rank === 3) {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-sm font-bold text-white shadow-md ring-2 ring-orange-200/80">
        3
      </span>
    )
  }
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
      {rank}
    </span>
  )
}

export function MockTestLeaderboardList({
  entries,
  emptyMessage = 'No ranked results yet.',
  layout = 'podium',
}: {
  entries: LeaderboardEntry[]
  emptyMessage?: string
  layout?: 'podium' | 'ranked'
}) {
  if (!entries.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gradient-to-b from-gray-50 to-white px-6 py-14 text-center dark:border-gray-700 dark:from-gray-900/40 dark:to-[#141A29]">
        <Medal className="mx-auto h-9 w-9 text-gray-400 dark:text-gray-500" />
        <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">{emptyMessage}</p>
      </div>
    )
  }

  if (layout === 'ranked') {
    return <RankedLeaderboard entries={entries} />
  }

  const topThree = entries.filter((e) => e.rank <= 3)
  const rest = entries.filter((e) => e.rank > 3)
  const listOnly = topThree.length === 0

  return (
    <div className="space-y-6">
      {topThree.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
          {topThree
            .slice()
            .sort((a, b) => a.rank - b.rank)
            .map((entry) => (
              <div
                key={`podium-${entry.rank}-${entry.student_name}`}
                className={cn(
                  'rounded-2xl border bg-white p-4 text-center shadow-sm transition-shadow hover:shadow-md dark:bg-[#141A29]',
                  entry.rank === 1 &&
                    'order-first border-amber-300/70 bg-gradient-to-b from-amber-50/80 to-white sm:order-none sm:-mt-2 sm:pb-6 dark:border-amber-800/50 dark:from-amber-950/30 dark:to-[#141A29]',
                  entry.rank === 2 && 'border-slate-200 dark:border-slate-600/50',
                  entry.rank === 3 && 'border-orange-200/80 dark:border-orange-900/40'
                )}
              >
                <div className="flex justify-center">
                  <RankBadge rank={entry.rank} />
                </div>
                <p className="mt-3 truncate text-sm font-bold text-gray-900 dark:text-white">
                  {entry.student_name}
                </p>
                <p className="mt-1 text-lg font-bold tabular-nums text-primary-700 dark:text-primary-300">
                  {formatScore(entry)}
                </p>
                {typeof entry.percentage === 'number' ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {entry.percentage.toFixed(1)}%
                  </p>
                ) : null}
              </div>
            ))}
        </div>
      ) : null}

      {rest.length > 0 || listOnly ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-[#1A2233] dark:bg-[#141A29]">
          <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/40 sm:px-5">
            <Trophy className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {listOnly ? 'Rankings' : 'Full rankings'}
            </span>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {(listOnly ? entries : rest).map((entry) => (
              <li
                key={`${entry.rank}-${entry.student_name}`}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-900/30 sm:px-5"
              >
                <RankBadge rank={entry.rank} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900 dark:text-white">
                    {entry.student_name}
                  </p>
                  {typeof entry.percentage === 'number' ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {entry.percentage.toFixed(1)}%
                    </p>
                  ) : null}
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-gray-900 dark:text-white">
                  {formatScore(entry)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
