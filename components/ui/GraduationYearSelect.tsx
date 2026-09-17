'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BottomSheet } from '@/components/ui/BottomSheet'

interface GraduationYearSelectProps {
  value: string
  onChange: (year: string) => void
  years: number[]
  placeholder?: string
  required?: boolean
  className?: string
}

type MenuPos = { top: number; left: number; width: number; maxHeight: number }

export function GraduationYearSelect({
  value,
  onChange,
  years,
  placeholder = 'Select graduation year',
  required = false,
  className,
}: GraduationYearSelectProps) {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const updateMenuPos = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const gap = 4
    const spaceBelow = window.innerHeight - rect.bottom - gap - 16
    const spaceAbove = rect.top - gap - 16
    const preferBelow = spaceBelow >= 160 || spaceBelow >= spaceAbove
    const maxHeight = Math.min(256, Math.max(140, preferBelow ? spaceBelow : spaceAbove))
    const top = preferBelow
      ? rect.bottom + gap
      : Math.max(8, rect.top - gap - maxHeight)

    setMenuPos({
      top,
      left: rect.left,
      width: rect.width,
      maxHeight,
    })
  }, [])

  useLayoutEffect(() => {
    if (!open || isMobile) {
      setMenuPos(null)
      return
    }
    updateMenuPos()
    const onScrollOrResize = () => updateMenuPos()
    window.addEventListener('resize', onScrollOrResize)
    window.addEventListener('scroll', onScrollOrResize, true)
    return () => {
      window.removeEventListener('resize', onScrollOrResize)
      window.removeEventListener('scroll', onScrollOrResize, true)
    }
  }, [open, isMobile, updateMenuPos])

  useEffect(() => {
    if (!open || isMobile) return
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, isMobile])

  useEffect(() => {
    if (!open || !value) return
    const selected = listRef.current?.querySelector<HTMLElement>('[data-selected="true"]')
    selected?.scrollIntoView({ block: 'nearest' })
  }, [open, value])

  const handleSelect = (year: string) => {
    onChange(year)
    setOpen(false)
  }

  const yearList = (
    <div ref={listRef} className="py-1" role="listbox" aria-label="Graduation year">
      {years.map((year) => {
        const yearStr = String(year)
        const selected = value === yearStr
        return (
          <button
            key={year}
            type="button"
            role="option"
            aria-selected={selected}
            data-selected={selected ? 'true' : undefined}
            onClick={() => handleSelect(yearStr)}
            className={cn(
              'flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors',
              'min-h-[44px] touch-manipulation',
              selected
                ? 'bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : 'text-gray-800 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-white/5'
            )}
          >
            <span>{year}</span>
            {selected ? <Check className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" /> : null}
          </button>
        )
      })}
    </div>
  )

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup={isMobile ? 'dialog' : 'listbox'}
        aria-expanded={open}
        aria-required={required}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm',
          'text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'dark:border-gray-600 dark:bg-gray-700 dark:text-white',
          open && 'ring-2 ring-blue-500 border-transparent'
        )}
      >
        <span className={cn('truncate', !value && 'text-gray-500 dark:text-gray-400')}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={cn(
            'ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {/* Desktop: portaled menu stays inside viewport with internal scroll */}
      {mounted && !isMobile && open && menuPos &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: menuPos.top,
              left: menuPos.left,
              width: menuPos.width,
              maxHeight: menuPos.maxHeight,
            }}
            className={cn(
              'z-[200] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg',
              'dark:border-gray-600 dark:bg-gray-800'
            )}
          >
            <div
              className="overflow-y-auto overscroll-contain"
              style={{ maxHeight: menuPos.maxHeight }}
            >
              {yearList}
            </div>
          </div>,
          document.body
        )}

      {/* Mobile: bottom sheet (viewport-safe, scrollable) */}
      {mounted && isMobile && (
        <BottomSheet
          open={open}
          onClose={() => setOpen(false)}
          title="Graduation year"
          maxHeight="min(70dvh, 480px)"
        >
          {yearList}
        </BottomSheet>
      )}
    </div>
  )
}
