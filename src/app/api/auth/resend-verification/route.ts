import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/db/mongoose'
import { User } from '@/lib/db/models/user.model'
import { sendVerificationEmail } from '@/lib/services/email/resend'

export async function POST(request: NextRequest) {
  try {
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

    // Generate new verification token
    const newToken = crypto.randomBytes(32).toString('hex')
    user.verificationToken = newToken
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
