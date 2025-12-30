import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { Merchant } from '@/lib/db/models/merchant.model'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
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

    return NextResponse.json({
      success: true,
      subscription: {
        status: merchant.subscriptionStatus || 'NONE',
        currentPeriodEnd: merchant.subscriptionCurrentPeriodEnd?.toISOString(),
        trialEnd: merchant.subscriptionTrialEnd?.toISOString(),
        cancelAtPeriodEnd: merchant.subscriptionCancelAtPeriodEnd || false,
      },
    })
  } catch (error) {
    console.error('Subscription fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}
