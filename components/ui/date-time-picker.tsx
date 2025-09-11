"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface DateTimePickerProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    disabled?: boolean
}

export function DateTimePicker({ value, onChange, placeholder = "Select date and time", className, disabled }: DateTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedTime, setSelectedTime] = useState({ hours: 12, minutes: 0, period: 'PM' })
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const containerRef = useRef<HTMLDivElement>(null)

    // Parse initial value
    useEffect(() => {
        if (value) {
            const date = new Date(value)
            if (!isNaN(date.getTime())) {
                setSelectedDate(date)
                setCurrentMonth(date)

                const hours = date.getHours()
                const minutes = date.getMinutes()
                const period = hours >= 12 ? 'PM' : 'AM'
                const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours

                setSelectedTime({
                    hours: displayHours,
                    minutes,
                    period
                })
            }
        }
    }, [value])

    // Close dropdown when clicking outside
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

        const timeStr = `${selectedTime.hours.toString().padStart(2, '0')}:${selectedTime.minutes.toString().padStart(2, '0')} ${selectedTime.period}`

        return `${dateStr} ${timeStr}`
    }

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date)
    }

    const handleTimeChange = (type: 'hours' | 'minutes' | 'period', value: number | string) => {
        setSelectedTime(prev => ({
            ...prev,
            [type]: value
        }))
    }

    const handleApply = () => {
        if (selectedDate) {
            const hours = selectedTime.period === 'PM'
                ? (selectedTime.hours === 12 ? 12 : selectedTime.hours + 12)
                : (selectedTime.hours === 12 ? 0 : selectedTime.hours)

            const finalDate = new Date(selectedDate)
            finalDate.setHours(hours, selectedTime.minutes, 0, 0)

            onChange(finalDate.toISOString().slice(0, 16)) // Format for datetime-local
            setIsOpen(false)
        }
    }

    const handleClear = () => {
        setSelectedDate(null)
        setSelectedTime({ hours: 12, minutes: 0, period: 'PM' })
        onChange('')
        setIsOpen(false)
    }

    const handleToday = () => {
        const today = new Date()
        setSelectedDate(today)
        setCurrentMonth(today)

        const hours = today.getHours()
        const minutes = today.getMinutes()
        const period = hours >= 12 ? 'PM' : 'AM'
        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours

        setSelectedTime({
            hours: displayHours,
            minutes,
            period
        })
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
            <Input
                type="text"
                value={formatDisplayValue()}
                placeholder={placeholder}
                readOnly
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={cn(
                    "cursor-pointer pr-10",
                    className
                )}
                disabled={disabled}
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 min-w-[320px]"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Select Date & Time
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                                className="h-8 w-8 p-0"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="flex gap-4">
                            {/* Calendar Section */}
                            <div className="flex-1">
                                {/* Month Navigation */}
                                <div className="flex items-center justify-between mb-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => navigateMonth('prev')}
                                        className="h-8 w-8 p-0"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>

                                    <h4 className="text-base font-medium text-gray-900 dark:text-white">
                                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                    </h4>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => navigateMonth('next')}
                                        className="h-8 w-8 p-0"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Days of Week */}
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {dayNames.map(day => (
                                        <div key={day} className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center py-2">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-1">
                                    {getDaysInMonth(currentMonth).map((date, index) => {
                                        if (!date) {
                                            return <div key={index} className="h-8" />
                                        }

                                        return (
                                            <Button
                                                key={index}
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDateSelect(date)}
                                                className={cn(
                                                    "h-8 w-8 p-0 text-sm font-medium",
                                                    isSelected(date) && "bg-primary-500 text-white hover:bg-primary-600",
                                                    isToday(date) && !isSelected(date) && "bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400",
                                                    !isSelected(date) && !isToday(date) && "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                )}
                                            >
                                                {date.getDate()}
                                            </Button>
                                        )
                                    })}
                                </div>

                                {/* Calendar Footer */}
                                <div className="flex justify-between mt-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClear}
                                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                        Clear
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleToday}
                                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                                    >
                                        Today
                                    </Button>
                                </div>
                            </div>

                            {/* Time Section */}
                            <div className="w-32">
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Time
                                </div>

                                {/* Hours */}
                                <div className="mb-3">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hour</div>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                                            <Button
                                                key={hour}
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleTimeChange('hours', hour)}
                                                className={cn(
                                                    "w-full h-6 p-0 text-xs",
                                                    selectedTime.hours === hour ? "bg-primary-500 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                )}
                                            >
                                                {hour.toString().padStart(2, '0')}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Minutes */}
                                <div className="mb-3">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Minute</div>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {Array.from({ length: 60 }, (_, i) => i).map(minute => (
                                            <Button
                                                key={minute}
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleTimeChange('minutes', minute)}
                                                className={cn(
                                                    "w-full h-6 p-0 text-xs",
                                                    selectedTime.minutes === minute ? "bg-primary-500 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                )}
                                            >
                                                {minute.toString().padStart(2, '0')}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* AM/PM */}
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Period</div>
                                    <div className="space-y-1">
                                        {['AM', 'PM'].map(period => (
                                            <Button
                                                key={period}
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleTimeChange('period', period)}
                                                className={cn(
                                                    "w-full h-6 p-0 text-xs",
                                                    selectedTime.period === period ? "bg-primary-500 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                )}
                                            >
                                                {period}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Apply Button */}
                        <div className="flex justify-end mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                onClick={handleApply}
                                disabled={!selectedDate}
                                size="sm"
                                className="px-6"
                            >
                                Apply
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
