'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { sanitizeEventDescriptionHtml } from '@/lib/sanitizeHtml'
import type { FAQItem } from '@/types/contestEvent'

/**
 * Event details FAQ accordion. One question is open at a time.
 * Campus Drive details use this same component so the cards stay identical.
 */
export function EventFaqAccordion({ faqs }: { faqs: FAQItem[] }) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  if (!faqs.length) return null

  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => (
        <div
          key={faq.id || i}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <button
            type="button"
            className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-900/30 md:p-5"
            onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
          >
            <span className="min-w-0 flex-1 break-words pr-4 font-medium text-gray-900 dark:text-white">{faq.question}</span>
            {expandedFaq === i ? (
              <ChevronUp className="h-4 w-4 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            )}
          </button>
          {expandedFaq === i && (
            <div
              className="event-description-html prose prose-sm dark:prose-invert border-t border-gray-100 px-4 pb-4 pt-3 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400"
              dangerouslySetInnerHTML={{
                __html: sanitizeEventDescriptionHtml(faq.answer, ''),
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
