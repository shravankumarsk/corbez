import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { Employee } from '@/lib/db/models/employee.model'
import { couponService } from '@/lib/services/coupon.service'
import { moderationService } from '@/lib/services/moderation.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code } = await params

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

    // Get coupon
    const coupon = await couponService.getCouponByCode(code)
    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    // Verify ownership
    if (coupon.employeeId.toString() !== employee._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon._id.toString(),
        code: coupon.uniqueCode,
        status: coupon.status,
        merchant: coupon.merchant,
        discount: coupon.discount,
        claimedAt: coupon.claimedAt,
        expiresAt: coupon.expiresAt,
        qrCodeUrl: coupon.qrCodeUrl,
        verificationUrl: coupon.qrData?.verificationUrl,
      },
    })
  } catch (error) {
    console.error('Coupon API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
