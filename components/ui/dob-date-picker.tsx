'use client'

/**
 * Birth-date picker with year/month dropdowns (better than scrolling months).
 * Portals the panel so it works inside overflow-hidden modals.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface DobDatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  /** Inclusive lower bound. Defaults to today − 100 years. */
  minDate?: Date
  /** Inclusive upper bound. Defaults to today − 16 years. */
  maxDate?: Date
  error?: boolean
}

type PanelPosition = { top: number; left: number }

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function defaultMinDate() {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 100)
  return startOfDay(d)
}

function defaultMaxDate() {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 16)
  return startOfDay(d)
}

function parseYmd(value: string): Date | null {
  if (!value) return null
  const [yStr, mStr, dStr] = value.split('-')
  const y = parseInt(yStr, 10)
  const m = parseInt(mStr, 10)
  const d = parseInt(dStr, 10)
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null
  const date = new Date(y, m - 1, d)
  if (isNaN(date.getTime())) return null
  return date
}

function formatYmd(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate()
}

function buildCalendarDays(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1)
  const total = daysInMonth(year, monthIndex)
  const startPad = first.getDay()
  const cells: (Date | null)[] = []
  for (let i = 0; i < startPad; i++) cells.push(null)
  for (let day = 1; day <= total; day++) {
    cells.push(new Date(year, monthIndex, day))
  }
  return cells
}

