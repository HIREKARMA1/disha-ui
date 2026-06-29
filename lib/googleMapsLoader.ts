import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

let loadPromise: Promise<typeof google> | null = null
let optionsConfigured = false

export function getGoogleMapsApiKey(): string {
    const key =
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
        process.env.REACT_APP_GOOGLE_MAPS_API_KEY ||
        ''
    return key.replace(/^["']|["']$/g, '')
}

export function loadGoogleMaps(): Promise<typeof google> {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('Google Maps can only load in the browser'))
    }

    const apiKey = getGoogleMapsApiKey()
    if (!apiKey) {
        return Promise.reject(new Error('Google Maps API key is not configured'))
    }

    if (loadPromise) {
        return loadPromise
    }

    if (!optionsConfigured) {
        setOptions({
            key: apiKey,
            v: 'weekly',
        })
        optionsConfigured = true
    }

    loadPromise = importLibrary('places').then(() => {
        if (!window.google?.maps) {
            throw new Error('Google Maps failed to load')
        }
        return window.google
    })

    return loadPromise
}
