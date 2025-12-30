import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { User } from '@/lib/db/models/user.model'
import { Employee } from '@/lib/db/models/employee.model'
import { Company } from '@/lib/db/models/company.model'
import { Referral, ReferralStatus } from '@/lib/db/models/referral.model'
import { sendReferralInviteEmail } from '@/lib/services/email/resend'

// POST - Send referral invite email
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { email, message } = await request.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: 'Valid email is required' }, { status: 400 })
    }

    await connectDB()

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Check if this email is already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { message: 'This person is already registered on corbez' },
        { status: 400 }
      )
    }

    // Check if already invited by this user
    const existingInvite = await Referral.findOne({
      referrerId: user._id,
      referredEmail: email.toLowerCase(),
      status: ReferralStatus.PENDING,
    })

    if (existingInvite) {
      return NextResponse.json(
        { message: 'You have already sent an invite to this email' },
        { status: 400 }
      )
    }

    // Get user's company info
    let companyName = null
    let companyId = null
    const employee = await Employee.findOne({ userId: user._id })
    if (employee?.companyId) {
      const company = await Company.findById(employee.companyId)
      if (company) {
        companyName = company.name
        companyId = company._id
      }
    }

    // Ensure user has a referral code
    if (!user.referralCode) {
      const prefix = user.firstName
        ? user.firstName.substring(0, 3).toUpperCase()
        : 'REF'
      const random = crypto.randomBytes(3).toString('hex').toUpperCase()
      user.referralCode = `${prefix}-${random}`
      await user.save()
    }

    // Create referral record
    const referral = await Referral.create({
      referrerId: user._id,
      referrerCompanyId: companyId,
      referredEmail: email.toLowerCase(),
      referralCode: user.referralCode,
      status: ReferralStatus.PENDING,
    })

    // Build referral link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3010'
    const referralLink = `${baseUrl}/register?ref=${user.referralCode}`

    // Send email invite
    const referrerName = user.firstName
      ? `${user.firstName} ${user.lastName || ''}`.trim()
      : user.email

    try {
      await sendReferralInviteEmail({
        to: email,
        referrerName,
        referralLink,
        companyName,
        personalMessage: message,
      })
    } catch (emailError) {
      console.error('Failed to send referral email:', emailError)
      // Don't fail the request if email fails - referral is still created
    }

    return NextResponse.json({
      message: 'Invite sent successfully!',
      referralId: referral._id.toString(),
      referralLink,
    })
  } catch (error) {
    console.error('Referral invite error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
