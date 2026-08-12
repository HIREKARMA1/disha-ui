"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

type TooltipSide = "top" | "bottom" | "left" | "right"

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  side?: TooltipSide
  /** Delay before showing on hover (ms). */
  delayMs?: number
  /** Disable the tooltip entirely. */
  disabled?: boolean
  className?: string
  /** Prefer info-icon trigger pattern on touch devices when true. */
  showInfoIcon?: boolean
  /** Accessible label for the info icon button. */
  infoLabel?: string
}

interface Coords {
  top: number
  left: number
}

const LONG_PRESS_MS = 450

function computePosition(
  rect: DOMRect,
  tipWidth: number,
  tipHeight: number,
  side: TooltipSide
): Coords {
  const gap = 8
  switch (side) {
    case "bottom":
      return {
        top: rect.bottom + gap,
        left: rect.left + rect.width / 2 - tipWidth / 2,
      }
    case "left":
      return {
        top: rect.top + rect.height / 2 - tipHeight / 2,
        left: rect.left - tipWidth - gap,
      }
    case "right":
      return {
        top: rect.top + rect.height / 2 - tipHeight / 2,
        left: rect.right + gap,
      }
    case "top":
    default:
      return {
        top: rect.top - tipHeight - gap,
        left: rect.left + rect.width / 2 - tipWidth / 2,
      }
  }
}

function clampToViewport(coords: Coords, tipWidth: number, tipHeight: number): Coords {
  const pad = 8
  const maxLeft = window.innerWidth - tipWidth - pad
  const maxTop = window.innerHeight - tipHeight - pad
  return {
    left: Math.min(Math.max(pad, coords.left), Math.max(pad, maxLeft)),
    top: Math.min(Math.max(pad, coords.top), Math.max(pad, maxTop)),
  }
}

/**
 * Accessible tooltip: hover on desktop, long-press on touch.
 * Optional info icon avoids conflicting with tap targets on mobile.
 */
export function Tooltip({
  content,
  children,
  side = "top",
  delayMs = 280,
  disabled = false,
  className,
  showInfoIcon = false,
  infoLabel = "More info",
}: TooltipProps) {
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const tipRef = React.useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = React.useState(false)
  const [coords, setCoords] = React.useState<Coords>({ top: 0, left: 0 })
  const [mounted, setMounted] = React.useState(false)
  const hoverTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const pressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const clearTimers = React.useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    if (pressTimer.current) clearTimeout(pressTimer.current)
    hoverTimer.current = null
    pressTimer.current = null
  }, [])

  const updatePosition = React.useCallback(() => {
    const el = triggerRef.current
    const tip = tipRef.current
    if (!el || !tip) return
    const rect = el.getBoundingClientRect()
    const tipRect = tip.getBoundingClientRect()
    const raw = computePosition(rect, tipRect.width, tipRect.height, side)
    setCoords(clampToViewport(raw, tipRect.width, tipRect.height))
  }, [side])

  React.useLayoutEffect(() => {
    if (!open) return
    updatePosition()
    const onScroll = () => updatePosition()
    window.addEventListener("scroll", onScroll, true)
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll, true)
      window.removeEventListener("resize", onScroll)
    }
  }, [open, updatePosition, content])

  React.useEffect(() => () => clearTimers(), [clearTimers])

  const show = React.useCallback(() => {
    if (disabled || !content) return
    setOpen(true)
  }, [disabled, content])

  const hide = React.useCallback(() => {
    clearTimers()
    setOpen(false)
  }, [clearTimers])

  const scheduleShow = React.useCallback(() => {
    if (disabled || !content) return
    clearTimers()
    hoverTimer.current = setTimeout(show, delayMs)
  }, [clearTimers, delayMs, disabled, content, show])

  const child = React.Children.only(children)

  const childProps = {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node
      const existingRef = (child as React.ReactElement & { ref?: React.Ref<HTMLElement> }).ref
      if (typeof existingRef === "function") existingRef(node)
      else if (existingRef && typeof existingRef === "object") {
        ;(existingRef as React.MutableRefObject<HTMLElement | null>).current = node
      }
    },
    onMouseEnter: (e: React.MouseEvent) => {
      child.props.onMouseEnter?.(e)
      scheduleShow()
    },
    onMouseLeave: (e: React.MouseEvent) => {
      child.props.onMouseLeave?.(e)
      hide()
    },
    onFocus: (e: React.FocusEvent) => {
      child.props.onFocus?.(e)
      scheduleShow()
    },
    onBlur: (e: React.FocusEvent) => {
      child.props.onBlur?.(e)
      hide()
    },
    onTouchStart: (e: React.TouchEvent) => {
      child.props.onTouchStart?.(e)
      if (showInfoIcon) return
      clearTimers()
      pressTimer.current = setTimeout(() => {
        show()
      }, LONG_PRESS_MS)
    },
    onTouchEnd: (e: React.TouchEvent) => {
      child.props.onTouchEnd?.(e)
      if (pressTimer.current) {
        clearTimeout(pressTimer.current)
        pressTimer.current = null
      }
      // Keep open briefly after long-press so user can read
      if (open) {
        setTimeout(hide, 1800)
      }
    },
    onTouchMove: (e: React.TouchEvent) => {
      child.props.onTouchMove?.(e)
      if (pressTimer.current) {
        clearTimeout(pressTimer.current)
        pressTimer.current = null
      }
    },
    "aria-describedby": open ? "hk-tooltip" : undefined,
  }

  const cloned = React.cloneElement(child, childProps)

  const tipNode =
    mounted && open && content
      ? createPortal(
          <div
            ref={tipRef}
            id="hk-tooltip"
            role="tooltip"
            style={{ top: coords.top, left: coords.left }}
            className={cn(
              "pointer-events-none fixed z-[120] max-w-[240px] rounded-lg px-2.5 py-1.5 text-xs font-medium leading-snug shadow-lg",
              "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900",
              "opacity-100 transition-opacity duration-150",
              className
            )}
          >
            {content}
          </div>,
          document.body
        )
      : null

  if (showInfoIcon) {
    return (
      <span className="inline-flex items-center gap-1">
        {cloned}
        <button
          type="button"
          aria-label={infoLabel}
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-gray-200"
          onClick={(e) => {
            e.stopPropagation()
            if (open) hide()
            else {
              triggerRef.current = e.currentTarget
              show()
            }
          }}
          onBlur={hide}
        >
          <span className="text-[11px] font-bold leading-none" aria-hidden>
            i
          </span>
        </button>
        {tipNode}
      </span>
    )
  }

  return (
    <>
      {cloned}
      {tipNode}
    </>
  )
}
