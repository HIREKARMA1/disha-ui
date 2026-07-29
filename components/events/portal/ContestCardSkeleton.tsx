"use client"

import { memo } from 'react'

function ContestCardSkeletonItem() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="flex flex-col lg:flex-row">
        <div className="h-48 w-full animate-pulse bg-gray-200 dark:bg-gray-800 lg:h-auto lg:min-h-[240px] lg:w-[38%]" />
        <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
          <div className="h-4 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="h-7 w-3/4 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="mt-2 h-12 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800/80" />
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800/80" />
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <div className="h-10 flex-1 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="h-10 flex-1 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ContestCardSkeletonComponent({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ContestCardSkeletonItem key={i} />
      ))}
    </div>
  )
}

export const ContestCardSkeleton = memo(ContestCardSkeletonComponent)
