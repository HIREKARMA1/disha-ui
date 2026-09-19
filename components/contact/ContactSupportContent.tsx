'use client'

import Image from 'next/image'
import { FaWhatsapp } from 'react-icons/fa'
import {
  ArrowRight,
  Headphones,
  Mail,
  MapPin,
  Phone,
  Smartphone,
} from 'lucide-react'
import { config } from '@/lib/config'
import { cn } from '@/lib/utils'

const OFFICE_ADDRESS =
  '2nd Floor, SS Niwas, Hirekarma Private Limited, Raghunathpur, Bhubaneswar, Odisha 751024'

const MAPS_DIRECTIONS_URL =
  'https://www.google.com/maps/search/?api=1&query=2nd+Floor%2C+SS+Niwas%2C+Hirekarma+Private+Limited%2C+Raghunathpur%2C+Bhubaneswar%2C+Odisha+751024'

const MAPS_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3739.9763807315003!2d85.8203458793457!3d20.383863700000006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a19096e0259fc7f%3A0x7ad66a4df8112eda!2sHireKarma%20Private%20Limited!5e0!3m2!1sen!2sin!4v1789020372578!5m2!1sen!2sin'

const WHATSAPP_QR_IMAGE =
  'https://disha-ui.s3.ap-south-1.amazonaws.com/new-disha/My_QR_Code_1-1024.jpeg'

const WHATSAPP_STEPS = [
  'Send "Hi" on WhatsApp.',
  'Select or describe your issue.',
  'Submit your query through the chatbot.',
  'Our support team will connect with you soon to resolve your issue.',
] as const

const cardBtn =
  'inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition'

function buildWhatsAppUrl(number: string, message: string): string | null {
  const normalized = number.replace(/\D/g, '')
  if (!normalized) return null
  const params = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${normalized}${params}`
}

export type ContactSupportContentProps = {
  variant?: 'public' | 'dashboard'
  className?: string
}

export function ContactSupportContent({
  variant = 'public',
  className,
}: ContactSupportContentProps) {
  const whatsappHref = buildWhatsAppUrl(
    config.whatsapp.number,
    config.whatsapp.message || 'Hi'
  )
  const phoneDisplay = '+1 (555) 450-3532'

  return (
    <div
      className={cn(
        'w-full',
        variant === 'public' ? 'space-y-8 sm:space-y-10' : 'space-y-6 sm:space-y-8',
        className
      )}
    >
      {/* Centered header */}
      <section className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1.5 text-xs font-semibold text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300">
          <Headphones className="h-3.5 w-3.5" />
          We&apos;re Here to Help
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-800 dark:text-white sm:text-4xl">
          Get in Touch with Our Support Team
        </h1>
        <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-gray-300">
          Have questions about your Premium access, account, or anything else? Our support team is
          always here to help you.
        </p>
      </section>

      {/* WhatsApp — 3 columns */}
      <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-5 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/40 dark:via-green-950/30 dark:to-teal-950/30 sm:p-6 lg:p-7">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-6">
          <div className="lg:col-span-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md shadow-emerald-500/25 ring-4 ring-white dark:ring-emerald-900/50">
              <FaWhatsapp className="h-8 w-8" />
            </div>
            <span className="mt-4 inline-flex rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Fast &amp; Easy Support
            </span>
            <h2 className="mt-3 text-xl font-bold text-slate-800 dark:text-white">
              WhatsApp Support
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              Send &apos;Hi&apos; to our WhatsApp support chatbot and raise your query. Our support
              team will connect with you soon.
            </p>
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-base font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
              >
                <Phone className="h-4 w-4" />
                {phoneDisplay}
              </a>
            )}
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex h-12 w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1ebe57] hover:shadow-md sm:w-auto"
              >
                <FaWhatsapp className="h-5 w-5" />
                Chat on WhatsApp
                <ArrowRight className="h-4 w-4" />
              </a>
            )}
          </div>

          <div className="lg:col-span-4 lg:border-l lg:border-emerald-200/80 lg:pl-6 dark:lg:border-emerald-800/50">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">How it works</h3>
            <ol className="mt-4 space-y-3.5">
              {WHATSAPP_STEPS.map((step, i) => (
                <li key={step} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="pt-1 leading-snug">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-emerald-200/80 bg-white/70 p-4 text-center shadow-sm dark:border-emerald-800/50 dark:bg-emerald-950/30 sm:p-5">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white sm:text-base">
                Scan to Chat on WhatsApp
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                Open WhatsApp on your phone and scan the QR code to start a chat.
              </p>
              <div className="mx-auto mt-4 flex aspect-square w-full max-w-[220px] items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-white p-2 dark:border-gray-700">
                <Image
                  src={WHATSAPP_QR_IMAGE}
                  alt="WhatsApp QR code for HireKarma support"
                  width={1024}
                  height={1024}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <p className="mt-3 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                <Smartphone className="h-3.5 w-3.5" />
                Or save this number: {phoneDisplay}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Equal cards, aligned CTAs, clean map */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:items-stretch">
        <article className="flex min-h-[280px] flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-500 text-white">
            <Mail className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-white">Email Us</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            For any queries, you can also reach us via email.
          </p>
          <p className="mt-3 text-sm font-semibold text-sky-700 dark:text-sky-300">
            info@hirekarma.in
          </p>
          <div className="mt-auto pt-6">
            <a
              href="mailto:info@hirekarma.in"
              className={cn(
                cardBtn,
                'border-sky-500 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-600 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-950/70'
              )}
            >
              Send Email
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </article>

        <article className="flex min-h-[280px] flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-500 text-white">
            <MapPin className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-white">Our Office</h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {OFFICE_ADDRESS}
          </p>
          <div className="mt-auto pt-6">
            <a
              href={MAPS_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                cardBtn,
                'border-violet-500 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-violet-600 dark:bg-violet-950/40 dark:text-violet-300 dark:hover:bg-violet-950/70'
              )}
            >
              Get Directions
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </article>

        <article className="flex min-h-[280px] flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:col-span-2 sm:p-6 lg:col-span-1">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Visit Our Office
              </h3>
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {OFFICE_ADDRESS}
              </p>
            </div>
          </div>

          <div className="relative mt-4 min-h-[160px] flex-1 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
            <iframe
              title="HireKarma Private Limited location"
              src={MAPS_EMBED_URL}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>

          <div className="mt-4">
            <a
              href={MAPS_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                cardBtn,
                'border-primary-500 bg-primary-50 text-primary-700 hover:bg-primary-100 dark:border-primary-600 dark:bg-primary-950/40 dark:text-primary-300 dark:hover:bg-primary-950/70'
              )}
            >
              Open in Maps
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </article>
      </section>
    </div>
  )
}
