"use client"

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, X, Check, Search } from 'lucide-react'

export interface SearchableSelectOption {
    value: string
    label: string
}

interface SearchableSelectProps {
    options: SearchableSelectOption[]
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    label?: string
    disabled?: boolean
    isLoading?: boolean
    className?: string
    searchPlaceholder?: string
}

export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = "Select option...",
    label,
    disabled = false,
    isLoading = false,
    className = "",
    searchPlaceholder = "Search..."
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const dropdownRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                setSearchTerm('')
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // Focus input when dropdown opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSelect = (selectedValue: string) => {
        onChange(selectedValue)
        setIsOpen(false)
        setSearchTerm('')
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange('')
    }

    const selectedOption = options.find(opt => opt.value === value)

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {label && (
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {label}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
                    disabled={disabled || isLoading}
                    className={`
                        w-full pl-3 pr-10 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-md 
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                        transition-colors duration-200 text-sm h-10
                        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400 dark:hover:border-gray-500'}
                    `}
                >
                    <span className={`block truncate ${!selectedOption ? 'text-gray-500 dark:text-gray-400' : ''}`}>
                        {isLoading ? 'Loading...' : (selectedOption?.label || placeholder)}
                    </span>

                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </span>
                </button>

                {value && !disabled && !isLoading && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute inset-y-0 right-8 flex items-center pr-1 cursor-pointer group"
                    >
                        <X className="w-3 h-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                    </button>
                )}

                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-hidden flex flex-col">
                        {/* Search input */}
                        <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-gray-400" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder={searchPlaceholder}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Options */}
                        <div className="overflow-y-auto flex-1">
                            {filteredOptions.length > 0 ? (
                                <div className="py-1">
                                    {filteredOptions.map((option) => {
                                        const isSelected = value === option.value
                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => handleSelect(option.value)}
                                                className={`
                                                    w-full px-3 py-2 text-left text-sm flex items-center justify-between
                                                    ${isSelected
                                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                                        : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    }
                                                `}
                                            >
                                                <span className="truncate">{option.label}</span>
                                                {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No options found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
