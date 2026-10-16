'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { GalleryItem } from '@/types/contestEvent'

interface PhotoGallerySectionProps {
  photos?: GalleryItem[] | null
  className?: string
  sectionId?: string
  sectionRef?: (element: HTMLElement | null) => void
}

export function PhotoGallerySection({ photos, className, sectionId, sectionRef }: PhotoGallerySectionProps) {
  const [failed, setFailed] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const items = useMemo(
    () => (photos || []).filter((photo) => photo.image_url && !failed.includes(photo.image_url)),
    [photos, failed]
  )

  if (items.length === 0) return null

  const active = activeIndex === null ? null : items[activeIndex]

  return (
    <section id={sectionId} ref={sectionRef} className={className}>
      <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white md:mb-4 md:text-xl">Gallery</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((photo, index) => (
          <button
            key={photo.id || photo.image_url}
            type="button"
            className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-800 md:rounded-xl"
            onClick={() => setActiveIndex(index)}
          >
            <img
              src={photo.image_url}
              alt={photo.caption || `Gallery photo ${index + 1}`}
              className="max-h-full max-w-full object-contain"
              onError={() => setFailed((current) => (current.includes(photo.image_url) ? current : [...current, photo.image_url]))}
            />
          </button>
        ))}
      </div>

      {active && activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Gallery photo"
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white"
            onClick={() => setActiveIndex(null)}
            aria-label="Close gallery"
          >
            <X className="h-5 w-5" />
          </button>
          {items.length > 1 && (
            <button
              type="button"
              className="absolute left-3 rounded-full bg-white/15 p-2 text-white sm:left-6"
              onClick={(event) => {
                event.stopPropagation()
                setActiveIndex((activeIndex - 1 + items.length) % items.length)
              }}
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          <img
            src={active.image_url}
            alt={active.caption || `Gallery photo ${activeIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain"
            onClick={(event) => event.stopPropagation()}
          />
          {items.length > 1 && (
            <button
              type="button"
              className="absolute right-3 rounded-full bg-white/15 p-2 text-white sm:right-6"
              onClick={(event) => {
                event.stopPropagation()
                setActiveIndex((activeIndex + 1) % items.length)
              }}
              aria-label="Next photo"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </section>
  )
}
