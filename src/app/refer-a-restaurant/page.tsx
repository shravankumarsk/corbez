'use client'

import { useState } from 'react'
import { Navbar, Footer } from '@/components/landing'
import { useRouter } from 'next/navigation'
import { usePromotion } from '@/lib/hooks/usePromotion'

const steps = [
  {
    step: 1,
    title: 'Tell us about them',
    description: 'Share the restaurant\'s contact info. Takes just 2 minutes.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    step: 2,
    title: 'We\'ll reach out',
    description: 'Our team will contact them within 48 hours with a personal introduction.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    step: 3,
    title: 'You both save',
    description: 'When they join and start using Corbez, you earn up to 3 months free.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

export default function ReferRestaurantPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const promo = usePromotion()

  // Referral bonus is current trial + 3 months (9 months during promo, 6 months after)
  const referralBonusMonths = promo.trialMonths + 3

  const rewards = [
    {
      title: 'When they sign up',
      reward: '1 month free',
      description: 'Earn your first month when they complete registration',
    },
    {
      title: 'When they convert',
      reward: '2 more months',
      description: 'Get 2 additional months when they become a paying customer',
    },
    {
      title: 'They get rewarded too',
      reward: `${referralBonusMonths} months free`,
      description: `Your referral gets an extended ${referralBonusMonths}-month trial (vs standard ${promo.trialText})`,
    },
  ]

  const [formData, setFormData] = useState({
    referredBusinessName: '',
    referredContactName: '',
    referredEmail: '',
    referredPhone: '',
    referredAddress: '',
    referredCity: '',
    referredState: '',
    referredZip: '',
    referredNotes: '',
  })

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
      // Reset form
      setFormData({
        referredBusinessName: '',
        referredContactName: '',
        referredEmail: '',
        referredPhone: '',
        referredAddress: '',
        referredCity: '',
        referredState: '',
        referredZip: '',
        referredNotes: '',
      })

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/merchant/referrals')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
              Earn up to 3 months free
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
              Know a restaurant that should be on{' '}
              <span className="text-primary">Corbez?</span>
            </h1>
            <p className="text-xl text-muted mb-8">
              Refer a restaurant and you&apos;ll both win. They get 9 months free to try Corbez risk-free.
              You get up to 3 months free when they join.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-secondary text-center mb-4">
            How it works
          </h2>
          <p className="text-lg text-muted text-center mb-12 max-w-2xl mx-auto">
            Three simple steps to help a fellow restaurant owner and save money yourself.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.step} className="relative bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className="absolute -top-4 left-8 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                  {step.step}
                </div>
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-3">
                  {step.title}
                </h3>
                <p className="text-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rewards Breakdown */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-secondary text-center mb-12">
            Reward breakdown
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {rewards.map((reward, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border-2 border-gray-100 hover:border-primary/30 transition-colors">
                <div className="text-3xl font-bold text-primary mb-2">
                  {reward.reward}
                </div>
                <h3 className="text-lg font-semibold text-secondary mb-2">
                  {reward.title}
                </h3>
                <p className="text-sm text-muted">
                  {reward.description}
                </p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted mt-8 max-w-2xl mx-auto">
            *Rewards activate after the referred restaurant processes 10+ verified employee visits.
            Maximum {promo.trialMonths * 2} months free rewards per year per merchant.
          </p>
        </div>
      </section>

      {/* Referral Form */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4">
              Refer a restaurant
            </h2>
            <p className="text-lg text-muted">
              Fill out the form below and we&apos;ll reach out to them within 48 hours.
            </p>
          </div>

          {success && (
            <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-green-900 mb-2">
                Referral submitted successfully!
              </h3>
              <p className="text-green-700">
                We&apos;ll reach out to them soon. Redirecting you to your referrals dashboard...
              </p>
            </div>
          )}

          {error && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-8 space-y-6">
            {/* Business Name */}
            <div>
              <label htmlFor="referredBusinessName" className="block text-sm font-medium text-secondary mb-2">
                Restaurant name *
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

            {/* Contact Name */}
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

            {/* Email and Phone */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="referredEmail" className="block text-sm font-medium text-secondary mb-2">
                  Email *
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
                  Phone *
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

            {/* Address */}
            <div>
              <label htmlFor="referredAddress" className="block text-sm font-medium text-secondary mb-2">
                Street address *
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

            {/* City, State, Zip */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label htmlFor="referredCity" className="block text-sm font-medium text-secondary mb-2">
                  City *
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
                  State *
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
                <label htmlFor="referredZip" className="block text-sm font-medium text-secondary mb-2">
                  Zip code
                </label>
                <input
                  type="text"
                  id="referredZip"
                  name="referredZip"
                  value={formData.referredZip}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="94102"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="referredNotes" className="block text-sm font-medium text-secondary mb-2">
                Why would they be a good fit? (optional)
              </label>
              <textarea
                id="referredNotes"
                name="referredNotes"
                rows={4}
                value={formData.referredNotes}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                placeholder="e.g., They're near several tech offices and get a lot of lunch traffic..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || success}
              className="w-full bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
              By submitting, you confirm that you have permission to share this restaurant&apos;s contact information.
            </p>
          </form>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl p-8 border border-gray-200">
            <div className="flex items-center justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-xl text-muted mb-4">
              &ldquo;I&apos;ve referred 5 restaurants and earned {promo.trialMonths * 2} months free. It&apos;s a no-brainer—help out your neighbors and save money.&rdquo;
            </p>
            <p className="text-secondary font-medium">
              — Tony, Owner of Bella Pizza
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
