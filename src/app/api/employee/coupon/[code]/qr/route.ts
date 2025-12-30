import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { Employee } from '@/lib/db/models/employee.model'
import { ClaimedCoupon, CouponStatus } from '@/lib/db/models/claimed-coupon.model'
import { qrcodeService } from '@/lib/services/qrcode.service'
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
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'png' // png, svg, dataurl
    const size = parseInt(searchParams.get('size') || '300', 10)

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
        error: access.reason,
      }, { status: 403 })
    }

    // Get coupon
    const coupon = await ClaimedCoupon.findOne({ uniqueCode: code })
    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    // Verify ownership
    if (coupon.employeeId.toString() !== employee._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check coupon status
    if (coupon.status !== CouponStatus.ACTIVE) {
      return NextResponse.json({ error: 'Coupon is not active' }, { status: 400 })
    }

    // Generate verification URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://corbez.com'
    const verificationUrl = `${baseUrl}/verify/coupon/${code}`

    // Generate QR code based on format
    const qrOptions = {
      width: Math.min(Math.max(size, 100), 1000), // Clamp between 100-1000
      margin: 2,
      errorCorrectionLevel: 'H' as const,
    }

    if (format === 'svg') {
      const svg = await qrcodeService.generateSVG(verificationUrl, qrOptions)
      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Content-Disposition': `attachment; filename="coupon-${code}.svg"`,
        },
      })
    }

    if (format === 'dataurl') {
      const dataUrl = await qrcodeService.generateDataURL(verificationUrl, qrOptions)
      return NextResponse.json({ dataUrl })
    }

    // Default: PNG
    const pngBuffer = await qrcodeService.generatePNG(verificationUrl, qrOptions)
    return new NextResponse(new Uint8Array(pngBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="coupon-${code}.png"`,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error) {
    console.error('QR Code API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
