"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
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
}

export function DateTimePicker({ value, onChange, placeholder = "Select date", className, disabled, autoClose = true }: DateTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const containerRef = useRef<HTMLDivElement>(null)

    // Parse initial value
    useEffect(() => {
        if (value) {
            const date = new Date(value)
            if (!isNaN(date.getTime())) {
                setSelectedDate(date)
                setCurrentMonth(date)
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

        return dateStr
    }

    const handleDateSelect = (date: Date) => {
        console.log('📅 DateTimePicker: Date selected:', date)
        console.log('📅 DateTimePicker: autoClose:', autoClose)

        setSelectedDate(date)
        // Update the form field immediately
        onChange(date.toISOString().split('T')[0]) // Format as YYYY-MM-DD

        // Only close the modal if autoClose is enabled
        if (autoClose) {
            console.log('📅 DateTimePicker: Closing modal due to autoClose=true')
            setIsOpen(false)
        } else {
            console.log('📅 DateTimePicker: Keeping modal open due to autoClose=false')
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
        onChange(today.toISOString().split('T')[0]) // Format as YYYY-MM-DD

        // Only close the modal if autoClose is enabled
        if (autoClose) {
            setIsOpen(false)
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
                        className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 w-[280px]"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Select Date
                            </h3>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                                className="h-8 w-8 p-0"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="w-full">
                            {/* Calendar Section */}
                            <div className="w-full">
                                {/* Month Navigation */}
                                <div className="flex items-center justify-between mb-4">
                                    <Button
                                        type="button"
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
                                        type="button"
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
                                                type="button"
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
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClear}
                                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                        Clear
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleToday}
                                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                                    >
                                        Today
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

