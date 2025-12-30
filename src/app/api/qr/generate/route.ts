import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { generateVerificationToken, generateQRCodeURL } from '@/lib/services/qr/token-generator'
import QRCode from 'qrcode'
import { rateLimiters } from '@/lib/security/rate-limiter'

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting - prevent QR code spam
    const rateLimitResponse = await rateLimiters.api(request)
    if (rateLimitResponse) {
      return rateLimitResponse
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
