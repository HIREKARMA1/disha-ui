'use client'

import { useEffect, useRef, useState, useId } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { loadGoogleMaps } from '@/lib/googleMapsLoader'
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
    onBlur?: () => void
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
    onBlur,
}: GoogleLocationAutocompleteProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
    const onChangeRef = useRef(onChange)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [isReady, setIsReady] = useState(false)
    const inputId = useId()

    useEffect(() => {
        onChangeRef.current = onChange
    }, [onChange])

    useEffect(() => {
        if (inputRef.current && value !== inputRef.current.value) {
            inputRef.current.value = value
        }
    }, [value])

    useEffect(() => {
        if (disabled || !inputRef.current) return

        let isMounted = true
        let listener: google.maps.MapsEventListener | null = null

        loadGoogleMaps()
            .then((google) => {
                if (!isMounted || !inputRef.current) return

                if (autocompleteRef.current) {
                    google.maps.event.clearInstanceListeners(autocompleteRef.current)
                }

                autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
                    fields: [
                        'address_components',
                        'formatted_address',
                        'geometry',
                        'name',
                        'place_id'
                    ]
                })
                console.log('Autocomplete initialized')
                console.log('Autocomplete Created Successfully')
                listener = autocompleteRef.current.addListener('place_changed', () => {
                    const place = autocompleteRef.current?.getPlace()
                    if (!place) return
                
                    console.log('Selected Place:', place)

                    const { parseGooglePlace } = require('@/lib/googlePlacesUtils') as typeof import('@/lib/googlePlacesUtils')
                    const parsed = parseGooglePlace(place)

                    if (!parsed.formattedAddress && !parsed.city && !parsed.locality) {
                        return
                    }

                    if (inputRef.current) {
                        inputRef.current.value = parsed.formattedAddress
                    }

                    onChangeRef.current?.(parsed)
                })

                setIsReady(true)
                setLoadError(null)
            })
            .catch((err: Error) => {
                if (!isMounted) return
                setLoadError(err.message || 'Failed to load Google Maps')
            })

        return () => {
            isMounted = false
            if (listener) {
                listener.remove()
            }
            if (autocompleteRef.current) {
                google.maps.event.clearInstanceListeners(autocompleteRef.current)
                autocompleteRef.current = null
            }
        }
    }, [disabled, mode])

    const displayError = error || loadError

    return (
        <div className={cn('space-y-1', className)}>
            <input
                id={inputId}
                ref={inputRef}
                type="text"
                defaultValue={value}
                placeholder={placeholder}
                disabled={disabled || !!loadError}
                required={required}
                autoComplete="off"
                onBlur={onBlur}
                className={cn(
                    'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-white dark:ring-offset-gray-900 dark:placeholder:text-gray-400',
                    displayError
                        ? 'border-red-500 dark:border-red-400 focus-visible:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                )}
            />
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
