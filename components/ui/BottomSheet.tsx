"use client"

import { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import {
  AnimatePresence,
  motion,
  useDragControls,
  type PanInfo,
} from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  /** Optional footer pinned below scrollable body (e.g. Apply / Clear). */
  footer?: React.ReactNode
  className?: string
  /** Max height of the sheet (CSS value). Default ~88vh. */
  maxHeight?: string
}

const DISMISS_OFFSET_PX = 120
const DISMISS_VELOCITY = 600

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
  className,
  maxHeight = "min(88vh, 720px)",
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(false)
  const dragControls = useDragControls()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onClose])

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.offset.y > DISMISS_OFFSET_PX || info.velocity.y > DISMISS_VELOCITY) {
        onClose()
      }
    },
    [onClose]
  )

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center lg:hidden"
          role="presentation"
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title || "Bottom sheet"}
            className={cn(
              "relative z-10 flex w-full flex-col rounded-t-2xl border border-gray-200/80 bg-white shadow-2xl",
              "dark:border-white/10 dark:bg-[#151b2b]",
              "pb-[env(safe-area-inset-bottom)]",
              className
            )}
            style={{ maxHeight }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 360 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.55 }}
            onDragEnd={handleDragEnd}
          >
            <div
              className="flex shrink-0 touch-none flex-col items-center pt-3 pb-2"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div
                className="mb-2 h-1.5 w-10 rounded-full bg-gray-300 dark:bg-white/20"
                aria-hidden="true"
              />
              <div className="flex w-full items-center justify-between gap-3 px-4">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  {title || "Filters"}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-3">
              {children}
            </div>

            {footer ? (
              <div className="shrink-0 border-t border-gray-200/80 px-4 py-3 dark:border-white/10">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
