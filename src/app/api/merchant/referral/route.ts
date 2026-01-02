import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { Merchant, SubscriptionStatus } from '@/lib/db/models/merchant.model'
import {
  MerchantReferral,
  MerchantReferralStatus,
} from '@/lib/db/models/merchant-referral.model'
import { z } from 'zod'
import {
  sendReferrerConfirmationEmail,
  sendRefereeInvitationEmail,
  sendInternalReferralNotificationEmail,
} from '@/lib/services/email/merchant-referral-emails'
import { requireActiveSubscription } from '@/lib/middleware/subscription-guard'

// Validation schema for referral submission
const referralSchema = z.object({
  referredBusinessName: z.string().min(2, 'Business name must be at least 2 characters').max(100),
  referredContactName: z.string().min(2).max(100).optional(),
  referredEmail: z.string().email('Valid email is required'),
  referredPhone: z.string().min(10).max(20).optional(),
  referredAddress: z.string().max(200).optional(),
  referredCity: z.string().max(100).optional(),
  referredState: z.string().length(2, 'State must be 2 characters').optional(),
  referredZipCode: z.string().max(10).optional(),
  whyGoodFit: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
})

// Rate limiting: Track referrals per merchant per day
const referralLimits = new Map<string, { count: number; resetAt: number }>()
const MAX_REFERRALS_PER_DAY = 10

function checkRateLimit(merchantId: string): boolean {
  const now = Date.now()
  const limit = referralLimits.get(merchantId)

  if (!limit || now > limit.resetAt) {
    // Reset or create new limit
    referralLimits.set(merchantId, {
      count: 1,
      resetAt: now + 24 * 60 * 60 * 1000, // 24 hours
    })
    return true
  }

  if (limit.count >= MAX_REFERRALS_PER_DAY) {
    return false
  }

  limit.count++
  return true
}

// POST - Create a new merchant referral
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input
    const validationResult = referralSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    await connectDB()

    // Get the referring merchant
    const referrer = await Merchant.findOne({ userId: session.user.id })

    if (!referrer) {
      return NextResponse.json(
        { success: false, error: 'Merchant profile not found' },
        { status: 404 }
      )
    }

    // FRAUD PREVENTION: Verify referrer is active merchant (paying or in trial)
    const validSubscriptionStatuses = [
      SubscriptionStatus.TRIALING,
      SubscriptionStatus.ACTIVE,
    ]

    if (!validSubscriptionStatuses.includes(referrer.subscriptionStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only active merchants can submit referrals',
        },
        { status: 403 }
      )
    }

    // RATE LIMITING: Check daily referral limit
    if (!checkRateLimit(referrer._id.toString())) {
      return NextResponse.json(
        {
          success: false,
          error: `You've reached the maximum of ${MAX_REFERRALS_PER_DAY} referrals per day`,
        },
        { status: 429 }
      )
    }

    // FRAUD PREVENTION: Check for duplicate referral
    const isDuplicate = await MerchantReferral.checkDuplicate(
      referrer._id,
      data.referredEmail
    )

    if (isDuplicate) {
      return NextResponse.json(
        {
          success: false,
          error: 'You have already referred this restaurant',
        },
        { status: 400 }
      )
    }

    // FRAUD PREVENTION: Check if referred email is already a merchant
    const existingMerchant = await Merchant.findOne({
      contactEmail: data.referredEmail.toLowerCase(),
    })

    if (existingMerchant) {
      return NextResponse.json(
        {
          success: false,
          error: 'This restaurant is already on Corbez',
        },
        { status: 400 }
      )
    }

    // FRAUD PREVENTION: Prevent self-referrals
    if (
      referrer.contactEmail?.toLowerCase() === data.referredEmail.toLowerCase() ||
      session.user.email?.toLowerCase() === data.referredEmail.toLowerCase()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'You cannot refer yourself',
        },
        { status: 400 }
      )
    }

    // Create the referral
    const referral = await MerchantReferral.create({
      referrerId: session.user.id,
      referrerMerchantId: referrer._id,
      referredBusinessName: data.referredBusinessName,
      referredContactName: data.referredContactName,
      referredEmail: data.referredEmail.toLowerCase(),
      referredPhone: data.referredPhone,
      referredAddress: data.referredAddress,
      referredCity: data.referredCity,
      referredState: data.referredState?.toUpperCase(),
      referredZipCode: data.referredZipCode,
      whyGoodFit: data.whyGoodFit,
      status: MerchantReferralStatus.PENDING,
      referrerRewardMonths: 3, // 3 months free total
      refereeRewardMonths: 9, // 9 months free trial
    })

    // Send email notifications (don't wait for them to complete)
    Promise.all([
      sendReferrerConfirmationEmail({
        referrerEmail: referrer.contactEmail || session.user.email || '',
        referrerName: session.user.name || referrer.businessName,
        referredBusinessName: data.referredBusinessName,
        referredContactName: data.referredContactName,
      }),
      sendRefereeInvitationEmail({
        refereeEmail: data.referredEmail,
        referredBusinessName: data.referredBusinessName,
        referredContactName: data.referredContactName,
        referrerBusinessName: referrer.businessName,
        referrerName: session.user.name || undefined,
      }),
      sendInternalReferralNotificationEmail({
        referrerBusinessName: referrer.businessName,
        referrerEmail: referrer.contactEmail || session.user.email || '',
        referredBusinessName: data.referredBusinessName,
        referredEmail: data.referredEmail,
        referredPhone: data.referredPhone,
        referredAddress: data.referredAddress
          ? `${data.referredAddress}, ${data.referredCity}, ${data.referredState} ${data.referredZipCode}`
          : undefined,
        referredNotes: data.whyGoodFit,
      }),
    ]).catch((error) => {
      console.error('Failed to send referral emails:', error)
    })

    return NextResponse.json({
      success: true,
      referral: {
        id: referral._id,
        referredBusinessName: referral.referredBusinessName,
        referredEmail: referral.referredEmail,
        status: referral.status,
        createdAt: referral.createdAt,
      },
    })
  } catch (error) {
    console.error('Failed to create merchant referral:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create referral' },
      { status: 500 }
    )
  }
}

// GET - List all referrals for the authenticated merchant
export async function GET(request: NextRequest) {
  try {
    // Check subscription status - merchant must have active subscription
    const { merchant, error } = await requireActiveSubscription(request)
    if (error) return error

    await connectDB()

    // Get all referrals made by this merchant
    const referrals = await MerchantReferral.find({
      referrerMerchantId: merchant._id,
    })
      .sort({ createdAt: -1 })
      .lean()

    // Get referral stats
    const stats = await MerchantReferral.getReferralStats(merchant._id)

    return NextResponse.json({
      success: true,
      referrals,
      stats,
    })
  } catch (error) {
    console.error('Failed to fetch merchant referrals:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch referrals' },
      { status: 500 }
    )
  }
}
