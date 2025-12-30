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
