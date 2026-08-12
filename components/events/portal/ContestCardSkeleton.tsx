"use client"

import { memo } from 'react'

function ContestCardSkeletonItem() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="aspect-[16/9] w-full animate-pulse bg-gray-200 dark:bg-gray-800" />
      <div className="flex flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-7 flex-1 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="flex gap-2">
          <div className="h-5 w-14 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="h-5 w-28 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-40 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800/80" />
          <div className="h-9 w-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800/80" />
        </div>
        <div className="h-14 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800/80" />
        <div className="mt-1 flex gap-2">
          <div className="h-10 flex-1 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-10 flex-1 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
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