export function DobDatePicker({
  value,
  onChange,
  placeholder = 'Select date of birth',
  className,
  disabled = false,
  minDate: minDateProp,
  maxDate: maxDateProp,
  error = false,
}: DobDatePickerProps) {
  const minDate = useMemo(
    () => startOfDay(minDateProp ?? defaultMinDate()),
    [minDateProp]
  )
  const maxDate = useMemo(
    () => startOfDay(maxDateProp ?? defaultMaxDate()),
    [maxDateProp]
  )

  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(() =>
    parseYmd(value)
  )
  const [viewYear, setViewYear] = useState(() => {
    const parsed = parseYmd(value)
    return parsed?.getFullYear() ?? maxDate.getFullYear()
  })
  const [viewMonth, setViewMonth] = useState(() => {
    const parsed = parseYmd(value)
    return parsed?.getMonth() ?? maxDate.getMonth()
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const parsed = parseYmd(value)
    setSelectedDate(parsed)
    if (parsed) {
      setViewYear(parsed.getFullYear())
      setViewMonth(parsed.getMonth())
    }
  }, [value])

  const yearOptions = useMemo(() => {
    const maxY = maxDate.getFullYear()
    const minY = minDate.getFullYear()
    const years: number[] = []
    for (let y = maxY; y >= minY; y--) years.push(y)
    return years
  }, [minDate, maxDate])

  const monthOptions = useMemo(() => {
    return MONTH_NAMES.map((label, index) => {
      const monthStart = startOfDay(new Date(viewYear, index, 1))
      const monthEnd = startOfDay(new Date(viewYear, index + 1, 0))
      const disabledMonth =
        monthEnd.getTime() < minDate.getTime() ||
        monthStart.getTime() > maxDate.getTime()
      return { label, index, disabled: disabledMonth }
    })
  }, [viewYear, minDate, maxDate])

  const isDisabledDay = useCallback(
    (date: Date) => {
      const t = startOfDay(date).getTime()
      return t < minDate.getTime() || t > maxDate.getTime()
    },
    [minDate, maxDate]
  )

  const updatePanelPosition = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const panelWidth = 320
    const panelHeight = 380
    const left = Math.min(
      Math.max(8, rect.left),
      Math.max(8, window.innerWidth - panelWidth - 8)
    )
    let top = rect.bottom + 8
    if (top + panelHeight > window.innerHeight - 8) {
      top = Math.max(8, rect.top - panelHeight - 8)
    }
    setPanelPosition({ top, left })
  }, [])

  useLayoutEffect(() => {
    if (!isOpen) {
      setPanelPosition(null)
      return
    }
    updatePanelPosition()
  }, [isOpen, updatePanelPosition])

  useEffect(() => {
    if (!isOpen) return
    const onReposition = () => updatePanelPosition()
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)
    return () => {
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [isOpen, updatePanelPosition])

  useEffect(() => {
    if (!isOpen) return
    const onOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        containerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return
      }
      setIsOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [isOpen])

  const displayValue = selectedDate
    ? selectedDate.toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : ''

  const handleSelectDay = (date: Date) => {
    if (isDisabledDay(date)) return
    setSelectedDate(date)
    onChange(formatYmd(date))
    setIsOpen(false)
  }

  const handleClear = () => {
    setSelectedDate(null)
    onChange('')
    setIsOpen(false)
  }

  const shiftMonth = (dir: -1 | 1) => {
    const next = new Date(viewYear, viewMonth + dir, 1)
    const y = next.getFullYear()
    const m = next.getMonth()
    if (y < minDate.getFullYear() || y > maxDate.getFullYear()) return
    const monthStart = startOfDay(new Date(y, m, 1))
    const monthEnd = startOfDay(new Date(y, m + 1, 0))
    if (
      monthEnd.getTime() < minDate.getTime() ||
      monthStart.getTime() > maxDate.getTime()
    ) {
      return
    }
    setViewYear(y)
    setViewMonth(m)
  }

  const calendarDays = buildCalendarDays(viewYear, viewMonth)

  const panel =
    isOpen && mounted && panelPosition
      ? createPortal(
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              top: panelPosition.top,
              left: panelPosition.left,
            }}
            className="z-[300] w-[320px] rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl dark:border-gray-700 dark:bg-[#151b2b]"
            role="dialog"
            aria-label="Select date of birth"
          >
            <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-2 dark:border-white/10">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-white">
                <Calendar className="h-4 w-4 text-blue-500" />
                Date of birth
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 rounded-full p-0 hover:bg-gray-100 dark:hover:bg-white/10"
                aria-label="Close calendar"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="mb-3 grid grid-cols-[1fr_auto_auto] gap-2">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="h-9 w-full rounded-lg border border-gray-200 bg-white px-2 text-sm font-medium text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                aria-label="Month"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.index} value={opt.index} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="h-9 min-w-[5.5rem] rounded-lg border border-gray-200 bg-white px-2 text-sm font-medium text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                aria-label="Year"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <div className="flex gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => shiftMonth(-1)}
                  className="h-9 w-8 rounded-lg p-0 hover:bg-gray-100 dark:hover:bg-white/10"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => shiftMonth(1)}
                  className="h-9 w-8 rounded-lg p-0 hover:bg-gray-100 dark:hover:bg-white/10"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-0.5 text-center">
              {DAY_NAMES.map((d) => (
                <div
                  key={d}
                  className="py-1 text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={`pad-${index}`} className="h-9 w-full" />
                }
                const disabledDay = isDisabledDay(date)
                const selected =
                  selectedDate &&
                  date.toDateString() === selectedDate.toDateString()
                return (
                  <button
                    key={formatYmd(date)}
                    type="button"
                    disabled={disabledDay}
                    onClick={() => handleSelectDay(date)}
                    className={cn(
                      'flex h-9 w-full items-center justify-center rounded-lg text-sm font-semibold transition-colors',
                      disabledDay &&
                        'cursor-not-allowed text-gray-300 opacity-40 dark:text-gray-600',
                      !disabledDay &&
                        selected &&
                        'bg-blue-600 text-white shadow-md shadow-blue-500/20',
                      !disabledDay &&
                        !selected &&
                        'text-gray-700 hover:bg-blue-50 dark:text-gray-200 dark:hover:bg-white/10'
                    )}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-white/10">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-8 px-2 text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              >
                Clear
              </Button>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                Ages 16–100
              </p>
            </div>
          </motion.div>,
          document.body
        )
      : null

  return (
    <div ref={containerRef} className="relative">
      <div ref={triggerRef} className="relative">
        <Input
          type="text"
          value={displayValue}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((open) => !open)}
          className={cn(
            'h-10 cursor-pointer rounded-lg border bg-white pr-10 text-sm text-gray-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-800 dark:text-white',
            error
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-600',
            className
          )}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        />
        <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
      {panel}
    </div>
  )
}
