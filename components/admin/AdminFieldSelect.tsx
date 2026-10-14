'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Option {
  value: string
  label: string
}

export interface AdminFieldSelectProps {
  value?: string
  onValueChange: (value: string) => void
  options: Option[]
  placeholder?: string
  className?: string
  id?: string
  disabled?: boolean
}

/**
 * In-form anchored dropdown menu for admin forms.
 * Avoids Radix Select document.body portals which cause page scroll jumps
 * and positioning issues on long, scrollable admin pages.
 */
export function AdminFieldSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Select',
  className,
  id,
  disabled = false,
}: AdminFieldSelectProps) {
  const generatedId = useId()
  const listId = id ?? generatedId
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [openUpward, setOpenUpward] = useState(false)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const selected = options.find((option) => option.value === value)

  const toggle = () => {
    if (disabled) return
    setOpen((current) => {
      const next = !current
      if (next && rootRef.current) {
        const rect = rootRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        const spaceAbove = rect.top
        setOpenUpward(spaceBelow < 220 && spaceAbove > spaceBelow)
      }
      return next
    })
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={listId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${listId}-list`}
        disabled={disabled}
        onClick={toggle}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm text-gray-950 ring-offset-white transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-50 dark:ring-offset-gray-900',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
      >
        <span className={cn('line-clamp-1', !selected && 'text-gray-400 dark:text-gray-500')}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 opacity-50 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <ul
          id={`${listId}-list`}
          role="listbox"
          aria-labelledby={listId}
          className={cn(
            'absolute left-0 z-[80] max-h-[min(15rem,40vh)] w-full overflow-y-auto rounded-md border border-gray-200 bg-white py-1 text-gray-950 shadow-lg',
            'dark:border-gray-700 dark:bg-gray-800 dark:text-gray-50',
            openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    'flex min-h-10 w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                    isSelected && 'bg-primary-50 font-medium text-primary-900 dark:bg-gray-700/60 dark:text-gray-50'
                  )}
                  onClick={() => {
                    onValueChange(option.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400',
                      isSelected ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className="min-w-0">{option.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
