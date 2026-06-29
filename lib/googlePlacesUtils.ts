import type { ParsedGooglePlace } from '@/types/googlePlaces'

function getAddressComponent(
    components: google.maps.GeocoderAddressComponent[],
    type: string,
    useShortName = false
): string | undefined {
    const match = components.find((component) => component.types.includes(type))
    if (!match) return undefined
    return useShortName ? match.short_name : match.long_name
}

function extractLocality(components: google.maps.GeocoderAddressComponent[]): string | undefined {
    const localityTypes = [
        'locality',
        'postal_town',
        'sublocality',
        'sublocality_level_1',
        'administrative_area_level_3',
        'administrative_area_level_2',
    ]

    for (const type of localityTypes) {
        const value = getAddressComponent(components, type)
        if (value) return value
    }

    return undefined
}

export function parseGooglePlace(place: google.maps.places.PlaceResult): ParsedGooglePlace {
    const components = place.address_components ?? []
    const locality = extractLocality(components)
    const lat = place.geometry?.location?.lat()
    const lng = place.geometry?.location?.lng()

    return {
        formattedAddress: place.formatted_address ?? place.name ?? '',
        locality,
        city: locality,
        state: getAddressComponent(components, 'administrative_area_level_1'),
        country: getAddressComponent(components, 'country'),
        postalCode: getAddressComponent(components, 'postal_code'),
        latitude: typeof lat === 'number' ? lat : undefined,
        longitude: typeof lng === 'number' ? lng : undefined,
    }
}

export function getLocationDisplayValue(place: ParsedGooglePlace): string {
    if (place.locality || place.city) {
        const parts = [place.locality || place.city, place.state, place.country].filter(Boolean)
        return parts.join(', ')
    }
    return place.formattedAddress
}

export function buildLocationLabel(city?: string, state?: string, country?: string): string {
    return [city, state, country].filter(Boolean).join(', ')
}
