import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import { User } from '@/lib/db/models/user.model'
import { sendWelcomeEmail } from '@/lib/services/email/resend'
import { checkRateLimit, rateLimitConfigs } from '@/lib/middleware/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Rate limiting - prevent token brute force attacks
    const rateLimitResult = await checkRateLimit(request, rateLimitConfigs.default)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many verification attempts. Please try again later.',
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

    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 })
    }

    await connectDB()

    // Find user with this verification token
    const user = await User.findOne({ verificationToken: token })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification link' },
        { status: 400 }
      )
    }

    // SECURITY: Check if token has expired (24 hours)
    if (user.verificationTokenExpiry && new Date() > user.verificationTokenExpiry) {
      return NextResponse.json(
        {
          success: false,
          error: 'Verification link has expired. Please request a new verification email.',
        },
        { status: 400 }
      )
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Your email is already verified. You can sign in.',
      })
    }

    // Verify the email
    user.emailVerified = true
    user.verificationToken = undefined
    user.verificationTokenExpiry = undefined
    await user.save()

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email).catch(console.error)

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now sign in.',
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 })
  }
}
