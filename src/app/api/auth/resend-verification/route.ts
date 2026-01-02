import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/db/mongoose'
import { User } from '@/lib/db/models/user.model'
import { sendVerificationEmail } from '@/lib/services/email/resend'
import { checkRateLimit, rateLimitConfigs } from '@/lib/middleware/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Strict rate limiting - prevent email spam
    const rateLimitResult = await checkRateLimit(request, rateLimitConfigs.auth)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many verification requests. Please try again later.',
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

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    await connectDB()

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      // Don't reveal if email exists
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a verification link will be sent.',
      })
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Your email is already verified. You can sign in.',
      })
    }

    // Generate new verification token with 24-hour expiry
    const newToken = crypto.randomBytes(32).toString('hex')
    const expiryDate = new Date()
    expiryDate.setHours(expiryDate.getHours() + 24) // 24 hours from now

    user.verificationToken = newToken
    user.verificationTokenExpiry = expiryDate
    await user.save()

    // Send verification email
    const result = await sendVerificationEmail(user.email, newToken)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
    })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json({ success: false, error: 'Failed to resend verification' }, { status: 500 })
  }
}
