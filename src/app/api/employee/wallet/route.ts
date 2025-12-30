import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { Employee } from '@/lib/db/models/employee.model'
import { couponService } from '@/lib/services/coupon.service'
import { moderationService } from '@/lib/services/moderation.service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Get employee
    const employee = await Employee.findOne({ userId: session.user.id })
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Check if can access features
    const access = await moderationService.canAccessFeatures(employee._id.toString())

    if (!access.canAccess) {
      return NextResponse.json({
        success: false,
        canAccess: false,
        reason: access.reason,
        status: access.status,
        coupons: [],
        pass: null,
      })
    }

    // Get employee pass
    const pass = await couponService.getOrCreateEmployeePass(
      session.user.id,
      employee._id.toString(),
      employee.companyId?.toString() || ''
    )

    // Get active coupons
    const coupons = await couponService.getEmployeeCoupons(employee._id.toString())

    return NextResponse.json({
      success: true,
      canAccess: true,
      status: employee.status,
      pass: pass ? {
        passId: pass.passId,
        qrCodeDataUrl: pass.qrCodeDataUrl,
        qrCodeSvg: pass.qrCodeSvg,
        verificationUrl: pass.verificationUrl,
        issuedAt: pass.issuedAt,
        usageCount: pass.usageCount,
      } : null,
      coupons: coupons.map(c => ({
        id: c._id.toString(),
        code: c.uniqueCode,
        status: c.status,
        merchant: c.merchant,
        discount: c.discount,
        claimedAt: c.claimedAt,
        expiresAt: c.expiresAt,
        qrCodeUrl: c.qrCodeUrl,
        verificationUrl: c.qrData?.verificationUrl,
      })),
    })
  } catch (error) {
    console.error('Wallet API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
