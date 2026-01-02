'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface TrialExpirationBannerProps {
  trialEndDate?: string
  status?: string
}

export default function TrialExpirationBanner({
  trialEndDate,
  status,
}: TrialExpirationBannerProps) {
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!trialEndDate || status !== 'TRIALING') {
      setIsVisible(false)
      return
    }

    const calculateDaysRemaining = () => {
      const now = new Date()
      const endDate = new Date(trialEndDate)
      const diffTime = endDate.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setDaysRemaining(diffDays)

      // Only show banner if trial is ending within 30 days
      if (diffDays > 30 || diffDays < 0) {
        setIsVisible(false)
      }
    }

    calculateDaysRemaining()
    // Update daily
    const interval = setInterval(calculateDaysRemaining, 1000 * 60 * 60 * 24)

    return () => clearInterval(interval)
  }, [trialEndDate, status])

  if (!isVisible || daysRemaining === null) {
    return null
  }

  // Determine urgency level
  const isUrgent = daysRemaining <= 7
  const isCritical = daysRemaining <= 3

  // Choose colors based on urgency
  const bgColor = isCritical
    ? 'bg-red-50'
    : isUrgent
    ? 'bg-yellow-50'
    : 'bg-blue-50'

  const borderColor = isCritical
    ? 'border-red-200'
    : isUrgent
    ? 'border-yellow-200'
    : 'border-blue-200'

  const textColor = isCritical
    ? 'text-red-800'
    : isUrgent
    ? 'text-yellow-800'
    : 'text-blue-800'

  const buttonColor = isCritical
    ? 'bg-red-600 hover:bg-red-700'
    : isUrgent
    ? 'bg-yellow-600 hover:bg-yellow-700'
    : 'bg-blue-600 hover:bg-blue-700'

  const icon = isCritical ? '⚠️' : isUrgent ? '⏰' : '📅'

  return (
    <div
      className={`${bgColor} ${borderColor} border-l-4 p-4 mb-6 rounded-r-lg relative`}
      role="alert"
    >
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        aria-label="Dismiss"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div className="flex items-start gap-4 pr-8">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <h3 className={`font-semibold ${textColor} mb-1`}>
            {isCritical
              ? `Trial ends in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}!`
              : isUrgent
              ? `Trial ends soon - ${daysRemaining} days remaining`
              : `Free trial ends in ${daysRemaining} days`}
          </h3>
          <p className={`text-sm ${textColor} mb-3`}>
            {isCritical ? (
              <>
                <strong>Action required:</strong> Add a payment method now to avoid
                service interruption. After your trial ends, you'll be charged $9.99/month.
              </>
            ) : isUrgent ? (
              <>
                Add a payment method to continue using Corbez after your trial. You'll be
                charged $9.99/month starting{' '}
                {new Date(trialEndDate!).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                })}.
              </>
            ) : (
              <>
                Your free trial ends on{' '}
                {new Date(trialEndDate!).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}. Add a payment method now to ensure uninterrupted service.
              </>
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              href="/dashboard/merchant/billing"
              className={`inline-flex items-center gap-2 ${buttonColor} text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              {isCritical ? 'Add Payment Method Now' : 'Manage Billing'}
            </Link>
            {!isCritical && (
              <Link
                href="/pricing"
                className={`inline-flex items-center gap-2 bg-white ${textColor} border ${borderColor} px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm`}
              >
                View Pricing
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
