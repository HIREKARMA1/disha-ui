'use client'

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Megaphone, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EventPopupCard } from '@/components/events/EventPopupCard'
import { useEventPopup } from '@/hooks/useEventPopup'
import { cn } from '@/lib/utils'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

interface EventPopupProps {
  /** When false, skip fetch/render (e.g. non-home dashboard routes). Default true. */
  enabled?: boolean
  className?: string
}

export function EventPopup({ enabled = true, className }: EventPopupProps) {
  const { events, isOpen, close } = useEventPopup(enabled)
  const [activeIndex, setActiveIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const descId = useId()

  const count = events.length
  const safeIndex = count > 0 ? Math.min(activeIndex, count - 1) : 0
  const currentEvent = count > 0 ? events[safeIndex] : null
  const hasCarousel = count > 1

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(0)
    }
  }, [isOpen, events])

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (count === 0 ? 0 : (i - 1 + count) % count))
  }, [count])

  const goNext = useCallback(() => {
    setActiveIndex((i) => (count === 0 ? 0 : (i + 1) % count))
  }, [count])

  // Body scroll lock + restore focus
  useEffect(() => {
    if (!isOpen) return

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'

    const frame = requestAnimationFrame(() => {
      closeButtonRef.current?.focus()
    })

    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = ''
      previouslyFocusedRef.current?.focus?.()
    }
  }, [isOpen])

  // ESC to close
  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, close])

  const trapFocus = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !dialogRef.current) return

    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null)

    if (focusable.length === 0) {
      e.preventDefault()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement as HTMLElement | null

    if (e.shiftKey) {
      if (active === first || !dialogRef.current.contains(active)) {
        e.preventDefault()
        last.focus()
      }
    } else if (active === last) {
      e.preventDefault()
      first.focus()
    }
  }

  if (!mounted || !enabled || !isOpen || !currentEvent) {
    return null
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && currentEvent && (
        <div
          className={cn(
            'fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4',
            className
          )}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            tabIndex={-1}
            onKeyDown={trapFocus}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={cn(
              'relative z-10 flex max-h-[min(85vh,560px)] w-full max-w-sm flex-col overflow-hidden',
              'rounded-xl border border-gray-200/80 bg-white shadow-2xl',
              'dark:border-gray-700/80 dark:bg-gray-900',
              'sm:max-w-md'
            )}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200/80 px-3 py-2 dark:border-gray-700/80 sm:px-4">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-sm">
                  <Megaphone className="h-3.5 w-3.5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h2
                    id={titleId}
                    className="truncate text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    Event Announcement
                  </h2>
                  <p
                    id={descId}
                    className="truncate text-[11px] text-gray-500 dark:text-gray-400"
                  >
                    {hasCarousel
                      ? `${safeIndex + 1} of ${count} active events`
                      : 'Don\'t miss this opportunity'}
                  </p>
                </div>
              </div>

              <Button
                ref={closeButtonRef}
                type="button"
                variant="ghost"
                size="icon"
                onClick={close}
                className="h-8 w-8 shrink-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close event announcement"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Carousel content */}
            <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentEvent.id}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.2 }}
                >
                  <EventPopupCard event={currentEvent} onNavigate={close} />
                </motion.div>
              </AnimatePresence>

              {hasCarousel && (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={goPrev}
                    className="absolute left-1.5 top-14 z-10 h-8 w-8 rounded-full border border-white/40 bg-white/95 shadow-md backdrop-blur-sm hover:bg-white sm:left-2 dark:bg-gray-800/95"
                    aria-label="Previous event"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={goNext}
                    className="absolute right-1.5 top-14 z-10 h-8 w-8 rounded-full border border-white/40 bg-white/95 shadow-md backdrop-blur-sm hover:bg-white sm:right-2 dark:bg-gray-800/95"
                    aria-label="Next event"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {hasCarousel && (
              <div
                className="flex shrink-0 items-center justify-center gap-1.5 border-t border-gray-200/80 py-2 dark:border-gray-700/80"
                role="tablist"
                aria-label="Event slides"
              >
                {events.map((event, index) => (
                  <button
                    key={event.id}
                    type="button"
                    role="tab"
                    aria-selected={index === safeIndex}
                    aria-label={`Show event ${index + 1}: ${event.title}`}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      'h-2 rounded-full transition-all duration-200',
                      index === safeIndex
                        ? 'w-6 bg-primary-500'
                        : 'w-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500'
                    )}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
