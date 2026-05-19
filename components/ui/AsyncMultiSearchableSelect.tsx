"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { ChevronDown, X, Check, Search, Loader2 } from 'lucide-react'

export interface AsyncMultiSelectOption {
    value: string
    label: string
}

export interface FetchOptionsPageResult {
    options: AsyncMultiSelectOption[]
    hasMore: boolean
}

interface AsyncMultiSearchableSelectProps {
    fetchOptions: (searchTerm: string, skip: number) => Promise<FetchOptionsPageResult>
    values: string[]
    onChange: (values: string[]) => void
    placeholder?: string
    label?: string
    disabled?: boolean
    className?: string
    searchPlaceholder?: string
    debounceMs?: number
}

function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(handler)
    }, [value, delay])
    return debouncedValue
}

function mergeOptions(
    prev: AsyncMultiSelectOption[],
    next: AsyncMultiSelectOption[]
): AsyncMultiSelectOption[] {
    const seen = new Set(prev.map((o) => o.value.toLowerCase()))
    const added = next.filter((o) => !seen.has(o.value.toLowerCase()))
    return [...prev, ...added]
}

export function AsyncMultiSearchableSelect({
    fetchOptions,
    values,
    onChange,
    placeholder = 'Select options...',
    label,
    disabled = false,
    className = '',
    searchPlaceholder = 'Type to search...',
    debounceMs = 400,
}: AsyncMultiSearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [apiOptions, setApiOptions] = useState<AsyncMultiSelectOption[]>([])
    const [hasMore, setHasMore] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)

    const debouncedSearchTerm = useDebounceValue(searchTerm, debounceMs)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const loadingMoreRef = useRef(false)

    const loadPage = useCallback(
        async (term: string, skip: number, append: boolean) => {
            if (skip === 0) {
                setIsLoading(true)
            } else {
                setIsLoadingMore(true)
                loadingMoreRef.current = true
            }
            try {
                const { options, hasMore: more } = await fetchOptions(term, skip)
                setApiOptions((prev) => (append ? mergeOptions(prev, options) : options))
                setHasMore(more)
            } catch (error) {
                console.error('Failed to fetch options', error)
                if (!append) {
                    setApiOptions([])
                    setHasMore(false)
                }
            } finally {
                setIsLoading(false)
                setIsLoadingMore(false)
                loadingMoreRef.current = false
            }
        },
        [fetchOptions]
    )

    useEffect(() => {
        if (isOpen) {
            loadPage(debouncedSearchTerm, 0, false)
        }
    }, [debouncedSearchTerm, isOpen, loadPage])

    const handleScroll = useCallback(() => {
        const el = listRef.current
        if (!el || isLoading || isLoadingMore || !hasMore || loadingMoreRef.current) {
            return
        }
        const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40
        if (nearBottom) {
            loadPage(debouncedSearchTerm, apiOptions.length, true)
        }
    }, [apiOptions.length, debouncedSearchTerm, hasMore, isLoading, isLoadingMore, loadPage])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                setSearchTerm('')
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    const displayOptions = useMemo(() => {
        const known = new Set(apiOptions.map((o) => o.value.toLowerCase()))
        const selectedExtras = values
            .filter((v) => v && !known.has(v.toLowerCase()))
            .map((v) => ({ value: v, label: v }))
        return [...selectedExtras, ...apiOptions]
    }, [apiOptions, values])

    const handleToggle = (selectedValue: string) => {
        if (values.includes(selectedValue)) {
            onChange(values.filter((v) => v !== selectedValue))
        } else {
            onChange([...values, selectedValue])
        }
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange([])
    }

    const removeValue = (value: string) => {
        onChange(values.filter((v) => v !== value))
    }

    const getDisplayText = () => {
        if (values.length === 0) return placeholder
        if (values.length === 1) return values[0]
        return `${values.length} selected`
    }

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
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`
                        w-full pl-3 pr-10 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-md
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                        transition-colors duration-200 text-sm h-10
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400 dark:hover:border-gray-500'}
                    `}
                >
                    <span
                        className={`block truncate ${values.length === 0 ? 'text-gray-500 dark:text-gray-400' : ''}`}
                    >
                        {getDisplayText()}
                    </span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <ChevronDown
                            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </span>
                </button>

                {values.length > 0 && !disabled && (
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
                        <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-gray-400" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder={searchPlaceholder}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {isLoading && !isLoadingMore && (
                                    <Loader2 className="absolute right-2 top-2.5 h-3.5 w-3.5 animate-spin text-blue-500" />
                                )}
                            </div>
                        </div>

                        <div
                            ref={listRef}
                            className="overflow-y-auto flex-1"
                            onScroll={handleScroll}
                        >
                            {displayOptions.length > 0 ? (
                                <div className="py-1">
                                    {displayOptions.map((option) => {
                                        const isSelected = values.includes(option.value)
                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => handleToggle(option.value)}
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
                                    {isLoadingMore && (
                                        <div className="flex items-center justify-center gap-2 py-3 text-xs text-gray-500 dark:text-gray-400">
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            Loading more…
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                    {isLoading ? 'Searching...' : 'No skills found. Try a different search.'}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {values.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {values.map((value) => (
                        <span
                            key={value}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-100 dark:border-blue-800"
                        >
                            {value}
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => removeValue(value)}
                                    className="hover:text-blue-950 dark:hover:text-white"
                                    aria-label={`Remove ${value}`}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}
