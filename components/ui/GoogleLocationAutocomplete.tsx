'use client'

import {
    useCallback,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
    type KeyboardEvent,
    type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { loadGoogleMaps } from '@/lib/googleMapsLoader'
import { parseGooglePlace } from '@/lib/googlePlacesUtils'
import type { GoogleLocationMode, ParsedGooglePlace } from '@/types/googlePlaces'

export interface GoogleLocationAutocompleteProps {
    value?: string
    placeholder?: string
    disabled?: boolean
    required?: boolean
    error?: string
    className?: string
    mode?: GoogleLocationMode
    onChange?: (selectedPlace: ParsedGooglePlace) => void
    /** Fires on every keystroke so parents can keep form state in sync. */
    onInputChange?: (value: string) => void
    /**
     * When true, typed text (without picking a suggestion) is committed on blur
     * via onChange({ formattedAddress }).
     */
    allowFreeText?: boolean
    onBlur?: () => void
}

type PredictionItem = {
    placeId: string
    description: string
    mainText: string
    secondaryText: string
}

type DropdownPosition = {
    top: number
    left: number
    width: number
}

const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS = 300

function getAutocompleteTypes(mode: GoogleLocationMode): string[] | undefined {
    if (mode === 'locality') return ['(cities)']
    if (mode === 'address') return ['address']
    return undefined
}

function highlightMatch(text: string, query: string): ReactNode {
    const trimmed = query.trim()
    if (!trimmed || !text) return text

    const lowerText = text.toLowerCase()
    const lowerQuery = trimmed.toLowerCase()
    const index = lowerText.indexOf(lowerQuery)

    if (index === -1) return text

    return (
        <>
            {text.slice(0, index)}
            <span className="font-semibold text-primary-600 dark:text-primary-400">
                {text.slice(index, index + trimmed.length)}
            </span>
            {text.slice(index + trimmed.length)}
        </>
    )
}

export function GoogleLocationAutocomplete({
    value = '',
    placeholder = 'Search for a location',
    disabled = false,
    required = false,
    error,
    className,
    mode = 'all',
    onChange,
    onInputChange,
    allowFreeText = false,
    onBlur,
}: GoogleLocationAutocompleteProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const listboxRef = useRef<HTMLUListElement>(null)
    const onChangeRef = useRef(onChange)
    const requestIdRef = useRef(0)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null)
    const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)
    const placesAttributionRef = useRef<HTMLDivElement | null>(null)

    const [inputValue, setInputValue] = useState(value)
    const [suggestions, setSuggestions] = useState<PredictionItem[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [searchError, setSearchError] = useState<string | null>(null)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [isReady, setIsReady] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(null)
    const [mounted, setMounted] = useState(false)
    const inputId = useId()
    const listboxId = `${inputId}-listbox`

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        onChangeRef.current = onChange
    }, [onChange])

    useEffect(() => {
        setInputValue(value)
    }, [value])

    useEffect(() => {
        if (disabled) return

        let isMounted = true

        loadGoogleMaps()
            .then((googleMaps) => {
                if (!isMounted) return

                autocompleteServiceRef.current = new googleMaps.maps.places.AutocompleteService()

                if (!placesAttributionRef.current) {
                    placesAttributionRef.current = document.createElement('div')
                }
                placesServiceRef.current = new googleMaps.maps.places.PlacesService(
                    placesAttributionRef.current
                )

                setIsReady(true)
                setLoadError(null)
            })
            .catch((err: Error) => {
                if (!isMounted) return
                setLoadError(err.message || 'Failed to load Google Maps')
                setIsReady(false)
            })

        return () => {
            isMounted = false
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
            }
        }
    }, [disabled])

    const updateDropdownPosition = useCallback(() => {
        const input = inputRef.current
        if (!input) return
        const rect = input.getBoundingClientRect()
        setDropdownPosition({
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
        })
    }, [])

    const displayError = error || loadError
    const showDropdown =
        isOpen &&
        !disabled &&
        !loadError &&
        inputValue.trim().length >= MIN_QUERY_LENGTH

    useLayoutEffect(() => {
        if (!showDropdown) {
            setDropdownPosition(null)
            return
        }
        updateDropdownPosition()
    }, [showDropdown, suggestions.length, isSearching, updateDropdownPosition])

    useEffect(() => {
        if (!showDropdown) return

        const handleReposition = () => updateDropdownPosition()
        window.addEventListener('resize', handleReposition)
        window.addEventListener('scroll', handleReposition, true)
        return () => {
            window.removeEventListener('resize', handleReposition)
            window.removeEventListener('scroll', handleReposition, true)
        }
    }, [showDropdown, updateDropdownPosition])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node
            if (
                containerRef.current?.contains(target) ||
                listboxRef.current?.contains(target)
            ) {
                return
            }
            setIsOpen(false)
            setActiveIndex(-1)
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchSuggestions = useCallback(
        (query: string) => {
            const trimmed = query.trim()

            if (trimmed.length < MIN_QUERY_LENGTH) {
                setSuggestions([])
                setIsSearching(false)
                setSearchError(null)
                setIsOpen(false)
                setActiveIndex(-1)
                return
            }

            if (!autocompleteServiceRef.current) {
                setSearchError('Unable to load locations')
                setSuggestions([])
                setIsSearching(false)
                setIsOpen(true)
                return
            }

            const requestId = ++requestIdRef.current
            setIsSearching(true)
            setSearchError(null)
            setIsOpen(true)

            const request: google.maps.places.AutocompletionRequest = {
                input: trimmed,
            }
            const types = getAutocompleteTypes(mode)
            if (types) {
                request.types = types
            }

            autocompleteServiceRef.current.getPlacePredictions(
                request,
                (predictions, status) => {
                    if (requestId !== requestIdRef.current) return

                    setIsSearching(false)

                    if (
                        status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS ||
                        !predictions ||
                        predictions.length === 0
                    ) {
                        setSuggestions([])
                        setActiveIndex(-1)
                        setSearchError(null)
                        setIsOpen(true)
                        return
                    }

                    if (status !== google.maps.places.PlacesServiceStatus.OK) {
                        setSuggestions([])
                        setActiveIndex(-1)
                        setSearchError('Unable to load locations')
                        setIsOpen(true)
                        return
                    }

                    const mapped: PredictionItem[] = predictions.map((prediction) => ({
                        placeId: prediction.place_id,
                        description: prediction.description,
                        mainText: prediction.structured_formatting?.main_text || prediction.description,
                        secondaryText: prediction.structured_formatting?.secondary_text || '',
                    }))

                    setSuggestions(mapped)
                    setActiveIndex(-1)
                    setSearchError(null)
                    setIsOpen(true)
                }
            )
        },
        [mode]
    )

    const scheduleSearch = useCallback(
        (query: string) => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
            }

            const trimmed = query.trim()
            if (trimmed.length < MIN_QUERY_LENGTH) {
                setSuggestions([])
                setIsSearching(false)
                setSearchError(null)
                setIsOpen(false)
                setActiveIndex(-1)
                return
            }

            setIsSearching(true)
            setSearchError(null)
            setIsOpen(true)

            debounceRef.current = setTimeout(() => {
                fetchSuggestions(query)
            }, DEBOUNCE_MS)
        },
        [fetchSuggestions]
    )

    const selectPrediction = useCallback(
        (prediction: PredictionItem) => {
            setInputValue(prediction.description)
            setIsOpen(false)
            setSuggestions([])
            setActiveIndex(-1)
            setSearchError(null)
            setIsSearching(false)

            if (!placesServiceRef.current) {
                onChangeRef.current?.({
                    formattedAddress: prediction.description,
                })
                return
            }

            placesServiceRef.current.getDetails(
                {
                    placeId: prediction.placeId,
                    fields: [
                        'address_components',
                        'formatted_address',
                        'geometry',
                        'name',
                        'place_id',
                    ],
                },
                (place, status) => {
                    if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
                        onChangeRef.current?.({
                            formattedAddress: prediction.description,
                        })
                        return
                    }

                    const parsed = parseGooglePlace(place)

                    if (!parsed.formattedAddress && !parsed.city && !parsed.locality) {
                        onChangeRef.current?.({
                            formattedAddress: prediction.description,
                        })
                        return
                    }

                    const displayValue =
                        parsed.formattedAddress || prediction.description
                    setInputValue(displayValue)
                    onChangeRef.current?.(parsed)
                }
            )
        },
        []
    )

    const handleInputChange = (nextValue: string) => {
        setInputValue(nextValue)
        onInputChange?.(nextValue)
        scheduleSearch(nextValue)
    }

    const commitFreeText = () => {
        if (!allowFreeText) return
        const trimmed = inputValue.trim()
        if (!trimmed) {
            onChange?.({ formattedAddress: '' })
            return
        }
        if (trimmed !== (value || '').trim()) {
            onChange?.({ formattedAddress: trimmed })
        }
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            if (suggestions.length > 0 || isSearching || searchError) {
                setIsOpen(true)
            }
            return
        }

        if (!isOpen) {
            if (event.key === 'Enter' && allowFreeText) {
                commitFreeText()
            }
            return
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault()
            if (suggestions.length === 0) return
            setActiveIndex((prev) => (prev + 1) % suggestions.length)
            return
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault()
            if (suggestions.length === 0) return
            setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1))
            return
        }

        if (event.key === 'Enter') {
            if (activeIndex >= 0 && suggestions[activeIndex]) {
                event.preventDefault()
                selectPrediction(suggestions[activeIndex])
            } else if (allowFreeText) {
                event.preventDefault()
                setIsOpen(false)
                commitFreeText()
            }
            return
        }

        if (event.key === 'Escape') {
            event.preventDefault()
            setIsOpen(false)
            setActiveIndex(-1)
        }
    }

    const showNoResults =
        showDropdown &&
        !isSearching &&
        !searchError &&
        suggestions.length === 0

    const dropdownList =
        showDropdown && mounted && dropdownPosition
            ? createPortal(
                  <ul
                      ref={listboxRef}
                      id={listboxId}
                      role="listbox"
                      style={{
                          position: 'fixed',
                          top: dropdownPosition.top,
                          left: dropdownPosition.left,
                          width: dropdownPosition.width,
                      }}
                      className="z-[1100] max-h-60 overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
                  >
                      {isSearching && (
                          <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                              Searching locations...
                          </li>
                      )}

                      {!isSearching && searchError && (
                          <li className="px-3 py-2 text-sm text-red-600 dark:text-red-400">
                              {searchError}
                          </li>
                      )}

                      {showNoResults && (
                          <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                              No locations found
                          </li>
                      )}

                      {!isSearching &&
                          !searchError &&
                          suggestions.map((suggestion, index) => (
                              <li
                                  key={suggestion.placeId}
                                  id={`${listboxId}-option-${index}`}
                                  role="option"
                                  aria-selected={index === activeIndex}
                                  className={cn(
                                      'cursor-pointer px-3 py-2 text-sm text-gray-900 dark:text-white',
                                      index === activeIndex
                                          ? 'bg-primary-50 dark:bg-primary-900/30'
                                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'
                                  )}
                                  onMouseDown={(e) => e.preventDefault()}
                                  onMouseEnter={() => setActiveIndex(index)}
                                  onClick={() => selectPrediction(suggestion)}
                              >
                                  <div className="font-medium">
                                      {highlightMatch(suggestion.mainText, inputValue)}
                                  </div>
                                  {suggestion.secondaryText && (
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                          {highlightMatch(suggestion.secondaryText, inputValue)}
                                      </div>
                                  )}
                              </li>
                          ))}
                  </ul>,
                  document.body
              )
            : null

    return (
        <div ref={containerRef} className={cn('relative space-y-1', className)}>
            <input
                id={inputId}
                ref={inputRef}
                type="text"
                value={inputValue}
                placeholder={placeholder}
                disabled={disabled || !!loadError}
                required={required}
                autoComplete="off"
                role="combobox"
                aria-expanded={showDropdown}
                aria-controls={listboxId}
                aria-autocomplete="list"
                aria-activedescendant={
                    activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
                }
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => {
                    if (inputValue.trim().length >= MIN_QUERY_LENGTH) {
                        setIsOpen(true)
                        if (suggestions.length === 0 && !isSearching && !searchError) {
                            scheduleSearch(inputValue)
                        }
                    }
                }}
                onBlur={() => {
                    if (allowFreeText) {
                        commitFreeText()
                    } else {
                        // Revert typed text that wasn't chosen from suggestions
                        setInputValue(value || '')
                        setIsOpen(false)
                        setActiveIndex(-1)
                    }
                    onBlur?.()
                }}
                onKeyDown={handleKeyDown}
                className={cn(
                    'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-white dark:ring-offset-gray-900 dark:placeholder:text-gray-400',
                    displayError
                        ? 'border-red-500 dark:border-red-400 focus-visible:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                )}
            />

            {dropdownList}

            {!isReady && !loadError && !disabled && (
                <p className="text-xs text-gray-500 dark:text-gray-400">Loading location search...</p>
            )}
            {displayError && (
                <div className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{displayError}</span>
                </div>
            )}
        </div>
    )
}
