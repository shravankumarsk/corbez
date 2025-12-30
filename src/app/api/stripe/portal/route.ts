import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { Merchant } from '@/lib/db/models/merchant.model'
import {
  createBillingPortalSession,
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

    if (!merchant.stripeCustomerId) {
      return NextResponse.json(
        { success: false, error: 'No billing account found. Please subscribe first.' },
        { status: 400 }
      )
    }

    // Create billing portal session
    const { url } = await createBillingPortalSession(merchant.stripeCustomerId)

    return NextResponse.json({
      success: true,
      url,
    })
  } catch (error) {
    console.error('Billing portal error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to open billing portal' },
      { status: 500 }
    )
  }
}
