import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import { ClaimedCoupon, CouponStatus } from '@/lib/db/models/claimed-coupon.model'
import { Employee, EmployeeStatus } from '@/lib/db/models/employee.model'
import { Merchant } from '@/lib/db/models/merchant.model'
import { Discount } from '@/lib/db/models/discount.model'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    await connectDB()

    // Get coupon with all related data
    const coupon = await ClaimedCoupon.findOne({ uniqueCode: code })

    if (!coupon) {
      return NextResponse.json({
        valid: false,
        error: 'Coupon not found',
        code: 'NOT_FOUND',
      })
    }

    // Get related data
    const [employee, merchant, discount] = await Promise.all([
      Employee.findById(coupon.employeeId).populate('companyId', 'name'),
      Merchant.findById(coupon.merchantId),
      Discount.findById(coupon.dealId),
    ])

    if (!employee || !merchant || !discount) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid coupon data',
        code: 'INVALID_DATA',
      })
    }

    // Check coupon status
    if (coupon.status === CouponStatus.REDEEMED) {
      return NextResponse.json({
        valid: false,
        error: 'Coupon has already been redeemed',
        code: 'ALREADY_REDEEMED',
        redeemedAt: coupon.redeemedAt,
      })
    }

    if (coupon.status === CouponStatus.EXPIRED) {
      return NextResponse.json({
        valid: false,
        error: 'Coupon has expired',
        code: 'EXPIRED',
      })
    }

    if (coupon.status === CouponStatus.CANCELLED) {
      return NextResponse.json({
        valid: false,
        error: 'Coupon has been cancelled',
        code: 'CANCELLED',
      })
    }

    // Check expiration
    if (new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({
        valid: false,
        error: 'Coupon has expired',
        code: 'EXPIRED',
      })
    }

    // Check employee status
    if (employee.status !== EmployeeStatus.ACTIVE) {
      return NextResponse.json({
        valid: false,
        error: 'Employee account is not active',
        code: 'EMPLOYEE_INACTIVE',
        employeeStatus: employee.status,
      })
    }

    // Valid coupon
    const company = employee.companyId as unknown as { name: string }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.uniqueCode,
        status: coupon.status,
        claimedAt: coupon.claimedAt,
        expiresAt: coupon.expiresAt,
      },
      employee: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        company: company?.name || 'Unknown',
      },
      merchant: {
        name: merchant.businessName,
        logo: merchant.logo,
      },
      discount: {
        name: discount.name,
        percentage: discount.percentage,
        type: discount.type,
      },
    })
  } catch (error) {
    console.error('Verify coupon error:', error)
    return NextResponse.json({
      valid: false,
      error: 'Verification failed',
      code: 'SERVER_ERROR',
    }, { status: 500 })
  }
}
