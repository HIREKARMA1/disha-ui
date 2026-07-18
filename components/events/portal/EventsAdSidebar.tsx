"use client"

import { memo } from 'react'
import Link from 'next/link'
import { ArrowRight, Trophy, Briefcase, Building2, BookOpen, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EVENTS_PORTAL_ADS, type PortalAdItem } from '@/lib/eventsPortalConfig'
import { cn } from '@/lib/utils'

const ACCENT_ICONS = {
  trophy: Trophy,
  briefcase: Briefcase,
  building: Building2,
  book: BookOpen,
  file: FileText,
} as const

export type EventsAdVariant = 'left' | 'right' | 'default'

interface EventsPortalAdCardProps {
  ad: PortalAdItem
  variant?: EventsAdVariant
  className?: string
}

function EventsPortalAdCardComponent({
  ad,
  variant = 'default',
  className,
}: EventsPortalAdCardProps) {
  const Icon = ACCENT_ICONS[ad.accent]
  const isLeft = variant === 'left'
  const isRight = variant === 'right'

  if (isLeft) {
    return (
      <article
        className={cn(
          'flex h-[560px] w-full flex-col overflow-hidden rounded-[22px]',
          'border border-gray-200/90 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]',
          'transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]',
          'dark:border-gray-700/80 dark:bg-gray-900/95',
          className
        )}
      >
        <div className="flex flex-col gap-4 px-7 pb-5 pt-7">
          <h3 className="text-xl font-bold leading-snug tracking-tight text-gray-900 dark:text-white">
            {ad.title}
          </h3>
          <p className="text-[15px] leading-relaxed text-gray-600 dark:text-gray-400">
            {ad.description}
          </p>
          {ad.ctaLabel ? (
            <Link href={ad.href} className="mt-1 inline-flex">
              <span className="inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
                {ad.ctaLabel}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </span>
            </Link>
          ) : null}
        </div>
        <div className="relative mt-auto min-h-[240px] flex-1 overflow-hidden">
          {ad.imageUrl ? (
            <img
              src={ad.imageUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className={cn('flex h-full w-full items-end bg-gradient-to-br p-6', ad.gradient)}>
              <div className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        </div>
      </article>
    )
  }

  if (isRight) {
    return (
      <article
        className={cn(
          'flex h-[560px] w-full flex-col overflow-hidden rounded-[22px]',
          'border border-gray-200/90 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]',
          'transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]',
          'dark:border-gray-700/80 dark:bg-gray-900/95',
          className
        )}
      >
        <div className="relative h-[220px] shrink-0 overflow-hidden">
          {ad.imageUrl ? (
            <img
              src={ad.imageUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className={cn('h-full w-full bg-gradient-to-br', ad.gradient)} />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />
          <div className="absolute left-6 top-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="flex flex-1 flex-col px-7 py-7">
          <h3 className="text-xl font-bold leading-snug tracking-tight text-gray-900 dark:text-white">
            {ad.title}
          </h3>
          <p className="mt-3 text-[15px] leading-relaxed text-gray-600 dark:text-gray-400">
            {ad.description}
          </p>
          {ad.bullets && ad.bullets.length > 0 ? (
            <ul className="mt-5 space-y-2.5">
              {ad.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-start gap-2.5 text-[15px] leading-snug text-gray-700 dark:text-gray-300"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}
          {ad.ctaLabel ? (
            <Link href={ad.href} className="mt-auto block pt-6">
              <Button
                size="lg"
                className="h-12 w-full rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-base font-semibold hover:from-primary-600 hover:to-secondary-600"
              >
                {ad.ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : null}
        </div>
      </article>
    )
  }

  return (
    <article
      className={cn(
        'overflow-hidden rounded-[22px] border border-gray-200/80 bg-white shadow-md',
        'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg',
        'dark:border-gray-700/80 dark:bg-gray-900/90',
        className
      )}
    >
      <div className={cn('relative flex h-36 items-end bg-gradient-to-br p-4', ad.gradient)}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h3 className="relative text-base font-bold leading-tight text-white">{ad.title}</h3>
      </div>
      <div className="p-4">
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{ad.description}</p>
        {ad.ctaLabel ? (
          <Link href={ad.href} className="mt-4 block">
            <Button
              size="sm"
              variant="outline"
              className="w-full border-primary-200 font-semibold text-primary-700 hover:bg-primary-50 dark:border-primary-800 dark:text-primary-300"
            >
              {ad.ctaLabel}
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          </Link>
        ) : null}
      </div>
    </article>
  )
}

interface EventsAdSidebarProps {
  ad?: PortalAdItem
  adIndex?: number
  variant?: EventsAdVariant
  sticky?: boolean
  className?: string
}

function EventsAdSidebarComponent({
  ad,
  adIndex = 0,
  variant = 'right',
  sticky = false,
  className,
}: EventsAdSidebarProps) {
  const selectedAd = ad ?? EVENTS_PORTAL_ADS[adIndex] ?? EVENTS_PORTAL_ADS[0]

  if (!selectedAd) return null

  return (
    <aside className={cn(sticky && 'sticky top-20 self-start', className)}>
      <EventsPortalAdCard ad={selectedAd} variant={variant} />
    </aside>
  )
}

export const EventsPortalAdCard = memo(EventsPortalAdCardComponent)
export const EventsAdSidebar = memo(EventsAdSidebarComponent)
