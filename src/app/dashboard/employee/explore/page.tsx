'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import MerchantCard from '@/components/employee/MerchantCard'

interface Merchant {
  id: string
  businessName: string
  logo?: string
  description?: string
  address: {
    city: string
    state: string
  }
  distance?: number
  discount: {
    id: string
    type: string
    name: string
    percentage: number
    isNegotiated: boolean
    monthlyUsageLimit?: number | null
  } | null
  hasClaimed: boolean
}

export default function ExplorePage() {
  const router = useRouter()
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [useLocation, setUseLocation] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState<string | null>(null)

  const fetchMerchants = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (location) {
        params.set('lat', location.lat.toString())
        params.set('lng', location.lng.toString())
      }

      const response = await fetch(`/api/employee/merchants?${params}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setMerchants(data.merchants)
        setCompanyName(data.companyName)
      } else {
        setError(data.error || 'Failed to load restaurants')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Failed to load restaurants')
    } finally {
      setLoading(false)
    }
  }, [search, location])

  useEffect(() => {
    fetchMerchants()
  }, [fetchMerchants])

  const handleEnableLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setUseLocation(true)
      },
      (err) => {
        console.error('Geolocation error:', err)
        setError('Unable to get your location. Please enable location access.')
      }
    )
  }

  const handleDisableLocation = () => {
    setLocation(null)
    setUseLocation(false)
  }

  const handleClaim = async (merchantId: string, discountId: string) => {
    try {
      setClaimingId(merchantId)

      const response = await fetch('/api/employee/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId, discountId }),
      })

      const data = await response.json()

      if (data.success) {
        // Update local state to reflect the claim
        setMerchants(prev =>
          prev.map(m =>
            m.id === merchantId ? { ...m, hasClaimed: true } : m
          )
        )
        // Redirect to wallet to show the new coupon
        router.push('/dashboard/employee/wallet')
      } else {
        setError(data.error || 'Failed to claim discount')
      }
    } catch (err) {
      console.error('Claim error:', err)
      setError('Failed to claim discount')
    } finally {
      setClaimingId(null)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchMerchants()
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Explore Restaurants</h1>
        <p className="text-gray-600 mt-1">
          Discover partner restaurants and claim exclusive discounts
          {companyName && (
            <span className="text-primary font-medium"> for {companyName} employees</span>
          )}
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <Input
            type="text"
            placeholder="Search restaurants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        <Button
          variant={useLocation ? 'primary' : 'outline'}
          onClick={useLocation ? handleDisableLocation : handleEnableLocation}
          className="whitespace-nowrap"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {useLocation ? 'Using Location' : 'Use My Location'}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-600 underline text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl h-48" />
            </div>
          ))}
        </div>
      ) : merchants.length === 0 ? (
        /* Empty State */
        <Card variant="bordered">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">No Restaurants Found</h3>
            <p className="text-gray-500 text-sm">
              {search
                ? `No restaurants match "${search}". Try a different search.`
                : 'No partner restaurants are available yet. Check back soon!'}
            </p>
            {search && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearch('')
                  fetchMerchants()
                }}
              >
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Merchant Grid */
        <div className="grid gap-4 md:grid-cols-2">
          {merchants.map((merchant) => (
            <MerchantCard
              key={merchant.id}
              merchant={merchant}
              onClaim={handleClaim}
              isLoading={claimingId === merchant.id}
            />
          ))}
        </div>
      )}

      {/* Results Count */}
      {!loading && merchants.length > 0 && (
        <p className="text-sm text-gray-500 mt-6 text-center">
          Showing {merchants.length} restaurant{merchants.length !== 1 ? 's' : ''}
          {useLocation && ' sorted by distance'}
        </p>
      )}
    </div>
  )
}
