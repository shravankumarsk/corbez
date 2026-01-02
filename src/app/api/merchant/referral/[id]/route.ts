import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import {
  MerchantReferral,
  MerchantReferralStatus,
} from '@/lib/db/models/merchant-referral.model'
import { requireActiveSubscription } from '@/lib/middleware/subscription-guard'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Get a specific referral
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check subscription status - merchant must have active subscription
    const { merchant, error } = await requireActiveSubscription(request)
    if (error) return error

    const { id } = await params

    await connectDB()

    // Find the referral
    const referral = await MerchantReferral.findOne({
      _id: id,
      referrerMerchantId: merchant._id,
    })
      .populate('referredMerchantId', 'businessName contactEmail')
      .lean()

    if (!referral) {
      return NextResponse.json(
        { success: false, error: 'Referral not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      referral,
    })
  } catch (error) {
    console.error('Failed to fetch referral:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch referral' },
      { status: 500 }
    )
  }
}

// PATCH - Update referral status or details
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Check subscription status - merchant must have active subscription
    const { merchant, error } = await requireActiveSubscription(request)
    if (error) return error

    const { id } = await params
    const body = await request.json()
    const { status, internalNotes, claimReward } = body

    await connectDB()

    // Find the referral
    const referral = await MerchantReferral.findOne({
      _id: id,
      referrerMerchantId: merchant._id,
    })

    if (!referral) {
      return NextResponse.json(
        { success: false, error: 'Referral not found' },
        { status: 404 }
      )
    }

    // Update status if provided
    if (status && Object.values(MerchantReferralStatus).includes(status)) {
      await referral.updateStatus(status)
    }

    // Update internal notes if provided (admin only - add role check if needed)
    if (internalNotes !== undefined) {
      referral.internalNotes = internalNotes
    }

    // Claim reward if requested (must be converted)
    if (claimReward && referral.status === 'CONVERTED' && !referral.referrerRewardClaimed) {
      await referral.claimReferrerReward()
      // TODO: Apply credit to merchant's Stripe subscription
    }

    await referral.save()

    return NextResponse.json({
      success: true,
      referral,
    })
  } catch (error) {
    console.error('Failed to update referral:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update referral' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a referral (only if still pending)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check subscription status - merchant must have active subscription
    const { merchant, error } = await requireActiveSubscription(request)
    if (error) return error

    const { id } = await params

    await connectDB()

    // Find the referral
    const referral = await MerchantReferral.findOne({
      _id: id,
      referrerMerchantId: merchant._id,
    })

    if (!referral) {
      return NextResponse.json(
        { success: false, error: 'Referral not found' },
        { status: 404 }
      )
    }

    // Only allow deletion if still pending
    if (referral.status !== MerchantReferralStatus.PENDING) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete referral that has already been processed',
        },
        { status: 400 }
      )
    }

    await referral.deleteOne()

    return NextResponse.json({
      success: true,
      message: 'Referral deleted successfully',
    })
  } catch (error) {
    console.error('Failed to delete referral:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete referral' },
      { status: 500 }
    )
  }
}
