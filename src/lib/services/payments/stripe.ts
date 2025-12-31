import Stripe from 'stripe'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Subscription pricing
export const SUBSCRIPTION_PRICE = 999 // $9.99 in cents
export const TRIAL_DAYS = 180 // 6 months free trial

// Lazy initialization to avoid build-time errors
let stripeClient: Stripe | null = null

function getStripeClient(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
    })
  }
  return stripeClient
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_PRICE_ID
}

export interface CreateCheckoutParams {
  merchantId: string
  merchantEmail: string
  businessName: string
  customerId?: string
}

/**
 * Create or get a Stripe customer
 */
export async function getOrCreateCustomer(
  email: string,
  merchantId: string,
  businessName: string
): Promise<Stripe.Customer> {
  const stripe = getStripeClient()

  // Search for existing customer by metadata
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0]
  }

  // Create new customer
  return stripe.customers.create({
    email,
    name: businessName,
    metadata: {
      merchantId,
    },
  })
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession(
  params: CreateCheckoutParams
): Promise<{ url: string | null; sessionId: string }> {
  const stripe = getStripeClient()
  const priceId = process.env.STRIPE_PRICE_ID

  if (!priceId) {
    throw new Error('STRIPE_PRICE_ID is not configured')
  }

  // Get or create customer
  const customer = await getOrCreateCustomer(
    params.merchantEmail,
    params.merchantId,
    params.businessName
  )

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: TRIAL_DAYS,
      metadata: {
        merchantId: params.merchantId,
      },
    },
    success_url: `${APP_URL}/dashboard/merchant/billing?success=true`,
    cancel_url: `${APP_URL}/dashboard/merchant/billing?canceled=true`,
    metadata: {
      merchantId: params.merchantId,
    },
  })

  return {
    url: session.url,
    sessionId: session.id,
  }
}

/**
 * Create a billing portal session for subscription management
 */
export async function createBillingPortalSession(
  customerId: string
): Promise<{ url: string }> {
  const stripe = getStripeClient()

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${APP_URL}/dashboard/merchant/billing`,
  })

  return { url: session.url }
}

/**
 * Get subscription details
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  const stripe = getStripeClient()

  try {
    return await stripe.subscriptions.retrieve(subscriptionId)
  } catch {
    return null
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripeClient()

  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}

/**
 * Resume subscription (undo cancellation)
 */
export async function resumeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripeClient()

  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  })
}

/**
 * Construct webhook event from raw body
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripeClient()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused'

export interface SubscriptionInfo {
  status: SubscriptionStatus
  customerId: string
  subscriptionId: string
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  trialEnd?: Date
}

/**
 * Apply referral reward credits to merchant subscription
 * Extends subscription by number of free months earned
 */
export async function applyReferralReward(
  subscriptionId: string,
  monthsToAdd: number,
  referralId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripeClient()

  // Get current subscription
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  // Calculate new period end (add months to current period end)
  const currentPeriodEnd = new Date((subscription.current_period_end || 0) * 1000)
  const newPeriodEnd = new Date(currentPeriodEnd)
  newPeriodEnd.setMonth(newPeriodEnd.getMonth() + monthsToAdd)

  // Update subscription with extended period and metadata
  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    trial_end: Math.floor(newPeriodEnd.getTime() / 1000),
    proration_behavior: 'none',
    metadata: {
      ...subscription.metadata,
      [`referral_reward_${referralId}`]: `${monthsToAdd} months`,
      last_referral_reward: new Date().toISOString(),
    },
  })

  return updatedSubscription
}

/**
 * Track referral reward in Stripe customer metadata
 */
export async function trackReferralReward(
  customerId: string,
  merchantId: string,
  referralId: string,
  monthsEarned: number
): Promise<Stripe.Customer> {
  const stripe = getStripeClient()

  const customer = await stripe.customers.retrieve(customerId)

  if (customer.deleted) {
    throw new Error('Customer has been deleted')
  }

  const currentReferralMonths = parseInt(customer.metadata?.total_referral_months || '0')
  const totalReferralMonths = currentReferralMonths + monthsEarned

  return stripe.customers.update(customerId, {
    metadata: {
      ...customer.metadata,
      merchantId,
      total_referral_months: totalReferralMonths.toString(),
      last_referral_id: referralId,
      last_referral_date: new Date().toISOString(),
    },
  })
}

/**
 * Check if merchant has reached annual referral reward cap
 */
export async function checkReferralRewardCap(
  customerId: string
): Promise<{ canClaim: boolean; monthsEarnedThisYear: number; remainingMonths: number }> {
  const stripe = getStripeClient()
  const customer = await stripe.customers.retrieve(customerId)

  if (customer.deleted) {
    throw new Error('Customer has been deleted')
  }

  // Get all subscriptions for this customer
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    limit: 100,
  })

  // Calculate months earned this year from metadata
  const currentYear = new Date().getFullYear()
  let monthsEarnedThisYear = 0

  for (const sub of subscriptions.data) {
    for (const [key, value] of Object.entries(sub.metadata || {})) {
      if (key.startsWith('referral_reward_') && value) {
        const rewardDate = sub.metadata?.last_referral_reward
        if (rewardDate && new Date(rewardDate).getFullYear() === currentYear) {
          const months = parseInt(value.split(' ')[0])
          if (!isNaN(months)) {
            monthsEarnedThisYear += months
          }
        }
      }
    }
  }

  const MAX_ANNUAL_REWARD_MONTHS = 12
  const remainingMonths = Math.max(0, MAX_ANNUAL_REWARD_MONTHS - monthsEarnedThisYear)
  const canClaim = monthsEarnedThisYear < MAX_ANNUAL_REWARD_MONTHS

  return {
    canClaim,
    monthsEarnedThisYear,
    remainingMonths,
  }
}

/**
 * Parse subscription from Stripe event
 */
export function parseSubscriptionInfo(
  subscription: Stripe.Subscription
): SubscriptionInfo {
  // Access subscription properties (handle different API versions)
  const sub = subscription as unknown as {
    status: string
    customer: string | { id: string }
    id: string
    current_period_end?: number
    cancel_at_period_end?: boolean
    trial_end?: number | null
  }

  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id

  return {
    status: sub.status as SubscriptionStatus,
    customerId,
    subscriptionId: sub.id,
    currentPeriodEnd: sub.current_period_end
      ? new Date(sub.current_period_end * 1000)
      : new Date(),
    cancelAtPeriodEnd: sub.cancel_at_period_end || false,
    trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : undefined,
  }
}
