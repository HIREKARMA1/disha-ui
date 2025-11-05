"use client"

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, X, Check, Plus } from 'lucide-react'
import { Button } from './button'

export interface MultiSelectOption {
    id: string
    label: string
    value: string
}

interface MultiSelectDropdownProps {
    options: MultiSelectOption[]
    selectedValues: string[]
    onSelectionChange: (selectedValues: string[]) => void
    placeholder?: string
    label?: string
    disabled?: boolean
    isLoading?: boolean
    className?: string
    showAllOption?: boolean
    allOptionLabel?: string
    hideSelectedTags?: boolean
    allowCreate?: boolean
    onCreateOption?: (value: string) => void
}

export function MultiSelectDropdown({
    options,
    selectedValues,
    onSelectionChange,
    placeholder = "Select options...",
    label,
    disabled = false,
    isLoading = false,
    className = "",
    showAllOption = true,
    allOptionLabel = "All",
    hideSelectedTags = false,
    allowCreate = false,
    onCreateOption
}: MultiSelectDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [openUpward, setOpenUpward] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    // Calculate dropdown position when opening
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const calculatePosition = () => {
                if (!buttonRef.current) return
                
                const buttonRect = buttonRef.current.getBoundingClientRect()
                const viewportHeight = window.innerHeight
                const spaceBelow = viewportHeight - buttonRect.bottom
                const spaceAbove = buttonRect.top
                const dropdownHeight = 280 // Approximate max height (max-h-60 = 240px + padding)
                
                // Open upward if not enough space below, but enough space above
                if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
                    setOpenUpward(true)
                } else {
                    setOpenUpward(false)
                }
            }
            
            calculatePosition()
            
            // Recalculate on scroll or resize
            window.addEventListener('scroll', calculatePosition, true)
            window.addEventListener('resize', calculatePosition)
            
            return () => {
                window.removeEventListener('scroll', calculatePosition, true)
                window.removeEventListener('resize', calculatePosition)
            }
        }
    }, [isOpen])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                setSearchTerm('')
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Check if search term doesn't match any option (for allowCreate)
    const canCreateNew = allowCreate && 
        searchTerm.trim().length > 0 && 
        !filteredOptions.some(opt => opt.value.toLowerCase() === searchTerm.trim().toLowerCase()) &&
        !selectedValues.includes(searchTerm.trim())

    const handleCreateNew = () => {
        if (canCreateNew && onCreateOption) {
            onCreateOption(searchTerm.trim())
            setSearchTerm('')
        } else if (canCreateNew) {
            // If no onCreateOption callback, directly add to selection
            if (!selectedValues.includes(searchTerm.trim())) {
                onSelectionChange([...selectedValues, searchTerm.trim()])
            }
            setSearchTerm('')
        }
    }

    // Check if "All" is selected
    const isAllSelected = selectedValues.length === options.length && options.length > 0

    const handleToggleAll = () => {
        if (isAllSelected) {
            onSelectionChange([])
        } else {
            onSelectionChange(options.map(option => option.value))
        }
    }

    const handleToggleOption = (value: string) => {
        if (selectedValues.includes(value)) {
            onSelectionChange(selectedValues.filter(v => v !== value))
        } else {
            onSelectionChange([...selectedValues, value])
        }
    }

    const handleRemoveSelection = (value: string) => {
        onSelectionChange(selectedValues.filter(v => v !== value))
    }

    const getDisplayText = () => {
        if (isAllSelected) {
            return `All ${allOptionLabel}`
        }
        if (selectedValues.length === 0) {
            return placeholder
        }
        if (selectedValues.length === 1) {
            const option = options.find(opt => opt.value === selectedValues[0])
            return option?.label || selectedValues[0]
        }
        return `${selectedValues.length} selected`
    }

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                </label>
            )}
            
            <div className="relative">
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
                    disabled={disabled || isLoading}
                    className={`
                        w-full p-3 text-left border border-gray-300 dark:border-gray-600 rounded-lg 
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                        focus:ring-2 focus:ring-primary-500 focus:border-transparent
                        transition-colors duration-200
                        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400 dark:hover:border-gray-500'}
                    `}
                >
                    <div className="flex items-center justify-between">
                        <span className={selectedValues.length === 0 ? 'text-gray-500 dark:text-gray-400' : ''}>
                            {isLoading ? 'Loading...' : getDisplayText()}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? (openUpward ? 'rotate-0' : 'rotate-180') : ''}`} />
                    </div>
                </button>

                {isOpen && (
                    <div 
                        ref={menuRef}
                        className={`absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-hidden ${
                            openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
                        }`}
                    >
                        {/* Search input */}
                        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        {/* Options */}
                        <div className="max-h-48 overflow-y-auto">
                            {/* All option */}
                            {showAllOption && options.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleToggleAll}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                    <div className={`w-4 h-4 border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center ${isAllSelected ? 'bg-primary-500 border-primary-500' : ''}`}>
                                        {isAllSelected && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className="font-medium">{allOptionLabel}</span>
                                </button>
                            )}

                            {/* Individual options */}
                            {filteredOptions.map((option) => {
                                const isSelected = selectedValues.includes(option.value)
                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => handleToggleOption(option.value)}
                                        className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                    >
                                        <div className={`w-4 h-4 border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center ${isSelected ? 'bg-primary-500 border-primary-500' : ''}`}>
                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <span>{option.label}</span>
                                    </button>
                                )
                            })}

                            {/* Create new option */}
                            {canCreateNew && (
                                <button
                                    type="button"
                                    onClick={handleCreateNew}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 border-t border-gray-200 dark:border-gray-700"
                                >
                                    <Plus className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                    <span className="text-primary-600 dark:text-primary-400 font-medium">
                                        Create "{searchTerm.trim()}"
                                    </span>
                                </button>
                            )}

                            {filteredOptions.length === 0 && !canCreateNew && (
                                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                    No options found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Selected items display */}
            {!hideSelectedTags && selectedValues.length > 0 && !isAllSelected && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {selectedValues.map((value) => {
                        const option = options.find(opt => opt.value === value)
                        return (
                            <span
                                key={value}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded-full text-sm"
                            >
                                {option?.label || value}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSelection(value)}
                                    className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
