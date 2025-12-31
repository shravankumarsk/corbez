'use client'

import { useEffect, useState } from 'react'

export interface GoogleMapsLoadOptions {
  libraries?: ('places' | 'geometry' | 'drawing' | 'visualization')[]
}

export function useGoogleMaps(options: GoogleMapsLoadOptions = {}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)

  useEffect(() => {
    // Check if already loaded
    if (window.google?.maps) {
      setIsLoaded(true)
      return
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Wait for it to load
      const checkLoaded = setInterval(() => {
        if (window.google?.maps) {
          setIsLoaded(true)
          clearInterval(checkLoaded)
        }
      }, 100)

      return () => clearInterval(checkLoaded)
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      setLoadError(new Error('Google Maps API key not found. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file.'))
      return
    }

    // Load the Google Maps script
    const script = document.createElement('script')
    const libraries = options.libraries || ['places']
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(',')}`
    script.async = true
    script.defer = true

    script.onload = () => {
      setIsLoaded(true)
    }

    script.onerror = () => {
      setLoadError(new Error('Failed to load Google Maps script'))
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup if component unmounts before script loads
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [options.libraries])

  return { isLoaded, loadError }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    google?: {
      maps: typeof google.maps
    }
  }
}
