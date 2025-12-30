import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { Merchant } from '@/lib/db/models/merchant.model'
import { User } from '@/lib/db/models/user.model'
import {
  createCheckoutSession,
  isStripeConfigured,
} from '@/lib/services/payments/stripe'

export async function POST() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment system not configured. Please contact support.',
        },
        { status: 503 }
      )
    }

    await connectDB()

    // Get merchant details
    const merchant = await Merchant.findOne({ userId: session.user.id })

    if (!merchant) {
      return NextResponse.json(
        { success: false, error: 'Merchant profile not found' },
        { status: 404 }
      )
    }

    // Check if already subscribed
    if (
      merchant.subscriptionStatus === 'ACTIVE' ||
      merchant.subscriptionStatus === 'TRIALING'
    ) {
      return NextResponse.json(
        { success: false, error: 'You already have an active subscription' },
        { status: 400 }
      )
    }

    // Get user email
    const user = await User.findById(session.user.id)
    const email = user?.email || session.user.email || ''

    // Create checkout session
    const { url, sessionId } = await createCheckoutSession({
      merchantId: merchant._id.toString(),
      merchantEmail: email,
      businessName: merchant.businessName,
      customerId: merchant.stripeCustomerId,
    })

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'Failed to create checkout session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url,
      sessionId,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
