"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

export interface MobileBottomNavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  shortLabel?: string
  active: boolean
  onNavigate?: () => void
}

export interface MobileBottomNavProps {
  items: MobileBottomNavItem[]
  /** Optional trailing action (e.g. More menu). */
  trailing?: React.ReactNode
  className?: string
  /** Floating pill style (corporate) vs edge-to-edge bar. */
  variant?: "bar" | "floating"
  "aria-label"?: string
}

/**
 * Shared mobile footer nav: 44px touch targets, safe-area, elevation, active state.
 */
export function MobileBottomNav({
  items,
  trailing,
  className,
  variant = "bar",
  "aria-label": ariaLabel = "Mobile navigation",
}: MobileBottomNavProps) {
  const inner = (
    <div
      className={cn(
        "flex w-full items-stretch justify-around gap-0.5 px-1",
        variant === "floating" ? "py-1.5" : "py-1"
      )}
    >
      {items.map((item) => {
        const Icon = item.icon
        const label = item.shortLabel ?? item.label
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => {
              if (!item.active) item.onNavigate?.()
            }}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "relative flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 transition-colors",
              item.active
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400"
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                item.active && "bg-blue-500/15 dark:bg-blue-500/20"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
            </span>
            <span className="max-w-full truncate px-0.5 text-[10px] font-medium leading-tight">
              {label}
            </span>
            {item.active ? (
              <span
                className="absolute bottom-0.5 h-0.5 w-4 rounded-full bg-blue-500"
                aria-hidden
              />
            ) : null}
          </Link>
        )
      })}
      {trailing}
    </div>
  )

  if (variant === "floating") {
    return (
      <nav
        aria-label={ariaLabel}
        className={cn(
          "lg:hidden fixed z-50 left-3 right-3",
          "bottom-[max(0.75rem,env(safe-area-inset-bottom))]",
          className
        )}
        style={{ touchAction: "none" }}
      >
        <div
          className={cn(
            "rounded-2xl border border-gray-200/80 bg-white/95 shadow-[0_-4px_24px_rgba(0,0,0,0.12)] backdrop-blur-md",
            "dark:border-white/10 dark:bg-[#0f1219]/95 dark:shadow-[0_10px_40px_rgba(0,0,0,0.55)]"
          )}
        >
          {inner}
        </div>
      </nav>
    )
  }

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "lg:hidden fixed bottom-0 left-0 right-0 z-50",
        "border-t border-gray-200/80 bg-white/95 backdrop-blur-md",
        "shadow-[0_-4px_20px_rgba(0,0,0,0.12)]",
        "dark:border-white/10 dark:bg-[#0f1219]/95 dark:shadow-[0_-4px_20px_rgba(0,0,0,0.35)]",
        "pb-safe",
        className
      )}
      style={{ touchAction: "none" }}
    >
      {inner}
    </nav>
  )
}

export function MobileBottomNavAction({
  label,
  icon: Icon,
  onClick,
  active,
}: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 transition-colors",
        active
          ? "text-blue-600 dark:text-blue-400"
          : "text-gray-500 dark:text-gray-400"
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
          active && "bg-blue-500/15 dark:bg-blue-500/20"
        )}
      >
        <Icon className="h-5 w-5 shrink-0" aria-hidden />
      </span>
      <span className="max-w-full truncate px-0.5 text-[10px] font-medium leading-tight">
        {label}
      </span>
    </button>
  )
}
