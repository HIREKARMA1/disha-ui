'use client'

import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check, Search, Loader2 } from 'lucide-react'

export interface AsyncSelectOption {
    value: string
    label: string
}

interface AsyncSearchableSelectProps {
    fetchOptions: (searchTerm: string) => Promise<AsyncSelectOption[]>
    value?: string
    onChange: (value: string, option?: AsyncSelectOption) => void
    placeholder?: string
    label?: string
    disabled?: boolean
    className?: string
    searchPlaceholder?: string
    debounceMs?: number
    error?: boolean
    helperText?: string
    /**
     * Render the results panel via document portal with fixed positioning.
     * Use inside overflow-clipped modals (e.g. Quick Account Setup) so the
     * dropdown is not clipped. Registration leaves this unset (inline absolute).
     */
    portal?: boolean
}

// Simple debounce hook implementation if not available
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

type PanelPosition = { top: number; left: number; width: number }

export function AsyncSearchableSelect({
    fetchOptions,
    value,
    onChange,
    placeholder = "Select option...",
    label,
    disabled = false,
    className = "",
    searchPlaceholder = "Type to search...",
    debounceMs = 500,
    error = false,
    helperText,
    portal = false,
}: AsyncSearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [options, setOptions] = useState<AsyncSelectOption[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [persistedSelectedOption, setPersistedSelectedOption] = useState<AsyncSelectOption | null>(null)
    const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null)
    const [mounted, setMounted] = useState(false)

    // Use debounced search term to trigger API calls
    const debouncedSearchTerm = useDebounceValue(searchTerm, debounceMs)

    const rootRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const panelRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const fetchData = useCallback(async (term: string) => {
        setIsLoading(true)
        try {
            const results = await fetchOptions(term)
            setOptions(results)
        } catch (error) {
            console.error("Failed to fetch options", error)
            setOptions([])
        } finally {
            setIsLoading(false)
        }
    }, [fetchOptions])

    useEffect(() => {
        setMounted(true)
    }, [])

    // Initial fetch to populate options when opened
    useEffect(() => {
        if (isOpen) {
            fetchData(debouncedSearchTerm)
        }
    }, [debouncedSearchTerm, isOpen, fetchData])

    // Keep track of the selected option object separately to preserve label
    useEffect(() => {
        const option = options.find(o => o.value === value)
        if (option) {
            setPersistedSelectedOption(option)
        }
    }, [value, options])

    const updatePanelPosition = useCallback(() => {
        if (!portal || !isOpen || !triggerRef.current) return
        const rect = triggerRef.current.getBoundingClientRect()
        setPanelPosition({
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
        })
    }, [portal, isOpen])

    useLayoutEffect(() => {
        if (!portal || !isOpen) {
            setPanelPosition(null)
            return
        }
        updatePanelPosition()
        const onReposition = () => updatePanelPosition()
        window.addEventListener('resize', onReposition)
        // Capture scroll from modal content + page
        window.addEventListener('scroll', onReposition, true)
        return () => {
            window.removeEventListener('resize', onReposition)
            window.removeEventListener('scroll', onReposition, true)
        }
    }, [portal, isOpen, updatePanelPosition])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node
            const inRoot = rootRef.current?.contains(target)
            const inPanel = panelRef.current?.contains(target)
            if (!inRoot && !inPanel) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // Focus search input when dropdown opens (after portal mounts)
    useEffect(() => {
        if (!isOpen) return
        const id = window.setTimeout(() => {
            inputRef.current?.focus()
        }, 0)
        return () => window.clearTimeout(id)
    }, [isOpen, panelPosition])

    const handleSelect = (option: AsyncSelectOption) => {
        onChange(option.value, option)
        setPersistedSelectedOption(option)
        setIsOpen(false)
        setSearchTerm('')
    }

    const handleDropdownToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen)
        }
    }

    const panelClassName =
        'bg-white dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100'

    const panelContent = (
        <>
            {/* Search input */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 sticky top-0 z-10">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-8 py-1.5 text-sm border border-gray-200 dark:border-gray-800 rounded bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    />
                    {isLoading && (
                        <div className="absolute right-2.5 top-2.5">
                            <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                        </div>
                    )}
                </div>
            </div>

            {/* Options */}
            <div className="overflow-y-auto flex-1 max-h-48 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                {options.length > 0 ? (
                    <div className="p-1 space-y-0.5">
                        {options.map((option) => {
                            const isSelected = value === option.value
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className={`
                                        w-full px-2 py-1.5 text-left text-sm flex items-center justify-between rounded-sm
                                        ${isSelected
                                            ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300 font-medium'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
                                        }
                                    `}
                                >
                                    <span className="truncate mr-2">{option.label}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                                </button>
                            )
                        })}
                    </div>
                ) : (
                    <div className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        {isLoading ? 'Searching...' : 'No options found'}
                    </div>
                )}
            </div>
        </>
    )

    const inlinePanel =
        isOpen && !portal ? (
            <div className={`absolute z-50 w-full mt-1 ${panelClassName}`}>
                {panelContent}
            </div>
        ) : null

    const portaledPanel =
        portal &&
        isOpen &&
        mounted &&
        panelPosition &&
        typeof document !== 'undefined'
            ? createPortal(
                  <div
                      ref={panelRef}
                      style={{
                          position: 'fixed',
                          top: panelPosition.top,
                          left: panelPosition.left,
                          width: panelPosition.width,
                      }}
                      className={`z-[300] ${panelClassName}`}
                      role="listbox"
                  >
                      {panelContent}
                  </div>,
                  document.body
              )
            : null

    return (
        <div className={`relative ${className}`} ref={rootRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                </label>
            )}

            <div className="relative">
                <button
                    ref={triggerRef}
                    type="button"
                    onClick={handleDropdownToggle}
                    disabled={disabled}
                    className={`
                        w-full pl-3 pr-10 py-2 text-left border rounded-lg shadow-sm
                        bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100
                        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                        transition-colors duration-200 text-sm h-10 flex items-center
                        ${disabled
                            ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                            : 'cursor-pointer border-gray-300 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-700'
                        }
                        ${error ? 'border-red-500 focus:ring-red-500 ring-red-500' : ''}
                    `}
                >
                    <span className={`block truncate ${!persistedSelectedOption && !value ? 'text-gray-500 dark:text-gray-400' : ''}`}>
                        {persistedSelectedOption?.label || (value ? "Selected Option" : placeholder)}
                    </span>

                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </span>
                </button>

                {inlinePanel}
                {portaledPanel}
            </div>
            {helperText && (
                <p className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
                    {helperText}
                </p>
            )}
        </div>
    )
}
