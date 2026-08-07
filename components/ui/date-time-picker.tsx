"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
}

export function DateTimePicker({
    value,
    onChange,
    placeholder = "Select date",
    className,
    disabled,
    autoClose = true,
    showTime = false
}: DateTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    
    // Time picker states
    const [hour, setHour] = useState(12)
    const [minute, setMinute] = useState(0)
    const [period, setPeriod] = useState<'AM' | 'PM'>('AM')

    const containerRef = useRef<HTMLDivElement>(null)

    // Robust parsing of initial value (timezone-agnostic manual parsing)
    useEffect(() => {
        if (value) {
            const parts = value.split('T')
            const datePart = parts[0]
            const timePart = parts[1] || ''

            const parsedDate = new Date(datePart)
            if (!isNaN(parsedDate.getTime())) {
                setSelectedDate(parsedDate)
                setCurrentMonth(parsedDate)
            }

            if (showTime && timePart) {
                const [hStr, mStr] = timePart.split(':')
                const h24 = parseInt(hStr, 10)
                const m = parseInt(mStr, 10)
                if (!isNaN(h24) && !isNaN(m)) {
                    setHour(h24 % 12 || 12)
                    setMinute(m)
                    setPeriod(h24 >= 12 ? 'PM' : 'AM')
                }
            }
        }
    }, [value, showTime])

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
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

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date)
        if (showTime) {
            onChange(formatDateValue(date, hour, minute, period))
        } else {
            onChange(formatDateValue(date, 12, 0, 'AM'))
            if (autoClose) {
                setIsOpen(false)
            }
        }
    }

    const handleHourSelect = (h: number) => {
        setHour(h)
        if (selectedDate) {
            onChange(formatDateValue(selectedDate, h, minute, period))
        }
    }

    const handleMinuteSelect = (m: number) => {
        setMinute(m)
        if (selectedDate) {
            onChange(formatDateValue(selectedDate, hour, m, period))
        }
    }

    const handlePeriodSelect = (p: 'AM' | 'PM') => {
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

    const handleToday = () => {
        const today = new Date()
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

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null)
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day))
        }

        return days
    }

    const navigateMonth = (direction: 'prev' | 'next') => {
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

    const isToday = (date: Date) => {
        const today = new Date()
        return date.toDateString() === today.toDateString()
    }

    const isSelected = (date: Date) => {
        return selectedDate && date.toDateString() === selectedDate.toDateString()
    }

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

    return (
        <div className="relative" ref={containerRef}>
            <div className="relative">
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

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                            "absolute top-full left-0 mt-2 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 animate-in fade-in duration-200",
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
                            {/* Calendar Section */}
                            <div className="w-[248px] shrink-0">
                                {/* Month Navigation */}
                                <div className="flex items-center justify-between mb-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => navigateMonth('prev')}
                                        className="h-7 w-7 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
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
                                        onClick={() => navigateMonth('next')}
                                        className="h-7 w-7 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Days of Week */}
                                <div className="grid grid-cols-7 gap-0.5 mb-1 text-center">
                                    {dayNames.map(day => (
                                        <div key={day} className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase py-1">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-0.5">
                                    {getDaysInMonth(currentMonth).map((date, index) => {
                                        if (!date) {
                                            return <div key={index} className="h-7 w-7" />
                                        }

                                        const selected = isSelected(date)
                                        const today = isToday(date)

                                        return (
                                            <button
                                                type="button"
                                                key={index}
                                                onClick={() => handleDateSelect(date)}
                                                className={cn(
                                                    "h-7 w-7 p-0 text-xs font-semibold rounded-lg flex items-center justify-center transition-all",
                                                    selected
                                                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                                        : today
                                                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                                                )}
                                            >
                                                {date.getDate()}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Time Section (Only if showTime is enabled) */}
                            {showTime && (
                                <div className="flex flex-col gap-2 p-1 pl-4 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-700/80 min-w-[140px] shrink-0">
                                    <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Time</div>
                                    <div className="flex gap-1 h-[160px]">
                                        {/* Hours scroll column */}
                                        <div className="flex-1 flex flex-col overflow-y-auto scrollbar-none gap-0.5 border border-gray-100 dark:border-gray-700/50 rounded-lg p-0.5 bg-gray-50/50 dark:bg-gray-900/10">
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                                                <button
                                                    key={h}
                                                    type="button"
                                                    onClick={() => handleHourSelect(h)}
                                                    className={cn(
                                                        "text-[11px] py-1 px-1 rounded-md font-bold text-center transition-colors shrink-0",
                                                        hour === h
                                                            ? "bg-blue-600 text-white"
                                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                                                    )}
                                                >
                                                    {h}
                                                </button>
                                            ))}
                                        </div>
                                        {/* Minutes scroll column */}
                                        <div className="flex-1 flex flex-col overflow-y-auto scrollbar-none gap-0.5 border border-gray-100 dark:border-gray-700/50 rounded-lg p-0.5 bg-gray-50/50 dark:bg-gray-900/10">
                                            {Array.from({ length: 60 }, (_, i) => i).map((m) => {
                                                const displayM = String(m).padStart(2, '0')
                                                return (
                                                    <button
                                                        key={m}
                                                        type="button"
                                                        onClick={() => handleMinuteSelect(m)}
                                                        className={cn(
                                                            "text-[11px] py-1 px-1 rounded-md font-bold text-center transition-colors shrink-0",
                                                            minute === m
                                                                ? "bg-blue-600 text-white"
                                                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                                                        )}
                                                    >
                                                        {displayM}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        {/* AM/PM column */}
                                        <div className="flex flex-col gap-1 border border-gray-100 dark:border-gray-700/50 rounded-lg p-0.5 bg-gray-50/50 dark:bg-gray-900/10 justify-center">
                                            {(['AM', 'PM'] as const).map((p) => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => handlePeriodSelect(p)}
                                                    className={cn(
                                                        "text-[10px] py-2 px-1.5 rounded-md font-bold text-center transition-colors shrink-0",
                                                        period === p
                                                            ? "bg-blue-600 text-white"
                                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                                                    )}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Calendar Footer */}
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
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleToday}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs h-7 px-2"
                                >
                                    Today
                                </Button>
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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
