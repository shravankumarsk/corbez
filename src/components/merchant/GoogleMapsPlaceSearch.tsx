'use client'

import { useEffect, useRef, useState } from 'react'
import { useGoogleMaps } from '@/hooks/useGoogleMaps'

export interface PlaceData {
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  phone?: string
  website?: string
  priceLevel?: number // 0-4 (corresponds to $ to $$$$)
  types?: string[] // e.g., ['restaurant', 'food', 'italian_restaurant']
  location?: {
    lat: number
    lng: number
  }
  hours?: {
    open_now?: boolean
    weekday_text?: string[]
  }
}

interface GoogleMapsPlaceSearchProps {
  onPlaceSelected: (placeData: PlaceData) => void
  placeholder?: string
  className?: string
}

export function GoogleMapsPlaceSearch({
  onPlaceSelected,
  placeholder = 'Search for your restaurant on Google Maps...',
  className = '',
}: GoogleMapsPlaceSearchProps) {
  const { isLoaded, loadError } = useGoogleMaps({ libraries: ['places'] })
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return

    try {
      // Initialize Autocomplete with restaurant-specific options
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['establishment'],
        fields: [
          'name',
          'formatted_address',
          'address_components',
          'formatted_phone_number',
          'international_phone_number',
          'website',
          'price_level',
          'types',
          'geometry',
          'opening_hours',
        ],
      })

      // Restrict to restaurants (will still show other businesses but prioritize restaurants)
      autocomplete.setComponentRestrictions({ country: 'us' })

      // Listen for place selection
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()

        if (!place.geometry || !place.geometry.location) {
          setError('No details available for this place. Please try another search.')
          return
        }

        setIsSearching(true)
        setError(null)

        try {
          const placeData = extractPlaceData(place)
          onPlaceSelected(placeData)
        } catch (err) {
          setError('Error processing place data. Please try again.')
          console.error('Error extracting place data:', err)
        } finally {
          setIsSearching(false)
        }
      })

      autocompleteRef.current = autocomplete
    } catch (err) {
      setError('Error initializing Google Maps search')
      console.error('Autocomplete initialization error:', err)
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [isLoaded, onPlaceSelected])

  function extractPlaceData(place: google.maps.places.PlaceResult): PlaceData {
    const addressComponents = place.address_components || []

    // Extract address components
    const getComponent = (type: string, useShortName = false) => {
      const component = addressComponents.find((c) => c.types.includes(type))
      return component ? (useShortName ? component.short_name : component.long_name) : ''
    }

    const streetNumber = getComponent('street_number')
    const route = getComponent('route')
    const address = [streetNumber, route].filter(Boolean).join(' ')

    const city =
      getComponent('locality') ||
      getComponent('sublocality') ||
      getComponent('administrative_area_level_3')

    const state = getComponent('administrative_area_level_1', true)
    const zipCode = getComponent('postal_code')

    // Map price_level to price tier
    // Google: 0-4 (0=free, 1=inexpensive, 2=moderate, 3=expensive, 4=very expensive)
    const priceLevel = place.price_level

    // Extract coordinates
    const location = place.geometry?.location
      ? {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        }
      : undefined

    return {
      name: place.name || '',
      address,
      city,
      state,
      zipCode,
      phone: place.formatted_phone_number || place.international_phone_number,
      website: place.website,
      priceLevel,
      types: place.types,
      location,
      hours: place.opening_hours
        ? {
            open_now: place.opening_hours.isOpen?.(),
            weekday_text: place.opening_hours.weekday_text,
          }
        : undefined,
    }
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <svg
            className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-red-800">Google Maps Not Available</h3>
            <p className="mt-1 text-sm text-red-700">{loadError.message}</p>
            <p className="mt-2 text-xs text-red-600">
              To enable auto-fill, add your Google Maps API key to the environment variables.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="space-y-2">
        <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        <p className="text-xs text-gray-500">Loading Google Maps...</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${className}`}
          disabled={isSearching}
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600">
          <svg
            className="h-4 w-4 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Start typing your restaurant name and select it from the dropdown to auto-fill your business
        details
      </p>
    </div>
  )
}
