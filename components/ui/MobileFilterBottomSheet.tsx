"use client"

import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BottomSheet } from "@/components/ui/BottomSheet"
import { cn } from "@/lib/utils"

export interface MobileFilterBottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  children: React.ReactNode
  onApply: () => void
  onClear: () => void
  /** Active filter count badge on the trigger button. */
  activeCount?: number
  applyLabel?: string
  clearLabel?: string
  triggerClassName?: string
  /** Hide the built-in trigger (caller renders their own). */
  hideTrigger?: boolean
  className?: string
}

/**
 * Lakshya-style mobile filter UX: single Filter button + bottom sheet.
 * Desktop callers should not render this (wrap with `lg:hidden`).
 */
export function MobileFilterBottomSheet({
  open,
  onOpenChange,
  title = "Filters",
  children,
  onApply,
  onClear,
  activeCount = 0,
  applyLabel = "Apply Filters",
  clearLabel = "Clear All",
  triggerClassName,
  hideTrigger = false,
  className,
}: MobileFilterBottomSheetProps) {
  return (
    <>
      {!hideTrigger && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpenChange(true)}
          className={cn(
            "relative h-9 shrink-0 rounded-lg border-gray-200 px-3 dark:border-white/10 lg:hidden",
            triggerClassName
          )}
          aria-label={title}
        >
          <Filter className="h-4 w-4" />
          <span className="ml-1.5 text-xs font-medium">Filter</span>
          {activeCount > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          ) : null}
        </Button>
      )}

      <BottomSheet
        open={open}
        onClose={() => onOpenChange(false)}
        title={title}
        className={className}
        footer={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClear()
              }}
              className="h-11 flex-1 rounded-xl border-gray-200 dark:border-white/10"
            >
              {clearLabel}
            </Button>
            <Button
              type="button"
              onClick={() => {
                onApply()
                onOpenChange(false)
              }}
              className="h-11 flex-1 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-500"
            >
              {applyLabel}
            </Button>
          </div>
        }
      >
        {children}
      </BottomSheet>
    </>
  )
}
