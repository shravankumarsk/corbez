'use client'

import { useState, useEffect } from 'react'
import { GoogleMapsPlaceSearch, PlaceData } from '@/components/merchant/GoogleMapsPlaceSearch'

interface Category {
  _id: string
  name: string
  slug: string
  icon?: string
}

interface StepBasicInfoProps {
  data: {
    businessName: string
    description: string
    categories: string[]
  }
  onChange: (data: { businessName: string; description: string; categories: string[] }) => void
  onPlaceDataChange?: (placeData: PlaceData | null) => void
}

export default function StepBasicInfo({ data, onChange, onPlaceDataChange }: StepBasicInfoProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showManualEntry, setShowManualEntry] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const handlePlaceSelected = (placeData: PlaceData) => {
    // Auto-fill business name
    onChange({ ...data, businessName: placeData.name })

    // Pass place data to parent for use in Step 2 (location)
    if (onPlaceDataChange) {
      onPlaceDataChange(placeData)
    }

    // Auto-map Google Maps types to categories if possible
    // This is optional - could be enhanced later
    setShowManualEntry(true)
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const result = await res.json()
      if (result.success) {
        setCategories(result.categories)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (categoryId: string) => {
    const newCategories = data.categories.includes(categoryId)
      ? data.categories.filter((id) => id !== categoryId)
      : [...data.categories, categoryId]
    onChange({ ...data, categories: newCategories })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-secondary mb-2">Tell us about your business</h2>
        <p className="text-muted">Help corporate employees discover you</p>
      </div>

      {/* Google Maps Search - Quick Auto-Fill */}
      {!showManualEntry && (
        <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <svg
              className="w-6 h-6 text-primary flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-secondary mb-1">Quick Auto-Fill (Recommended)</h3>
              <p className="text-sm text-muted">
                Search for your restaurant on Google Maps to automatically fill your business details
              </p>
            </div>
          </div>
          <GoogleMapsPlaceSearch onPlaceSelected={handlePlaceSelected} />
          <button
            type="button"
            onClick={() => setShowManualEntry(true)}
            className="mt-4 text-sm text-primary hover:text-primary-dark font-medium"
          >
            Or enter manually →
          </button>
        </div>
      )}

      <div>
        <label htmlFor="businessName" className="block text-sm font-medium text-secondary mb-2">
          Business Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="businessName"
          value={data.businessName}
          onChange={(e) => onChange({ ...data, businessName: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          placeholder="Your restaurant name"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-secondary mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          rows={3}
          maxLength={500}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          placeholder="What makes your restaurant special? (optional)"
        />
        <p className="text-xs text-muted mt-1">{data.description.length}/500 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary mb-3">
          Cuisine Type <span className="text-red-500">*</span>
        </label>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((category) => (
              <button
                key={category._id}
                type="button"
                onClick={() => toggleCategory(category._id)}
                className={`px-4 py-3 rounded-xl border-2 text-left transition-all ${
                  data.categories.includes(category._id)
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-muted text-center py-4">No categories available</p>
        )}
        {data.categories.length > 0 && (
          <p className="text-xs text-muted mt-2">{data.categories.length} selected</p>
        )}
      </div>
    </div>
  )
}
