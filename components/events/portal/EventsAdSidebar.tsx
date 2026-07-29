"use client"

import { memo, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Advertisement } from '@/types/advertisement'
import { cn } from '@/lib/utils'

export type EventsAdVariant = 'left' | 'right' | 'banner' | 'default'

/** Resolve CTA href from redirect URL only (ads are independent of events). */
export function resolveAdvertisementHref(ad: Advertisement): string {
  if (ad.redirect_url?.trim()) return ad.redirect_url.trim()
  return '#'
}

interface EventsPortalAdCardProps {
  ad: Advertisement
  variant?: EventsAdVariant
  className?: string
}

function EventsPortalAdCardComponent({
  ad,
  variant = 'default',
  className,
}: EventsPortalAdCardProps) {
  const href = resolveAdvertisementHref(ad)
  const ctaLabel = ad.button_text || 'Learn More'
  const hasCta = Boolean(ad.redirect_url?.trim())
  const isExternal = href.startsWith('http://') || href.startsWith('https://')
  const isLeft = variant === 'left'
  const isRight = variant === 'right'
  const isBanner = variant === 'banner'

  const linkProps = isExternal
    ? { href, target: '_blank' as const, rel: 'noopener noreferrer' }
    : { href }

  const ctaLink = (className: string, children: ReactNode) =>
    hasCta ? (
      <Link {...linkProps} className={className}>
        {children}
      </Link>
    ) : null

  if (isBanner) {
    return (
      <article
        className={cn(
          'overflow-hidden rounded-[22px] border border-gray-200/90 bg-white shadow-md',
          'dark:border-gray-700/80 dark:bg-gray-900/95',
          className
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="relative min-h-[160px] overflow-hidden md:min-h-[200px]">
            <img
              src={ad.image_url}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover object-center"
            />
          </div>
          <div className="flex flex-col justify-center gap-3 px-6 py-6">
            <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              {ad.title}
            </h3>
            <p className="text-[15px] leading-relaxed text-gray-600 dark:text-gray-400">
              {ad.description}
            </p>
            {ctaLink(
              'inline-flex w-fit',
              <Button
                size="sm"
                className="rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
              >
                {ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </article>
    )
  }

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
          {ctaLink(
            'mt-1 inline-flex',
            <span className="inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
              {ctaLabel}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </span>
          )}
        </div>
        <div className="relative mt-auto min-h-[240px] flex-1 overflow-hidden">
          <img
            src={ad.image_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover object-center"
          />
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
          <img
            src={ad.image_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />
          <div className="absolute left-6 top-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Megaphone className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="flex flex-1 flex-col px-7 py-7">
          <h3 className="text-xl font-bold leading-snug tracking-tight text-gray-900 dark:text-white">
            {ad.title}
          </h3>
          <p className="mt-3 text-[15px] leading-relaxed text-gray-600 dark:text-gray-400">
            {ad.description}
          </p>
          {ctaLink(
            'mt-auto block pt-6',
            <Button
              size="lg"
              className="h-12 w-full rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-base font-semibold hover:from-primary-600 hover:to-secondary-600"
            >
              {ctaLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
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
      <div className="relative h-36 overflow-hidden">
        <img src={ad.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-black/20" />
        <h3 className="absolute bottom-4 left-4 right-4 text-base font-bold leading-tight text-white">
          {ad.title}
        </h3>
      </div>
      <div className="p-4">
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{ad.description}</p>
        {ctaLink(
          'mt-4 block',
          <Button
            size="sm"
            variant="outline"
            className="w-full border-primary-200 font-semibold text-primary-700 hover:bg-primary-50 dark:border-primary-800 dark:text-primary-300"
          >
            {ctaLabel}
            <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </article>
  )
}

interface EventsAdSidebarProps {
  ad?: Advertisement | null
  variant?: EventsAdVariant
  sticky?: boolean
  className?: string
}

function EventsAdSidebarComponent({
  ad,
  variant = 'right',
  sticky = false,
  className,
}: EventsAdSidebarProps) {
  if (!ad) return null

  return (
    <aside className={cn(sticky && 'sticky top-20 self-start', className)}>
      <EventsPortalAdCard ad={ad} variant={variant} />
    </aside>
  )
}

export const EventsPortalAdCard = memo(EventsPortalAdCardComponent)
export const EventsAdSidebar = memo(EventsAdSidebarComponent)
