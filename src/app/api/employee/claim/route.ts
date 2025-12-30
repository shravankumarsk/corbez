import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { Employee } from '@/lib/db/models/employee.model'
import { couponService } from '@/lib/services/coupon.service'
import { moderationService } from '@/lib/services/moderation.service'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { merchantId, discountId } = body

    if (!merchantId || !discountId) {
      return NextResponse.json(
        { success: false, error: 'Merchant ID and Discount ID are required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Get employee
    const employee = await Employee.findOne({ userId: session.user.id })
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Check access
    const access = await moderationService.canAccessFeatures(employee._id.toString())
    if (!access.canAccess) {
      return NextResponse.json({
        success: false,
        error: access.reason,
      }, { status: 403 })
    }

    // Check if already has active coupon for this merchant
    const hasClaimed = await couponService.hasActiveCouponForMerchant(
      employee._id.toString(),
      merchantId
    )

    if (hasClaimed) {
      return NextResponse.json({
        success: false,
        error: 'You already have an active coupon for this restaurant',
      }, { status: 400 })
    }

    // Claim the coupon
    const result = await couponService.claimCoupon(
      {
        employeeId: employee._id.toString(),
        discountId,
        merchantId,
      },
      session.user.id
    )

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      coupon: {
        id: result.coupon?._id?.toString(),
        code: result.coupon?.uniqueCode,
        qrCodeUrl: result.coupon?.qrData?.dataUrl,
        expiresAt: result.coupon?.expiresAt,
        merchant: result.coupon?.merchant,
        discount: result.coupon?.discount,
      },
    })
  } catch (error) {
    console.error('Claim discount error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
