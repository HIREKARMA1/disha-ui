"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Country, State, City } from 'country-state-city'
import { MapPin, Search } from 'lucide-react'
import { motion } from 'framer-motion'

interface LocationSelectorProps {
    selectedLocations: string[]
    onSelectionChange: (locations: string[]) => void
    placeholder?: string
    disabled?: boolean
    className?: string
}

export function LocationSelector({
    selectedLocations,
    onSelectionChange,
    placeholder = "Search for countries, states, or cities...",
    disabled = false,
    className = ""
}: LocationSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const searchCancelRef = useRef<boolean>(false)

    // Get all countries
    const countries = Country.getAllCountries()
    // Find India country for priority search
    const indiaCountry = countries.find(c => c.isoCode === 'IN' || c.name.toLowerCase() === 'india')

    // Debounce search term to avoid excessive searches (reduced for faster response)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
        }, 150) // 150ms debounce (reduced from 300ms for faster response)

        return () => clearTimeout(timer)
    }, [searchTerm])

    // Search functionality - optimized with async processing
    const [searchResults, setSearchResults] = useState<Array<{ type: 'country' | 'state' | 'city', name: string, country: string, state?: string, fullName: string }>>([])

    useEffect(() => {
        if (!debouncedSearchTerm.trim() || debouncedSearchTerm.length < 2) {
            setSearchResults([])
            setIsSearching(false)
            setShowSuggestions(false)
            return
        }

        setShowSuggestions(true)
        setIsSearching(true)
        const query = debouncedSearchTerm.toLowerCase().trim()
        const indiaResults: Array<{ type: 'country' | 'state' | 'city', name: string, country: string, state?: string, fullName: string }> = []
        const otherResults: Array<{ type: 'country' | 'state' | 'city', name: string, country: string, state?: string, fullName: string }> = []
        const MAX_RESULTS = 50
        const MAX_INDIA_RESULTS = 30 // Prioritize India results
        searchCancelRef.current = false

        // Search India locations first (priority)
        const searchIndia = () => {
            if (!indiaCountry || searchCancelRef.current) return

            const country = indiaCountry
            
            // Search India country name
            if (country.name.toLowerCase().includes(query)) {
                indiaResults.push({
                    type: 'country',
                    name: country.name,
                    country: country.name,
                    fullName: country.name
                })
            }

            // Search Indian states
            if (indiaResults.length < MAX_INDIA_RESULTS) {
                const countryStates = State.getStatesOfCountry(country.isoCode)
                for (const state of countryStates) {
                    if (searchCancelRef.current || indiaResults.length >= MAX_INDIA_RESULTS) break
                    if (state.name.toLowerCase().includes(query)) {
                        indiaResults.push({
                            type: 'state',
                            name: state.name,
                            country: country.name,
                            state: state.name,
                            fullName: `${state.name}, ${country.name}`
                        })
                    }
                }
            }

            // Search Indian cities (limit to prevent excessive processing)
            if (indiaResults.length < MAX_INDIA_RESULTS) {
                const countryStates = State.getStatesOfCountry(country.isoCode)
                for (const state of countryStates) {
                    if (searchCancelRef.current || indiaResults.length >= MAX_INDIA_RESULTS) break
                    const stateCities = City.getCitiesOfState(country.isoCode, state.isoCode)
                    for (const city of stateCities) {
                        if (searchCancelRef.current || indiaResults.length >= MAX_INDIA_RESULTS) break
                        if (city.name.toLowerCase().includes(query)) {
                            indiaResults.push({
                                type: 'city',
                                name: city.name,
                                country: country.name,
                                state: state.name,
                                fullName: `${city.name}, ${state.name}, ${country.name}`
                            })
                        }
                    }
                }
            }

            // Update results immediately with India results
            if (!searchCancelRef.current) {
                setSearchResults([...indiaResults, ...otherResults])
                if (indiaResults.length >= MAX_INDIA_RESULTS || otherResults.length + indiaResults.length >= MAX_RESULTS) {
                    setIsSearching(false)
                }
            }
        }

        // Search other countries
        const searchOtherCountries = () => {
            let countryIndex = 0
            const BATCH_SIZE = 5 // Smaller batch for faster processing

            const processBatch = () => {
                // Check if search was cancelled
                if (searchCancelRef.current) return

                const startIndex = countryIndex
                const endIndex = Math.min(startIndex + BATCH_SIZE, countries.length)

                for (let i = startIndex; i < endIndex; i++) {
                    if (searchCancelRef.current || (indiaResults.length + otherResults.length) >= MAX_RESULTS) break

                    const country = countries[i]
                    
                    // Skip India (already processed)
                    if (country.isoCode === 'IN' || country.name.toLowerCase() === 'india') {
                        continue
                    }

                    // Search country name
                    if ((indiaResults.length + otherResults.length) < MAX_RESULTS && country.name.toLowerCase().includes(query)) {
                        otherResults.push({
                            type: 'country',
                            name: country.name,
                            country: country.name,
                            fullName: country.name
                        })
                    }

                    // Search states (skip if we have enough results)
                    if ((indiaResults.length + otherResults.length) < MAX_RESULTS) {
                        const countryStates = State.getStatesOfCountry(country.isoCode)
                        for (const state of countryStates) {
                            if (searchCancelRef.current || (indiaResults.length + otherResults.length) >= MAX_RESULTS) break
                            if (state.name.toLowerCase().includes(query)) {
                                otherResults.push({
                                    type: 'state',
                                    name: state.name,
                                    country: country.name,
                                    state: state.name,
                                    fullName: `${state.name}, ${country.name}`
                                })
                            }
                        }
                    }

                    // Search cities (skip if we have enough results)
                    if ((indiaResults.length + otherResults.length) < MAX_RESULTS) {
                        const countryStates = State.getStatesOfCountry(country.isoCode)
                        for (const state of countryStates.slice(0, 5)) { // Limit to first 5 states per country for speed
                            if (searchCancelRef.current || (indiaResults.length + otherResults.length) >= MAX_RESULTS) break
                            const stateCities = City.getCitiesOfState(country.isoCode, state.isoCode)
                            for (const city of stateCities.slice(0, 10)) { // Limit to first 10 cities per state for speed
                                if (searchCancelRef.current || (indiaResults.length + otherResults.length) >= MAX_RESULTS) break
                                if (city.name.toLowerCase().includes(query)) {
                                    otherResults.push({
                                        type: 'city',
                                        name: city.name,
                                        country: country.name,
                                        state: state.name,
                                        fullName: `${city.name}, ${state.name}, ${country.name}`
                                    })
                                }
                            }
                        }
                    }
                }

                countryIndex = endIndex

                // Update results progressively
                if (!searchCancelRef.current) {
                    setSearchResults([...indiaResults, ...otherResults])
                }

                if (countryIndex < countries.length && (indiaResults.length + otherResults.length) < MAX_RESULTS && !searchCancelRef.current) {
                    // Continue processing in next frame
                    requestAnimationFrame(processBatch)
                } else {
                    // Search complete
                    if (!searchCancelRef.current) {
                        setSearchResults([...indiaResults, ...otherResults])
                        setIsSearching(false)
                    }
                }
            }

            processBatch()
        }

        // Start with India search (synchronous for immediate results)
        searchIndia()
        
        // Then search other countries (asynchronous)
        setTimeout(() => {
            if (!searchCancelRef.current) {
                searchOtherCountries()
            }
        }, 0)

        // Cleanup function - cancel search if search term changes
        return () => {
            searchCancelRef.current = true
            setIsSearching(false)
        }
    }, [debouncedSearchTerm, countries])

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }

        if (showSuggestions) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showSuggestions])

    const handleAddFromSearch = (result: typeof searchResults[0]) => {
        const locationString = result.fullName
        if (!selectedLocations.includes(locationString)) {
            onSelectionChange([...selectedLocations, locationString])
        }
        setSearchTerm('')
        setShowSuggestions(false)
    }

    const handleRemoveLocation = (locationToRemove: string) => {
        onSelectionChange(selectedLocations.filter(loc => loc !== locationToRemove))
    }

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Display Selected Locations - Above Search Input */}
            {selectedLocations.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                    {selectedLocations.map((location) => (
                        <motion.span
                            key={location}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-pink-100 to-pink-200 dark:from-pink-900/50 dark:to-pink-800/50 text-pink-800 dark:text-pink-200 rounded-lg text-sm font-medium shadow-sm border border-pink-300/50 dark:border-pink-700/50"
                        >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{location}</span>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveLocation(location)
                                }}
                                className="ml-1 hover:opacity-70 focus:outline-none transition-opacity text-pink-600 dark:text-pink-400 font-bold text-lg leading-none"
                                aria-label={`Remove ${location}`}
                            >
                                ×
                            </button>
                        </motion.span>
                    ))}
                </div>
            )}

            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => {
                        if (searchTerm.trim().length >= 2 && searchResults.length > 0) {
                            setShowSuggestions(true)
                        }
                    }}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full pl-10 pr-10 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors ${
                        disabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                />
                {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchTerm.trim().length >= 2 && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                    {isSearching ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                            <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            Searching...
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="py-2">
                            {searchResults.map((result, index) => (
                                <button
                                    key={`${result.type}-${result.name}-${index}`}
                                    type="button"
                                    onClick={() => handleAddFromSearch(result)}
                                    disabled={selectedLocations.includes(result.fullName)}
                                    className={`w-full px-4 py-2.5 text-left rounded-lg transition-colors ${
                                        selectedLocations.includes(result.fullName)
                                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                            : 'bg-white dark:bg-gray-800 hover:bg-pink-50 dark:hover:bg-pink-900/20 text-gray-900 dark:text-white cursor-pointer'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-pink-500 flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{result.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {result.type === 'city' && `${result.state}, ${result.country}`}
                                                {result.type === 'state' && result.country}
                                                {result.type === 'country' && 'Country'}
                                            </div>
                                        </div>
                                        {selectedLocations.includes(result.fullName) && (
                                            <span className="text-xs text-pink-600 dark:text-pink-400 font-medium">Added</span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                            No locations found. Try a different search term.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
