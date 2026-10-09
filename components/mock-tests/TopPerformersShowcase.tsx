"use client"

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Crown, Medal, Sparkles, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  formatPerformerScore,
  publishedHighlights,
  type TopPerformerHighlight,
} from '@/components/mock-tests/topPerformerUtils'

type TopPerformersShowcaseProps = {
  highlights: TopPerformerHighlight[]
  isLoading?: boolean
  variant?: 'catalog' | 'landing'
  onSelectTest?: (mockTestId: string) => void
  className?: string
}

function PerformerAvatar({ name, rank }: { name: string; rank: number }) {
  const initial = (name.trim()[0] || '?').toUpperCase()
  const rankStyles =
    rank === 1
      ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white ring-2 ring-amber-200/80'
      : rank === 2
        ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white ring-2 ring-slate-200/80'
        : rank === 3
          ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white ring-2 ring-orange-200/80'
          : 'bg-gradient-to-br from-primary-500 to-violet-600 text-white ring-2 ring-primary-200/60'

  return (
    <span
      className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-md',
        rankStyles
      )}
      aria-hidden
    >
      {rank === 1 ? <Crown className="h-5 w-5" /> : initial}
    </span>
  )
}

export function TopPerformersShowcase({
  highlights,
  isLoading = false,
  variant = 'catalog',
  onSelectTest,
  className,
}: TopPerformersShowcaseProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const isLanding = variant === 'landing'
  const published = publishedHighlights(highlights)

  const scrollCarousel = (dir: 1 | -1) => {
    const el = carouselRef.current
    if (!el) return
    el.scrollBy({
      left: dir * Math.min(el.clientWidth * 0.85, 360),
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex gap-4 overflow-hidden',
          isLanding && 'md:grid md:grid-cols-3 md:overflow-visible',
          className
        )}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'h-44 shrink-0 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800',
              isLanding ? 'md:h-52 w-full md:w-auto' : 'w-[min(85vw,300px)]'
            )}
          />
        ))}
      </div>
    )
  }

  if (published.length === 0) {
    return (
      <div
        className={cn(
          'rounded-2xl border border-dashed border-gray-200 bg-white/60 px-6 py-10 text-center dark:border-gray-700 dark:bg-gray-900/30',
          className
        )}
      >
        <Medal className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" />
        <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          Top performers will appear here after practice test results are published.
        </p>
        {isLanding ? (
          <Button asChild variant="outline" className="mt-4">
            <Link href="/mock-tests">Explore Practice Tests</Link>
          </Button>
        ) : null}
      </div>
    )
  }

  const displayItems = isLanding ? published.slice(0, 6) : highlights

  return (
    <div className={cn('space-y-4', className)}>
      {isLanding ? (
        <div className="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 via-white to-primary-50/40 p-5 shadow-sm dark:border-amber-900/40 dark:from-amber-950/30 dark:via-[#141A29] dark:to-primary-950/20 sm:p-6">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-300/20 blur-3xl dark:bg-amber-500/10" />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                <Sparkles className="h-3.5 w-3.5" />
                Practice Test Champions
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
                Top Performers
              </h3>
              <p className="mt-1 max-w-xl text-sm text-gray-600 dark:text-gray-400">
                Students leading the board on published practice tests — real scores from live
                assessments.
              </p>
            </div>
            <Button asChild className="shrink-0 bg-primary-600 hover:bg-primary-700">
              <Link href="/mock-tests">View Practice Tests</Link>
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-1">
        {displayItems.length > 1 && !isLanding ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => scrollCarousel(-1)}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => scrollCarousel(1)}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        ) : null}
      </div>

      <div
        ref={carouselRef}
        className={cn(
          'flex gap-4 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          isLanding && 'md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible'
        )}
      >
        {displayItems.map((item, index) => {
          const performer = item.top_performer
          const scoreLabel = performer ? formatPerformerScore(performer) : null
          const rank = performer?.rank ?? 1
          const interactive = item.results_published && Boolean(onSelectTest)

          const card = (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={cn(
                'group relative flex h-full min-h-[168px] flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-all duration-200 dark:bg-[#141A29]',
                rank === 1 && 'border-amber-300/80 ring-1 ring-amber-200/50 dark:border-amber-700/50',
                rank === 2 && 'border-slate-200 dark:border-slate-600/60',
                rank === 3 && 'border-orange-200/80 dark:border-orange-800/50',
                rank > 3 && 'border-gray-200 dark:border-[#1A2233]',
                interactive &&
                  'cursor-pointer hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:border-primary-600',
                isLanding ? 'w-full shrink-0 md:shrink' : 'w-[min(88vw,320px)] shrink-0'
              )}
            >
              {item.background_image_url ? (
                <div className="relative h-20 overflow-hidden">
                  <img
                    src={item.background_image_url}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-center opacity-90 transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {rank === 1 ? (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      <Trophy className="h-3 w-3" />
                      #1
                    </span>
                  ) : null}
                </div>
              ) : null}

              <div className="flex flex-1 flex-col p-4">
                <p className="line-clamp-2 text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">
                  Practice Test
                </p>
                <p className="mt-1 line-clamp-2 text-sm font-bold text-gray-900 dark:text-white">
                  {item.assessment_name}
                </p>

                {item.results_published && performer ? (
                  <div className="mt-4 flex items-center gap-3">
                    <PerformerAvatar name={performer.student_name} rank={rank} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {performer.student_name}
                      </p>
                      {scoreLabel ? (
                        <p className="text-sm tabular-nums text-gray-600 dark:text-gray-400">
                          {scoreLabel}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Results not published yet
                  </p>
                )}
              </div>
            </motion.div>
          )

          if (!interactive) {
            return (
              <div key={item.mock_test_id} className="contents">
                {card}
              </div>
            )
          }

          return (
            <button
              key={item.mock_test_id}
              type="button"
              onClick={() => onSelectTest?.(item.mock_test_id)}
              className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-2xl"
            >
              {card}
            </button>
          )
        })}
      </div>
    </div>
  )
}
