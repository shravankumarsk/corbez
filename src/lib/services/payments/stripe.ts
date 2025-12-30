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
