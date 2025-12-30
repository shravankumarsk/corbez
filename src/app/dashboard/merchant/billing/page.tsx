'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface SubscriptionData {
  status: string
  currentPeriodEnd?: string
  trialEnd?: string
  cancelAtPeriodEnd?: boolean
}

function BillingContent() {
  const searchParams = useSearchParams()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Check for success/cancel params from Stripe redirect
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setMessage({ type: 'success', text: 'Subscription activated successfully!' })
    } else if (searchParams.get('canceled') === 'true') {
      setMessage({ type: 'error', text: 'Checkout was canceled.' })
    }
  }, [searchParams])

  // Fetch subscription status
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/stripe/subscription')
        const data = await response.json()

        if (data.success) {
          setSubscription(data.subscription)
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [])

  const handleSubscribe = async () => {
    setActionLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success && data.url) {
        window.location.href = data.url
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to start checkout' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to start checkout. Please try again.' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleManageBilling = async () => {
    setActionLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success && data.url) {
        window.location.href = data.url
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to open billing portal' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to open billing portal. Please try again.' })
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      TRIALING: 'bg-blue-100 text-blue-800',
      ACTIVE: 'bg-green-100 text-green-800',
      PAST_DUE: 'bg-yellow-100 text-yellow-800',
      CANCELED: 'bg-gray-100 text-gray-800',
      UNPAID: 'bg-red-100 text-red-800',
      NONE: 'bg-gray-100 text-gray-800',
    }

    const labels: Record<string, string> = {
      TRIALING: 'Free Trial',
      ACTIVE: 'Active',
      PAST_DUE: 'Past Due',
      CANCELED: 'Canceled',
      UNPAID: 'Unpaid',
      NONE: 'No Subscription',
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.NONE}`}>
        {labels[status] || status}
      </span>
    )
  }

  const isActive = subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING'

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-600 mt-1">Manage your Corbe subscription</p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Pricing Card */}
      <Card variant="bordered" className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Corbe for Restaurants</h2>
            {!loading && subscription && getStatusBadge(subscription.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold text-gray-900">$9.99</span>
            <span className="text-gray-600">/month</span>
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-2 text-gray-700">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              6-month free trial
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Unlimited employee verifications
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Custom discount tiers by company
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              QR scanner & verification history
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Cancel anytime
            </li>
          </ul>

          {loading ? (
            <div className="animate-pulse bg-gray-200 h-10 rounded-lg" />
          ) : !isActive ? (
            <Button
              variant="primary"
              className="w-full"
              onClick={handleSubscribe}
              isLoading={actionLoading}
            >
              Start Free Trial
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleManageBilling}
              isLoading={actionLoading}
            >
              Manage Subscription
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Subscription Details */}
      {!loading && subscription && isActive && (
        <Card variant="bordered">
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Subscription Details</h2>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-gray-600">Status</dt>
                <dd>{getStatusBadge(subscription.status)}</dd>
              </div>

              {subscription.trialEnd && subscription.status === 'TRIALING' && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Trial ends</dt>
                  <dd className="font-medium text-gray-900">{formatDate(subscription.trialEnd)}</dd>
                </div>
              )}

              {subscription.currentPeriodEnd && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">
                    {subscription.cancelAtPeriodEnd ? 'Access until' : 'Next billing date'}
                  </dt>
                  <dd className="font-medium text-gray-900">
                    {formatDate(subscription.currentPeriodEnd)}
                  </dd>
                </div>
              )}

              {subscription.cancelAtPeriodEnd && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Your subscription is set to cancel at the end of the billing period.
                    You can reactivate it anytime from the billing portal.
                  </p>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* FAQ */}
      <div className="mt-8">
        <h3 className="font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-800">When will I be charged?</h4>
            <p className="text-gray-600 text-sm mt-1">
              You won&apos;t be charged during your 6-month free trial. After the trial ends,
              you&apos;ll be charged $9.99/month. You can cancel anytime.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800">Can I cancel anytime?</h4>
            <p className="text-gray-600 text-sm mt-1">
              Yes, you can cancel your subscription at any time. You&apos;ll continue to have
              access until the end of your current billing period.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800">What payment methods do you accept?</h4>
            <p className="text-gray-600 text-sm mt-1">
              We accept all major credit cards through our secure payment processor, Stripe.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading billing information...</div>}>
      <BillingContent />
    </Suspense>
  )
}
