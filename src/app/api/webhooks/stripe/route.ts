import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { connectDB } from '@/lib/db/mongoose'
import { Merchant, SubscriptionStatus } from '@/lib/db/models/merchant.model'
import {
  constructWebhookEvent,
  parseSubscriptionInfo,
} from '@/lib/services/payments/stripe'

// Disable body parsing - we need raw body for webhook verification
export const dynamic = 'force-dynamic'

/**
 * Map Stripe status to our SubscriptionStatus enum
 */
function mapStripeStatus(stripeStatus: string): SubscriptionStatus {
  switch (stripeStatus) {
    case 'trialing':
      return SubscriptionStatus.TRIALING
    case 'active':
      return SubscriptionStatus.ACTIVE
    case 'past_due':
      return SubscriptionStatus.PAST_DUE
    case 'canceled':
    case 'incomplete_expired':
      return SubscriptionStatus.CANCELED
    case 'unpaid':
      return SubscriptionStatus.UNPAID
    default:
      return SubscriptionStatus.NONE
  }
}

/**
 * Update merchant subscription from Stripe subscription object
 */
async function updateMerchantSubscription(
  subscription: Stripe.Subscription
): Promise<void> {
  const info = parseSubscriptionInfo(subscription)
  const merchantId = subscription.metadata?.merchantId

  // Find merchant by customer ID or metadata merchantId
  let merchant = null

  if (merchantId) {
    merchant = await Merchant.findById(merchantId)
  }

  if (!merchant) {
    merchant = await Merchant.findOne({ stripeCustomerId: info.customerId })
  }

  if (!merchant) {
    console.error('Merchant not found for subscription:', subscription.id)
    return
  }

  // Update merchant subscription fields
  merchant.stripeCustomerId = info.customerId
  merchant.stripeSubscriptionId = info.subscriptionId
  merchant.subscriptionStatus = mapStripeStatus(info.status)
  merchant.subscriptionCurrentPeriodEnd = info.currentPeriodEnd
  merchant.subscriptionTrialEnd = info.trialEnd
  merchant.subscriptionCancelAtPeriodEnd = info.cancelAtPeriodEnd

  await merchant.save()

  console.log(
    `Updated merchant ${merchant._id} subscription status to ${info.status}`
  )
}

/**
 * Handle customer.subscription events
 */
async function handleSubscriptionEvent(
  subscription: Stripe.Subscription
): Promise<void> {
  await connectDB()
  await updateMerchantSubscription(subscription)
}

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutComplete(
  session: Stripe.Checkout.Session
): Promise<void> {
  await connectDB()

  const merchantId = session.metadata?.merchantId
  const customerId = session.customer as string

  if (!merchantId) {
    console.error('No merchantId in checkout session metadata')
    return
  }

  // Update merchant with customer ID
  const merchant = await Merchant.findById(merchantId)

  if (!merchant) {
    console.error('Merchant not found:', merchantId)
    return
  }

  merchant.stripeCustomerId = customerId

  // If there's a subscription, update that too
  if (session.subscription) {
    merchant.stripeSubscriptionId = session.subscription as string
    merchant.subscriptionStatus = SubscriptionStatus.TRIALING
  }

  await merchant.save()

  console.log(`Checkout completed for merchant ${merchantId}`)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event

    try {
      event = constructWebhookEvent(body, signature)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionEvent(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        // Subscription payment succeeded - status will be updated via subscription.updated event
        break
      }

      case 'invoice.payment_failed': {
        // Subscription payment failed - status will be updated via subscription.updated event
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
