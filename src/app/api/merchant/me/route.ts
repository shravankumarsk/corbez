import { NextRequest, NextResponse } from 'next/server'
import { requireMerchant } from '@/lib/middleware/role-guards'
import { connectDB } from '@/lib/db/mongoose'
import { Merchant } from '@/lib/db/models/merchant.model'

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Role-based access control - only merchants can access merchant data
    const { session, error } = await requireMerchant(request)
    if (error) return error
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const merchant = await Merchant.findOne({ userId: session.user.id })

    if (!merchant) {
      return NextResponse.json(
        { success: false, error: 'Merchant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      merchant: {
        _id: merchant._id,
        businessName: merchant.businessName,
        status: merchant.status,
        subscriptionStatus: merchant.subscriptionStatus,
      },
    })
  } catch (error) {
    console.error('Failed to fetch merchant:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch merchant' },
      { status: 500 }
    )
  }
}
