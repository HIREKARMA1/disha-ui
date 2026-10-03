'use client'

import { Calendar, Globe, Mail, MapPin, Phone } from 'lucide-react'
import { sanitizeEventDescriptionHtml } from '@/lib/sanitizeHtml'
import type { CampusDriveDetail } from '@/types/campusDrive'
import { CATEGORY_LABELS } from '@/types/contestEvent'
import { CampusDriveSelectedJobs } from '@/components/campus-drives/CampusDriveSelectedJobs'
import { EventFaqAccordion } from '@/components/events/EventFaqAccordion'

function RichBlock({ html }: { html?: string | null }) {
  if (!html) return null
  return (
    <div
      className="prose prose-sm max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: sanitizeEventDescriptionHtml(html, '') }}
    />
  )
}

function formatWhen(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function CampusDriveDetailView({ drive }: { drive: CampusDriveDetail }) {
  const start = formatWhen(drive.event_start_date)
  const end = formatWhen(drive.event_end_date)
  const regStart = formatWhen(drive.registration_start_date)
  const regEnd = formatWhen(drive.registration_end_date)

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-3 py-4 sm:px-4 sm:py-6">
      <div className="overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
        <div className="relative aspect-[16/9] w-full">
          {drive.banner_url ? (
            <img src={drive.banner_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-700 to-secondary-600" />
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
        <div className="flex items-start gap-3">
          {drive.organizer_logo_url && (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-white p-1 sm:h-20 sm:w-20">
              <img src={drive.organizer_logo_url} alt="" className="h-full w-full object-contain" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{drive.title}</h1>
            {drive.subtitle && <p className="mt-1 text-gray-600 dark:text-gray-300">{drive.subtitle}</p>}
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {drive.category && (
                <span className="rounded-full bg-primary-50 px-2 py-1 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200">
                  {CATEGORY_LABELS[drive.category] || drive.category}
                </span>
              )}
              {drive.mode && <span className="rounded-full bg-gray-100 px-2 py-1 capitalize dark:bg-gray-700">{drive.mode}</span>}
            </div>
          </div>
        </div>
        {drive.short_description && (
          <div className="mt-4">
            <RichBlock html={drive.short_description} />
          </div>
        )}
      </div>

      <section className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-sm dark:border-gray-700 dark:bg-gray-800 sm:grid-cols-2 sm:p-6">
        <p className="flex items-start gap-2"><Calendar className="mt-0.5 h-4 w-4 shrink-0" /> Start: {start || '—'}</p>
        <p className="flex items-start gap-2"><Calendar className="mt-0.5 h-4 w-4 shrink-0" /> End: {end || '—'}</p>
        <p>Registration start: {regStart || '—'}</p>
        <p>Registration end: {regEnd || '—'}</p>
        {drive.venue && <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {drive.venue}</p>}
        {drive.event_link && (
          <p className="flex items-start gap-2 sm:col-span-2">
            <Globe className="mt-0.5 h-4 w-4 shrink-0" />
            <a href={drive.event_link} target="_blank" rel="noreferrer" className="break-all text-primary-600 underline">
              {drive.event_link}
            </a>
          </p>
        )}
        {drive.organizer_name && <p>Organizer: {drive.organizer_name}</p>}
        {drive.organizer_email && <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {drive.organizer_email}</p>}
        {drive.organizer_phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {drive.organizer_phone}</p>}
        {drive.organizer_website && (
          <p className="sm:col-span-2">
            <a href={drive.organizer_website} target="_blank" rel="noreferrer" className="text-primary-600 underline">
              {drive.organizer_website}
            </a>
          </p>
        )}
      </section>

      {drive.long_description && (
        <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:p-6">
          <h2 className="mb-3 text-lg font-semibold">Description</h2>
          <RichBlock html={drive.long_description} />
        </section>
      )}

      {drive.eligibility && (
        <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:p-6">
          <h2 className="mb-3 text-lg font-semibold">Eligibility</h2>
          <RichBlock html={drive.eligibility} />
        </section>
      )}

      {drive.rounds?.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:p-6">
          <h2 className="mb-3 text-lg font-semibold">Rounds</h2>
          <div className="space-y-4">
            {drive.rounds.map((round) => (
              <div key={round.id || round.title}>
                <h3 className="font-medium">{round.title}</h3>
                <RichBlock html={round.description} />
              </div>
            ))}
          </div>
        </section>
      )}

      {drive.rewards?.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:p-6">
          <h2 className="mb-3 text-lg font-semibold">Rewards</h2>
          <div className="space-y-4">
            {drive.rewards.map((reward) => (
              <div key={reward.id || reward.title}>
                <h3 className="font-medium">{reward.title}{reward.value ? ` · ${reward.value}` : ''}</h3>
                <RichBlock html={reward.description} />
              </div>
            ))}
          </div>
        </section>
      )}

      {drive.about_organizer && (
        <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:p-6">
          <h2 className="mb-3 text-lg font-semibold">About Organizer</h2>
          <RichBlock html={drive.about_organizer} />
        </section>
      )}

      {(drive.support_email || drive.support_phone || drive.support_content) && (
        <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:p-6">
          <h2 className="mb-3 text-lg font-semibold">Support</h2>
          {drive.support_email && <p className="text-sm">{drive.support_email}</p>}
          {drive.support_phone && <p className="text-sm">{drive.support_phone}</p>}
          <RichBlock html={drive.support_content} />
        </section>
      )}
      
      <CampusDriveSelectedJobs jobs={drive.jobs} hideApply={drive.listing_status === 'hidden'} />

      {drive.faqs?.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white md:mb-4 md:text-xl">FAQs</h2>
          <EventFaqAccordion faqs={drive.faqs} />
        </section>
      )}
      
    </div>
  )
}
