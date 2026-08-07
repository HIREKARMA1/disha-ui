"use client"

import { cn } from "@/lib/utils"

export interface StickyFilterPanelProps {
  children: React.ReactNode
  /** Panel title shown in the sticky card header. */
  title?: string
  /** Optional clear action in the header. */
  onClear?: () => void
  clearLabel?: string
  className?: string
  /** Extra classes on the inner card. */
  cardClassName?: string
  /**
   * Offset from viewport top (accounts for fixed header).
   * Default matches app header (~5rem).
   */
  topClassName?: string
  /** Max height so panel scrolls within viewport without covering footer. */
  maxHeightClassName?: string
}

/**
 * Desktop sticky filter shell. Hidden below `lg` — pair with MobileFilterBottomSheet.
 * Stays visible while the content column scrolls; scrolls independently if tall.
 */
export function StickyFilterPanel({
  children,
  title = "Filters",
  onClear,
  clearLabel = "Clear All",
  className,
  cardClassName,
  topClassName = "top-20",
  maxHeightClassName = "max-h-[calc(100vh-5.5rem)]",
}: StickyFilterPanelProps) {
  return (
    <aside
      className={cn(
        "sticky z-10 hidden self-start overflow-y-auto overscroll-contain lg:block",
        topClassName,
        maxHeightClassName,
        className
      )}
    >
      <div
        className={cn(
          "rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm",
          "dark:border-white/10 dark:bg-[#151b2b]/90",
          cardClassName
        )}
      >
        {(title || onClear) && (
          <div className="mb-4 flex items-center justify-between gap-2">
            {title ? (
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
            ) : (
              <span />
            )}
            {onClear ? (
              <button
                type="button"
                onClick={onClear}
                className="shrink-0 text-xs font-semibold text-blue-500 transition-colors hover:text-blue-400"
              >
                {clearLabel}
              </button>
            ) : null}
          </div>
        )}
        {children}
      </div>
    </aside>
  )
}
