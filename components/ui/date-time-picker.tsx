"use client"

import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, X, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface DateTimePickerProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    disabled?: boolean
    autoClose?: boolean
    showTime?: boolean
    /** When true, past calendar days and past times (for today) cannot be selected. */
    disablePast?: boolean
    /** Inclusive lower bound (start of day). Dates before this cannot be selected. */
    minDate?: Date
    /** Inclusive upper bound (start of day). Dates after this cannot be selected. */
    maxDate?: Date
    /**
     * Calendar popover placement relative to the input.
     * - below (default): always open under the input (existing behavior)
     * - above: always open above the input
     * - auto: open below when space allows; otherwise flip above to avoid clipping
     */
    placement?: 'below' | 'above' | 'auto'
}

type PanelPosition = {
    top: number
    left: number
}

export function DateTimePicker({
    value,
    onChange,
    placeholder = "Select date",
    className,
    disabled,
    autoClose = true,
    showTime = false,
    disablePast = false,
    minDate,
    maxDate,
    placement = 'below',
}: DateTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [openAbove, setOpenAbove] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [mounted, setMounted] = useState(false)
    const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null)

    // Time picker states
    const [hour, setHour] = useState(12)
    const [minute, setMinute] = useState(0)
    const [period, setPeriod] = useState<'AM' | 'PM'>('AM')

    const containerRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLDivElement>(null)
    const panelRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    const estimatePanelHeight = () => (showTime ? 380 : 360)

    const shouldOpenAbove = () => {
        if (placement === 'above') return true
        if (placement !== 'auto') return false
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return false
        const gap = 8
        const panelHeight = estimatePanelHeight()
        const spaceBelow = window.innerHeight - rect.bottom - gap
        const spaceAbove = rect.top - gap
        return spaceBelow < panelHeight && spaceAbove >= spaceBelow
    }

    const openPicker = () => {
        if (disabled) return
        setOpenAbove(shouldOpenAbove())
        setIsOpen(true)
    }

    const togglePicker = () => {
        if (disabled) return
        if (isOpen) {
            setIsOpen(false)
            return
        }
        openPicker()
    }

    // Keep auto placement correct on resize/scroll while open
    useEffect(() => {
        if (!isOpen || placement !== 'auto') return

        const updatePlacement = () => {
            setOpenAbove(shouldOpenAbove())
        }

        updatePlacement()
        window.addEventListener('resize', updatePlacement)
        window.addEventListener('scroll', updatePlacement, true)
        return () => {
            window.removeEventListener('resize', updatePlacement)
            window.removeEventListener('scroll', updatePlacement, true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-bind while open / placement mode
    }, [isOpen, placement, showTime])

    // Robust parsing of initial value (timezone-agnostic manual parsing)
    useEffect(() => {
        if (value) {
            const parts = value.split('T')
            const datePart = parts[0]
            const timePart = parts[1] || ''

            const [yStr, mStr, dStr] = datePart.split('-')
            const y = parseInt(yStr, 10)
            const m = parseInt(mStr, 10)
            const d = parseInt(dStr, 10)
            const parsedDate =
                !isNaN(y) && !isNaN(m) && !isNaN(d)
                    ? new Date(y, m - 1, d)
                    : new Date(datePart)
            if (!isNaN(parsedDate.getTime())) {
                setSelectedDate(parsedDate)
                setCurrentMonth(parsedDate)
            }

            if (showTime && timePart) {
                const [hStr, mStr2] = timePart.split(':')
                const h24 = parseInt(hStr, 10)
                const mins = parseInt(mStr2, 10)
                if (!isNaN(h24) && !isNaN(mins)) {
                    setHour(h24 % 12 || 12)
                    setMinute(mins)
                    setPeriod(h24 >= 12 ? 'PM' : 'AM')
                }
            }
        } else {
            setSelectedDate(null)
        }
    }, [value, showTime])

    const updatePanelPosition = useCallback(() => {
        const trigger = triggerRef.current
        if (!trigger) return
        const rect = trigger.getBoundingClientRect()
        const panelWidth = showTime ? 420 : 280
        const left = Math.min(
            Math.max(8, rect.left),
            Math.max(8, window.innerWidth - panelWidth - 8)
        )
        let top = rect.bottom + 8
        const estimatedHeight = showTime ? 360 : 340
        if (top + estimatedHeight > window.innerHeight - 8) {
            top = Math.max(8, rect.top - estimatedHeight - 8)
        }
        setPanelPosition({ top, left })
    }, [showTime])

    useLayoutEffect(() => {
        if (!isOpen) {
            setPanelPosition(null)
            return
        }
        updatePanelPosition()
    }, [isOpen, updatePanelPosition])

    useEffect(() => {
        if (!isOpen) return
        const handleReposition = () => updatePanelPosition()
        window.addEventListener('resize', handleReposition)
        window.addEventListener('scroll', handleReposition, true)
        return () => {
            window.removeEventListener('resize', handleReposition)
            window.removeEventListener('scroll', handleReposition, true)
        }
    }, [isOpen, updatePanelPosition])

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node
            if (
                containerRef.current?.contains(target) ||
                panelRef.current?.contains(target)
            ) {
                return
            }
            setIsOpen(false)
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const formatDisplayValue = () => {
        if (!selectedDate) return ''

        const dateStr = selectedDate.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        })

        if (!showTime) return dateStr

        const pad = (n: number) => String(n).padStart(2, '0')
        return `${dateStr}, ${pad(hour)}:${pad(minute)} ${period}`
    }

    const formatDateValue = (date: Date, h: number, m: number, p: 'AM' | 'PM') => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')

        if (!showTime) {
            return `${year}-${month}-${day}`
        }

        let hours24 = h
        if (p === 'PM' && h < 12) hours24 = h + 12
        if (p === 'AM' && h === 12) hours24 = 0

        const hrsStr = String(hours24).padStart(2, '0')
        const minsStr = String(m).padStart(2, '0')

        return `${year}-${month}-${day}T${hrsStr}:${minsStr}`
    }

    const startOfDay = (date: Date) => {
        const d = new Date(date)
        d.setHours(0, 0, 0, 0)
        return d
    }

    const isToday = (date: Date) => {
        const today = new Date()
        return date.toDateString() === today.toDateString()
    }

    const isOutOfRange = (date: Date) => {
        const day = startOfDay(date).getTime()
        if (minDate && day < startOfDay(minDate).getTime()) return true
        if (maxDate && day > startOfDay(maxDate).getTime()) return true
        return false
    }

    const isPastDate = (date: Date) => {
        if (!disablePast) return false
        return startOfDay(date).getTime() < startOfDay(new Date()).getTime()
    }

    const isDisabledDate = (date: Date) => isPastDate(date) || isOutOfRange(date)

    const toMinutes = (h12: number, m: number, p: 'AM' | 'PM') => {
        let h24 = h12
        if (p === 'PM' && h12 < 12) h24 = h12 + 12
        if (p === 'AM' && h12 === 12) h24 = 0
        return h24 * 60 + m
    }

    const isPastDateTime = (date: Date, h12: number, m: number, p: 'AM' | 'PM') => {
        if (!disablePast) return false
        if (isPastDate(date)) return true
        if (!isToday(date) || !showTime) return false
        const now = new Date()
        const selectedMins = toMinutes(h12, m, p)
        const nowMins = now.getHours() * 60 + now.getMinutes()
        return selectedMins < nowMins
    }

    const handleDateSelect = (date: Date) => {
        if (isDisabledDate(date)) return
        setSelectedDate(date)
        if (showTime) {
            let nextH = hour
            let nextM = minute
            let nextP = period
            if (disablePast && isToday(date) && isPastDateTime(date, hour, minute, period)) {
                const now = new Date()
                const h = now.getHours()
                nextM = now.getMinutes()
                nextP = h >= 12 ? 'PM' : 'AM'
                nextH = h % 12 || 12
                setHour(nextH)
                setMinute(nextM)
                setPeriod(nextP)
            }
            onChange(formatDateValue(date, nextH, nextM, nextP))
        } else {
            onChange(formatDateValue(date, 12, 0, 'AM'))
            if (autoClose) {
                setIsOpen(false)
            }
        }
    }

    const handleHourSelect = (h: number) => {
        if (selectedDate && isPastDateTime(selectedDate, h, minute, period)) return
        setHour(h)
        if (selectedDate) {
            onChange(formatDateValue(selectedDate, h, minute, period))
        }
    }

    const handleMinuteSelect = (m: number) => {
        if (selectedDate && isPastDateTime(selectedDate, hour, m, period)) return
        setMinute(m)
        if (selectedDate) {
            onChange(formatDateValue(selectedDate, hour, m, period))
        }
    }

    const handlePeriodSelect = (p: 'AM' | 'PM') => {
        if (selectedDate && isPastDateTime(selectedDate, hour, minute, p)) return
        setPeriod(p)
        if (selectedDate) {
            onChange(formatDateValue(selectedDate, hour, minute, p))
        }
    }

    const handleClear = () => {
        setSelectedDate(null)
        onChange('')
        setIsOpen(false)
    }

    const canSelectToday = !isDisabledDate(new Date())

    const handleToday = () => {
        const today = new Date()
        if (isDisabledDate(today)) return
        setSelectedDate(today)
        setCurrentMonth(today)

        if (showTime) {
            const h = today.getHours()
            const m = today.getMinutes()
            const p = h >= 12 ? 'PM' : 'AM'
            const h12 = h % 12 || 12

            setHour(h12)
            setMinute(m)
            setPeriod(p)

            onChange(formatDateValue(today, h12, m, p))
        } else {
            onChange(formatDateValue(today, 12, 0, 'AM'))
            if (autoClose) {
                setIsOpen(false)
            }
        }
    }

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDayOfWeek = firstDay.getDay()

        const days = []

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null)
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day))
        }

        return days
    }

    const canNavigatePrev = () => {
        if (!minDate) return true
        const prevMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0)
        return !isOutOfRange(prevMonthEnd) || prevMonthEnd >= startOfDay(minDate)
    }

    const canNavigateNext = () => {
        if (!maxDate) return true
        const nextMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
        return !isOutOfRange(nextMonthStart) || nextMonthStart <= startOfDay(maxDate)
    }

    const navigateMonth = (direction: 'prev' | 'next') => {
        if (direction === 'prev' && !canNavigatePrev()) return
        if (direction === 'next' && !canNavigateNext()) return
        setCurrentMonth(prev => {
            const newMonth = new Date(prev)
            if (direction === 'prev') {
                newMonth.setMonth(prev.getMonth() - 1)
            } else {
                newMonth.setMonth(prev.getMonth() + 1)
            }
            return newMonth
        })
    }

    const isSelected = (date: Date) => {
        return selectedDate && date.toDateString() === selectedDate.toDateString()
    }

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

    const calendarPanel =
        isOpen && mounted && panelPosition
            ? createPortal(
                  <motion.div
                      ref={panelRef}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.15 }}
                      style={{
                          position: 'fixed',
                          top: panelPosition.top,
                          left: panelPosition.left,
                      }}
                      className={cn(
                          "z-[300] bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4",
                          showTime ? "w-auto min-w-[420px]" : "w-[280px]"
                      )}
                  >
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-700/50">
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-1.5">
                                {showTime ? <Clock className="w-4 h-4 text-blue-500" /> : <Calendar className="w-4 h-4 text-blue-500" />}
                                {showTime ? "Select Date & Time" : "Select Date"}
                            </h3>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                                className="h-7 w-7 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <X className="w-3.5 h-3.5" />
                            </Button>
                        </div>

                        <div className={cn("flex flex-col sm:flex-row gap-4", showTime ? "items-stretch" : "")}>
                            <div className="w-[248px] shrink-0">
                                <div className="flex items-center justify-between mb-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        disabled={!canNavigatePrev()}
                                        onClick={() => navigateMonth('prev')}
                                        className="h-7 w-7 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>

                                    <h4 className="text-xs font-semibold text-gray-800 dark:text-white">
                                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                    </h4>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        disabled={!canNavigateNext()}
                                        onClick={() => navigateMonth('next')}
                                        className="h-7 w-7 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-7 gap-0.5 mb-1 text-center">
                                    {dayNames.map(day => (
                                        <div key={day} className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase py-1">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-0.5">
                                    {getDaysInMonth(currentMonth).map((date, index) => {
                                        if (!date) {
                                            return <div key={index} className="h-7 w-7" />
                                        }

                                        const selected = isSelected(date)
                                        const today = isToday(date)
                                        const disabledDay = isDisabledDate(date)

                                        return (
                                            <button
                                                type="button"
                                                key={index}
                                                disabled={disabledDay}
                                                onClick={() => handleDateSelect(date)}
                                                className={cn(
                                                    "h-7 w-7 p-0 text-xs font-semibold rounded-lg flex items-center justify-center transition-all",
                                                    disabledDay && "opacity-30 cursor-not-allowed text-gray-400 dark:text-gray-600 hover:bg-transparent",
                                                    !disabledDay && selected
                                                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                                        : !disabledDay && today
                                                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                                            : !disabledDay && "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                                                )}
                                            >
                                                {date.getDate()}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {showTime && (
                                <div className="flex flex-col gap-2 p-1 pl-4 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-700/80 min-w-[140px] shrink-0">
                                    <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Time</div>
                                    <div className="flex gap-1 h-[160px]">
                                        <div className="flex-1 flex flex-col overflow-y-auto scrollbar-none gap-0.5 border border-gray-100 dark:border-gray-700/50 rounded-lg p-0.5 bg-gray-50/50 dark:bg-gray-900/10">
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
                                                const past =
                                                    !!selectedDate &&
                                                    isPastDateTime(selectedDate, h, minute, period)
                                                return (
                                                    <button
                                                        key={h}
                                                        type="button"
                                                        disabled={past}
                                                        onClick={() => handleHourSelect(h)}
                                                        className={cn(
                                                            "text-[11px] py-1 px-1 rounded-md font-bold text-center transition-colors shrink-0",
                                                            past && "opacity-30 cursor-not-allowed",
                                                            !past && hour === h
                                                                ? "bg-blue-600 text-white"
                                                                : !past && "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                                                        )}
                                                    >
                                                        {h}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        <div className="flex-1 flex flex-col overflow-y-auto scrollbar-none gap-0.5 border border-gray-100 dark:border-gray-700/50 rounded-lg p-0.5 bg-gray-50/50 dark:bg-gray-900/10">
                                            {Array.from({ length: 60 }, (_, i) => i).map((m) => {
                                                const displayM = String(m).padStart(2, '0')
                                                const past =
                                                    !!selectedDate &&
                                                    isPastDateTime(selectedDate, hour, m, period)
                                                return (
                                                    <button
                                                        key={m}
                                                        type="button"
                                                        disabled={past}
                                                        onClick={() => handleMinuteSelect(m)}
                                                        className={cn(
                                                            "text-[11px] py-1 px-1 rounded-md font-bold text-center transition-colors shrink-0",
                                                            past && "opacity-30 cursor-not-allowed",
                                                            !past && minute === m
                                                                ? "bg-blue-600 text-white"
                                                                : !past && "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                                                        )}
                                                    >
                                                        {displayM}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        <div className="flex flex-col gap-1 border border-gray-100 dark:border-gray-700/50 rounded-lg p-0.5 bg-gray-50/50 dark:bg-gray-900/10 justify-center">
                                            {(['AM', 'PM'] as const).map((p) => {
                                                const past =
                                                    !!selectedDate &&
                                                    isPastDateTime(selectedDate, hour, minute, p)
                                                return (
                                                    <button
                                                        key={p}
                                                        type="button"
                                                        disabled={past}
                                                        onClick={() => handlePeriodSelect(p)}
                                                        className={cn(
                                                            "text-[10px] py-2 px-1.5 rounded-md font-bold text-center transition-colors shrink-0",
                                                            past && "opacity-30 cursor-not-allowed",
                                                            !past && period === p
                                                                ? "bg-blue-600 text-white"
                                                                : !past && "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                                                        )}
                                                    >
                                                        {p}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/80">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleClear}
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-xs h-7 px-2"
                            >
                                Clear
                            </Button>

                            <div className="flex items-center gap-1.5">
                                {canSelectToday && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleToday}
                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs h-7 px-2"
                                    >
                                        Today
                                    </Button>
                                )}
                                {showTime && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => setIsOpen(false)}
                                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-7 px-3 rounded-lg shadow-sm"
                                    >
                                        Done
                                    </Button>
                                )}
                            </div>
                        </div>
                      </motion.div>,
                  document.body
              )
            : null

    return (
        <div className="relative" ref={containerRef}>
            <div className="relative" ref={triggerRef}>
                <Input
                    type="text"
                    value={formatDisplayValue()}
                    placeholder={placeholder}
                    readOnly
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={cn(
                        "cursor-pointer pr-10 bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-lg text-gray-900 dark:text-white transition-all outline-none",
                        className
                    )}
                    disabled={disabled}
                />
                {showTime ? (
                    <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                ) : (
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                )}
            </div>

            {calendarPanel}
        </div>
    )
}
