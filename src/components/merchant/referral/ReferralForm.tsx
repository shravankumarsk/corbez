'use client'

import { useState, useEffect } from 'react'

interface ReferralFormProps {
  onSuccess?: () => void
  className?: string
}

export default function ReferralForm({ onSuccess, className = '' }: ReferralFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    referredBusinessName: '',
    referredContactName: '',
    referredEmail: '',
    referredPhone: '',
    referredAddress: '',
    referredCity: '',
    referredState: '',
    referredZipCode: '',
    whyGoodFit: '',
  })

  // Auto-save to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('corbez-referral-draft')
    if (saved) {
      try {
        setFormData(JSON.parse(saved))
      } catch {
        // Ignore invalid JSON
      }
    }
  }, [])

  useEffect(() => {
    if (Object.values(formData).some((v) => v.trim() !== '')) {
      localStorage.setItem('corbez-referral-draft', JSON.stringify(formData))
    }
  }, [formData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/merchant/referral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit referral')
      }

      setSuccess(true)
      localStorage.removeItem('corbez-referral-draft')

      setFormData({
        referredBusinessName: '',
        referredContactName: '',
        referredEmail: '',
        referredPhone: '',
        referredAddress: '',
        referredCity: '',
        referredState: '',
        referredZipCode: '',
        whyGoodFit: '',
      })

      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 1500)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-xl p-8 text-center ${className}`}>
        <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-2xl font-semibold text-green-900 mb-2">Referral submitted!</h3>
        <p className="text-green-700 mb-6">
          We'll reach out to them within 48 hours. You'll be notified when they sign up.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          Refer Another Restaurant
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="referredBusinessName" className="block text-sm font-medium text-secondary mb-2">
          Restaurant name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="referredBusinessName"
          name="referredBusinessName"
          required
          value={formData.referredBusinessName}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="e.g., The Local Bistro"
        />
      </div>

      <div>
        <label htmlFor="referredContactName" className="block text-sm font-medium text-secondary mb-2">
          Contact person name
        </label>
        <input
          type="text"
          id="referredContactName"
          name="referredContactName"
          value={formData.referredContactName}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="e.g., Maria Garcia"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="referredEmail" className="block text-sm font-medium text-secondary mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="referredEmail"
            name="referredEmail"
            required
            value={formData.referredEmail}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="contact@restaurant.com"
          />
        </div>
        <div>
          <label htmlFor="referredPhone" className="block text-sm font-medium text-secondary mb-2">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="referredPhone"
            name="referredPhone"
            required
            value={formData.referredPhone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      <div>
        <label htmlFor="referredAddress" className="block text-sm font-medium text-secondary mb-2">
          Street address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="referredAddress"
          name="referredAddress"
          required
          value={formData.referredAddress}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="123 Main Street"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <label htmlFor="referredCity" className="block text-sm font-medium text-secondary mb-2">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="referredCity"
            name="referredCity"
            required
            value={formData.referredCity}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="San Francisco"
          />
        </div>
        <div>
          <label htmlFor="referredState" className="block text-sm font-medium text-secondary mb-2">
            State <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="referredState"
            name="referredState"
            required
            value={formData.referredState}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="CA"
            maxLength={2}
          />
        </div>
        <div>
          <label htmlFor="referredZipCode" className="block text-sm font-medium text-secondary mb-2">
            Zip code
          </label>
          <input
            type="text"
            id="referredZipCode"
            name="referredZipCode"
            value={formData.referredZipCode}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="94102"
          />
        </div>
      </div>

      <div>
        <label htmlFor="whyGoodFit" className="block text-sm font-medium text-secondary mb-2">
          Why would they be a good fit? <span className="text-muted text-xs">(optional, max 500 characters)</span>
        </label>
        <textarea
          id="whyGoodFit"
          name="whyGoodFit"
          rows={4}
          maxLength={500}
          value={formData.whyGoodFit}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
          placeholder="e.g., They're near several tech offices and get a lot of lunch traffic..."
        />
        <p className="text-xs text-muted mt-1 text-right">{formData.whyGoodFit.length}/500</p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Submitting...
          </>
        ) : (
          <>
            Submit Referral
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </>
        )}
      </button>

      <p className="text-sm text-muted text-center">
        By submitting, you confirm that you have permission to share this restaurant's contact information.
      </p>
    </form>
  )
}
