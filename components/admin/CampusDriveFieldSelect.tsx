'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Option {
  value: string
  label: string
}

interface CampusDriveFieldSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: Option[]
  id?: string
}

/**
 * In-form menu for the Campus Drive create/edit form.
 * The shared Select portals to the document and focuses the highlighted option
 * with scrollIntoView. Inside a long page that scrolls the window to the top
 * and, with the trigger-height viewport, hides the options.
 * This menu stays anchored to the field and does not move the page.
 */
export function CampusDriveFieldSelect({
  value,
  onValueChange,
  options,
  id,
}: CampusDriveFieldSelectProps) {
  const generatedId = useId()
  const listId = id ?? generatedId
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [openUpward, setOpenUpward] = useState(false)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
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
        onClick={toggle}
        className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm text-gray-950 ring-offset-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-50 dark:ring-offset-gray-900"
      >
        <span className="line-clamp-1">{selected?.label ?? 'Select'}</span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>
      {open && (
        <ul
          id={`${listId}-list`}
          role="listbox"
          aria-labelledby={listId}
          className={cn(
            'absolute left-0 z-[80] max-h-[min(15rem,40vh)] w-full overflow-y-auto rounded-md border border-gray-200 bg-white py-1 text-gray-950 shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-50',
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
                    'flex min-h-10 w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700',
                    isSelected && 'bg-gray-50 dark:bg-gray-700/60'
                  )}
                  onClick={() => {
                    onValueChange(option.value)
                    setOpen(false)
                  }}
                >
                  <Check className={cn('h-4 w-4 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')} />
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
