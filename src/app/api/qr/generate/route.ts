import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { generateVerificationToken, generateQRCodeURL } from '@/lib/services/qr/token-generator'
import QRCode from 'qrcode'
import { checkRateLimit, rateLimitConfigs } from '@/lib/middleware/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Redis-based rate limiting - prevent QR code spam
    const rateLimitResult = await checkRateLimit(request, rateLimitConfigs.default)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: rateLimitConfigs.default.message,
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimitResult.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitResult.reset),
          },
        }
      )
    }

    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Generate verification token
    const token = generateVerificationToken({
      employeeId: session.user.id,
      email: session.user.email || '',
    })

    // Generate QR code URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verificationUrl = generateQRCodeURL(baseUrl, token)

    // Generate QR code as data URL
    const qrCode = await QRCode.toDataURL(verificationUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })

    return NextResponse.json({
      success: true,
      qrCode,
      expiresIn: 600, // 10 minutes
    })
  } catch (error) {
    console.error('QR generation error:', error)
    return NextResponse.json({ success: false, error: 'Failed to generate QR code' }, { status: 500 })
  }
}
