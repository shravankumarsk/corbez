'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { StepBasicInfo, StepLocation, StepBusinessMetrics } from '@/components/merchant/onboarding'
import { PlaceData } from '@/components/merchant/GoogleMapsPlaceSearch'

const STEPS = [
  { number: 1, title: 'Business Info' },
  { number: 2, title: 'Location' },
  { number: 3, title: 'Details' },
]

interface FormData {
  // Step 1
  businessName: string
  description: string
  categories: string[]
  // Step 2
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  // Step 3
  avgOrderValue: number
  priceTier: string
  seatingCapacity: string
  peakHours: string[]
  cateringAvailable: boolean
  offersDelivery: boolean
}

export default function MerchantOnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [placeData, setPlaceData] = useState<PlaceData | null>(null)
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    description: '',
    categories: [],
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    avgOrderValue: 0,
    priceTier: '',
    seatingCapacity: '',
    peakHours: [],
    cateringAvailable: false,
    offersDelivery: false,
  })

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  // Auto-fill location data when place data is received from Google Maps
  useEffect(() => {
    if (placeData) {
      setFormData((prev) => ({
        ...prev,
        address: placeData.address || prev.address,
        city: placeData.city || prev.city,
        state: placeData.state || prev.state,
        zipCode: placeData.zipCode || prev.zipCode,
        phone: placeData.phone || prev.phone,
        priceTier: placeData.priceLevel
          ? ['', '$', '$$', '$$$', '$$$$'][placeData.priceLevel] || prev.priceTier
          : prev.priceTier,
      }))
    }
  }, [placeData])

  const checkOnboardingStatus = async () => {
    try {
      const res = await fetch('/api/merchant/onboarding')
      const data = await res.json()

      if (!data.needsOnboarding) {
        router.push('/dashboard/merchant')
        return
      }

      // Pre-fill existing data
      if (data.merchant) {
        const m = data.merchant
        setFormData((prev) => ({
          ...prev,
          businessName: m.businessName || '',
          description: m.description || '',
          categories: m.categories || [],
          address: m.locations?.[0]?.address || '',
          city: m.locations?.[0]?.city || '',
          state: m.locations?.[0]?.state || '',
          zipCode: m.locations?.[0]?.zipCode || '',
          phone: m.locations?.[0]?.phone || '',
          avgOrderValue: m.businessMetrics?.avgOrderValue || 0,
          priceTier: m.businessMetrics?.priceTier || '',
          seatingCapacity: m.businessMetrics?.seatingCapacity || '',
          peakHours: m.businessMetrics?.peakHours || [],
          cateringAvailable: m.businessMetrics?.cateringAvailable || false,
          offersDelivery: m.businessMetrics?.offersDelivery || false,
        }))
        setCurrentStep(data.currentStep || 1)
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateStep = (step: number): string | null => {
    if (step === 1) {
      if (!formData.businessName.trim()) return 'Please enter your business name'
      if (formData.categories.length === 0) return 'Please select at least one cuisine type'
    } else if (step === 2) {
      if (!formData.address.trim()) return 'Please enter your address'
      if (!formData.city.trim()) return 'Please enter your city'
      if (!formData.state) return 'Please select your state'
      if (!formData.zipCode.match(/^\d{5}$/)) return 'Please enter a valid 5-digit ZIP code'
    } else if (step === 3) {
      if (!formData.avgOrderValue || formData.avgOrderValue < 1) return 'Please enter your average order value'
      if (!formData.priceTier) return 'Please select a price range'
      if (!formData.seatingCapacity) return 'Please select your seating capacity'
      if (formData.peakHours.length === 0) return 'Please select at least one peak hour'
    }
    return null
  }

  const saveStep = async (step: number) => {
    setSaving(true)
    setError('')

    try {
      let stepData = {}

      if (step === 1) {
        stepData = {
          businessName: formData.businessName,
          description: formData.description,
          categories: formData.categories,
        }
      } else if (step === 2) {
        stepData = {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          phone: formData.phone,
        }
      } else if (step === 3) {
        stepData = {
          avgOrderValue: formData.avgOrderValue,
          priceTier: formData.priceTier,
          seatingCapacity: formData.seatingCapacity,
          peakHours: formData.peakHours,
          cateringAvailable: formData.cateringAvailable,
          offersDelivery: formData.offersDelivery,
        }
      }

      const res = await fetch('/api/merchant/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: step.toString(), data: stepData }),
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to save')
      }

      return true
    } catch (error) {
      console.error('Failed to save step:', error)
      setError(error instanceof Error ? error.message : 'Failed to save. Please try again.')
      return false
    } finally {
      setSaving(false)
    }
  }

  const handleNext = async () => {
    const validationError = validateStep(currentStep)
    if (validationError) {
      setError(validationError)
      return
    }

    const saved = await saveStep(currentStep)
    if (saved) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    setError('')
    setCurrentStep(currentStep - 1)
  }

  const handleComplete = async () => {
    const validationError = validateStep(3)
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/merchant/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to complete onboarding')
      }

      router.push('/dashboard/merchant')
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
      setError(error instanceof Error ? error.message : 'Failed to complete. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Image
              src="/brand%20assets/logo@2x.png"
              alt="corbez"
              width={40}
              height={40}
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold">
              <span className="text-secondary">cor</span>
              <span className="text-primary">bez</span>
            </span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      currentStep > step.number
                        ? 'bg-accent text-white'
                        : currentStep === step.number
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`hidden sm:block font-medium ${
                      currentStep >= step.number ? 'text-secondary' : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div
                      className={`h-1 rounded-full ${
                        currentStep > step.number ? 'bg-accent' : 'bg-gray-200'
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {currentStep === 1 && (
            <StepBasicInfo
              data={{
                businessName: formData.businessName,
                description: formData.description,
                categories: formData.categories,
              }}
              onChange={(data) => setFormData({ ...formData, ...data })}
              onPlaceDataChange={setPlaceData}
            />
          )}

          {currentStep === 2 && (
            <StepLocation
              data={{
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                phone: formData.phone,
              }}
              onChange={(data) => setFormData({ ...formData, ...data })}
              isAutoFilled={!!placeData}
            />
          )}

          {currentStep === 3 && (
            <StepBusinessMetrics
              data={{
                avgOrderValue: formData.avgOrderValue,
                priceTier: formData.priceTier,
                seatingCapacity: formData.seatingCapacity,
                peakHours: formData.peakHours,
                cateringAvailable: formData.cateringAvailable,
                offersDelivery: formData.offersDelivery,
              }}
              onChange={(data) => setFormData({ ...formData, ...data })}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={saving}
                className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={saving}
                className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Continue'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                disabled={saving}
                className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? 'Completing...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-muted mt-6">
          Need help? Contact us at{' '}
          <a href="mailto:support@corbez.com" className="text-primary hover:underline">
            support@corbez.com
          </a>
        </p>
      </div>
    </div>
  )
}
