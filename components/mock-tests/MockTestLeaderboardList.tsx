"use client"

import { Trophy } from 'lucide-react'

export interface LeaderboardEntry {
  rank: number
  student_name: string
  total_score?: number | null
  max_score?: number | null
  percentage?: number | null
  status?: string | null
}

function formatScore(entry: LeaderboardEntry): string {
  if (typeof entry.total_score === 'number' && typeof entry.max_score === 'number' && entry.max_score > 0) {
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

export function MockTestLeaderboardList({
  entries,
  emptyMessage = 'No ranked results yet.',
}: {
  entries: LeaderboardEntry[]
  emptyMessage?: string
}) {
  if (!entries.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-12 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <ul className="divide-y divide-gray-100 dark:divide-gray-700">
        {entries.map((entry) => (
          <li
            key={`${entry.rank}-${entry.student_name}`}
            className="flex items-center gap-3 px-4 py-3 sm:px-5"
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                entry.rank === 1
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                  : entry.rank === 2
                    ? 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-200'
                    : entry.rank === 3
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              {entry.rank === 1 ? <Trophy className="h-4 w-4" /> : entry.rank}
            </span>
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
  )
}
