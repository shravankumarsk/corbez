import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { Merchant, SubscriptionStatus } from '@/lib/db/models/merchant.model'

/**
 * Subscription Guard Middleware
 * Ensures merchant has active subscription before accessing paid features
 *
 * CRITICAL SECURITY: Prevents free tier bypass
 */

export interface SubscriptionCheckOptions {
  /** Allow trial users (default: true) */
  allowTrial?: boolean
  /** Require specific subscription status */
  requiredStatus?: SubscriptionStatus[]
  /** Custom error message */
  errorMessage?: string
}

/**
 * Check if merchant has valid subscription
 * Returns null if authorized, NextResponse with error if not
 */
export async function requireActiveSubscription(
  request: NextRequest,
  options: SubscriptionCheckOptions = {}
): Promise<{
  merchant?: any
  error?: NextResponse
}> {
  const {
    allowTrial = true,
    requiredStatus,
    errorMessage = 'Active subscription required to access this feature',
  } = options

  // Get authenticated session
  const session = await auth()
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  // Check role is MERCHANT
  if (session.user.role !== 'MERCHANT') {
    return {
      error: NextResponse.json({ error: 'Forbidden - Merchant access only' }, { status: 403 }),
    }
  }

  // Find merchant
  await connectDB()
  const merchant = await Merchant.findOne({ userId: session.user.id })

  if (!merchant) {
    return {
      error: NextResponse.json({ error: 'Merchant profile not found' }, { status: 404 }),
    }
  }

  // Check if merchant is approved
  if (merchant.status !== 'ACTIVE' && merchant.status !== 'PENDING') {
    return {
      error: NextResponse.json(
        {
          error: 'Your merchant account is not active',
          status: merchant.status,
          redirectTo: '/dashboard/merchant/settings',
        },
        { status: 403 }
      ),
    }
  }

  // Define allowed subscription statuses
  const allowedStatuses: SubscriptionStatus[] = requiredStatus || [
    SubscriptionStatus.ACTIVE,
    ...(allowTrial ? [SubscriptionStatus.TRIALING] : []),
  ]

  // Check subscription status
  const hasValidSubscription =
    merchant.subscriptionStatus &&
    allowedStatuses.includes(merchant.subscriptionStatus)

  if (!hasValidSubscription) {
    // Different messages based on status
    let message = errorMessage
    const redirectTo = '/dashboard/merchant/billing'

    switch (merchant.subscriptionStatus) {
      case SubscriptionStatus.PAST_DUE:
        message = 'Your payment is past due. Please update your payment method.'
        break
      case SubscriptionStatus.UNPAID:
        message = 'Your subscription is unpaid. Please update your payment method.'
        break
      case SubscriptionStatus.CANCELED:
        message = 'Your subscription has been canceled. Reactivate to continue.'
        break
      case SubscriptionStatus.NONE:
      default:
        message = 'Active subscription required. Start your free trial to continue.'
        break
    }

    return {
      error: NextResponse.json(
        {
          error: message,
          subscriptionStatus: merchant.subscriptionStatus,
          redirectTo,
          requiresPayment: true,
        },
        { status: 402 } // 402 Payment Required
      ),
    }
  }

  // All checks passed
  return { merchant }
}

/**
 * Verify email is confirmed before sensitive operations
 */
export function requireEmailVerification(session: any): NextResponse | null {
  if (!session?.user?.isEmailVerified) {
    return NextResponse.json(
      {
        error: 'Email verification required',
        message: 'Please verify your email address before performing this action',
        redirectTo: '/verify-email',
      },
      { status: 403 }
    )
  }
  return null
}
