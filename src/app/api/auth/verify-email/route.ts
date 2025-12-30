import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import { User } from '@/lib/db/models/user.model'
import { sendWelcomeEmail } from '@/lib/services/email/resend'

export async function GET(request: NextRequest) {
  try {
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
