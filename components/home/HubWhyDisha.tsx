'use client'

import { WHY_DISHA } from '@/data/why-disha'

export function HubWhyDisha() {
  const { title, tagline, intro, audiencesHeading, audiences } = WHY_DISHA

  return (
    <section id="hub-about" className="scroll-mt-28 space-y-8 sm:space-y-10">
      <div>
        <h2 className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-gray-900 dark:text-white sm:text-[22px]">
          <span className="h-5 w-1 shrink-0 rounded-sm bg-primary-500 sm:h-6" aria-hidden />
          {title}
        </h2>
        <p className="mt-2 pl-3.5 text-base font-semibold tracking-tight text-gray-800 dark:text-gray-100 sm:text-lg">
          {tagline}
        </p>
        <div className="mt-4 max-w-3xl space-y-3 pl-3.5">
          {intro.map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base font-bold tracking-tight text-gray-900 dark:text-white sm:text-lg">
          {audiencesHeading}
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {audiences.map((audience) => (
            <div
              key={audience.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-600 dark:text-primary-400">
                {audience.label}
              </p>
              <ul className="mt-4 space-y-4">
                {audience.benefits.map((benefit) => (
                  <li key={benefit.title}>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{benefit.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                      {benefit.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
