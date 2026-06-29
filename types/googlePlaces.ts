export interface ParsedGooglePlace {
    formattedAddress: string
    locality?: string
    city?: string
    state?: string
    country?: string
    postalCode?: string
    latitude?: number
    longitude?: number
}

export type GoogleLocationMode =
  | 'locality'
  | 'address'
  | 'all'