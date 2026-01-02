import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { Merchant } from '@/lib/db/models/merchant.model'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'PLATFORM_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || 'all'

    let query = {}
    if (status === 'pending') {
      query = { status: 'PENDING' }
    } else if (status === 'active') {
      query = { status: 'ACTIVE' }
    } else if (status === 'suspended') {
      query = { status: 'SUSPENDED' }
    }

    const merchants = await Merchant.find(query)
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .lean()

    // Add fraud detection flags
    const merchantsWithFlags = merchants.map((merchant) => {
      const createdAt = new Date(merchant.createdAt)
      const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)

      return {
        id: (merchant._id as any).toString(),
        businessName: merchant.businessName,
        contactEmail: merchant.contactEmail,
        contactPhone: merchant.contactPhone,
        website: merchant.website,
        status: merchant.status,
        createdAt: merchant.createdAt,
        locations: merchant.locations,
        verificationFlags: {
          hasWebsite: !!merchant.website,
          hasMultipleLocations: merchant.locations.length > 1,
          recentSignup: daysSinceCreation < 7,
          suspiciousEmail: merchant.contactEmail?.includes('temp') || merchant.contactEmail?.includes('test'),
        },
      }
    })

    return NextResponse.json({
      success: true,
      merchants: merchantsWithFlags,
    })
  } catch (error) {
    console.error('Error fetching merchants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch merchants' },
      { status: 500 }
    )
  }
}
