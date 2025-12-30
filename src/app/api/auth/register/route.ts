import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/db/mongoose'
import { User, UserRole } from '@/lib/db/models/user.model'
import { Employee, EmployeeStatus } from '@/lib/db/models/employee.model'
import { Merchant } from '@/lib/db/models/merchant.model'
import { Company, CompanyStatus } from '@/lib/db/models/company.model'
import { InviteCode, InviteCodeStatus } from '@/lib/db/models/invite-code.model'
import { Referral, ReferralStatus } from '@/lib/db/models/referral.model'
import { sendVerificationEmail } from '@/lib/services/email/resend'

// Generate URL-friendly slug from company name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function POST(request: NextRequest) {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      inviteCode,
      referralCode,
      // Company Admin fields
      companyName,
      companyCity,
      companyState,
    } = await request.json()

    // Validate input
    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 })
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 })
    }

    // Validate company admin fields
    if (role === UserRole.COMPANY_ADMIN) {
      if (!companyName || !companyCity || !companyState) {
        return NextResponse.json(
          { message: 'Company name, city, and state are required for company admin registration' },
          { status: 400 }
        )
      }
    }

    await connectDB()

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 400 })
    }

    // Validate invite code if provided (for employees)
    let validatedInvite = null
    if (inviteCode && role === UserRole.EMPLOYEE) {
      const invite = await InviteCode.findOne({
        code: inviteCode.toUpperCase().replace(/\s/g, ''),
      })

      if (!invite) {
        return NextResponse.json({ message: 'Invalid invite code' }, { status: 400 })
      }

      if (invite.status === InviteCodeStatus.USED) {
        return NextResponse.json({ message: 'This invite code has already been used' }, { status: 400 })
      }

      if (invite.status === InviteCodeStatus.REVOKED) {
        return NextResponse.json({ message: 'This invite code has been revoked' }, { status: 400 })
      }

      if (new Date() > new Date(invite.expiresAt)) {
        invite.status = InviteCodeStatus.EXPIRED
        await invite.save()
        return NextResponse.json({ message: 'This invite code has expired' }, { status: 400 })
      }

      // If invite is tied to a specific email, validate it matches
      if (invite.email && invite.email.toLowerCase() !== email.toLowerCase()) {
        return NextResponse.json(
          { message: 'This invite code is for a different email address' },
          { status: 400 }
        )
      }

      validatedInvite = invite
    }

    // Create user (password will be hashed by the model's pre-save hook)
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      role,
      referredBy: referralCode || undefined,
      emailVerified: false,
      verificationToken: crypto.randomBytes(32).toString('hex'),
    })

    // Create role-specific profile
    if (role === UserRole.EMPLOYEE) {
      const employeeData: {
        userId: typeof user._id
        firstName: string
        lastName: string
        status: EmployeeStatus
        companyId?: typeof validatedInvite.companyId
        invitedBy?: typeof validatedInvite.createdBy
        invitedAt?: Date
        joinedAt?: Date
      } = {
        userId: user._id,
        firstName,
        lastName,
        status: validatedInvite ? EmployeeStatus.ACTIVE : EmployeeStatus.PENDING,
      }

      // If registered with invite code, link to company
      if (validatedInvite) {
        employeeData.companyId = validatedInvite.companyId
        employeeData.invitedBy = validatedInvite.createdBy
        employeeData.invitedAt = validatedInvite.createdAt
        employeeData.joinedAt = new Date()
      }

      await Employee.create(employeeData)

      // Mark invite code as used
      if (validatedInvite) {
        validatedInvite.status = InviteCodeStatus.USED
        validatedInvite.usedBy = user._id
        validatedInvite.usedAt = new Date()
        await validatedInvite.save()
      }
    } else if (role === UserRole.MERCHANT) {
      await Merchant.create({
        userId: user._id,
        businessName: '',
        slug: '',
        status: 'PENDING',
      })
    } else if (role === UserRole.COMPANY_ADMIN) {
      // Generate unique slug for company
      let slug = generateSlug(companyName)
      let slugCounter = 0
      while (await Company.exists({ slug })) {
        slugCounter++
        slug = `${generateSlug(companyName)}-${slugCounter}`
      }

      // Create company with admin as owner
      await Company.create({
        name: companyName,
        slug,
        adminUserId: user._id,
        status: CompanyStatus.PENDING,
        address: {
          city: companyCity,
          state: companyState.toUpperCase(),
          country: 'US',
        },
        settings: {
          allowPublicDeals: true,
          autoApproveEmployees: false,
          notificationPreferences: {
            weeklyDigest: true,
            newMerchants: true,
          },
        },
      })
    }

    // Handle referral tracking
    if (referralCode) {
      try {
        const referrer = await User.findOne({ referralCode })
        if (referrer) {
          // Get referrer's company
          const referrerEmployee = await Employee.findOne({ userId: referrer._id })
          const referrerCompanyId = referrerEmployee?.companyId

          // Get new user's company (if they joined one via invite)
          const newUserCompanyId = validatedInvite?.companyId

          // Check if same company
          const sameCompany = referrerCompanyId && newUserCompanyId
            ? referrerCompanyId.toString() === newUserCompanyId.toString()
            : false

          // Find existing pending referral or create new one
          const existingReferral = await Referral.findOne({
            referrerId: referrer._id,
            referredEmail: email.toLowerCase(),
            status: ReferralStatus.PENDING,
          })

          if (existingReferral) {
            // Update existing referral
            existingReferral.referredUserId = user._id
            existingReferral.referredCompanyId = newUserCompanyId
            existingReferral.sameCompany = sameCompany
            existingReferral.status = ReferralStatus.REGISTERED
            existingReferral.registeredAt = new Date()
            await existingReferral.save()
          } else {
            // Create new referral record
            await Referral.create({
              referrerId: referrer._id,
              referrerCompanyId: referrerCompanyId,
              referredUserId: user._id,
              referredEmail: email.toLowerCase(),
              referredCompanyId: newUserCompanyId,
              referralCode,
              sameCompany,
              status: ReferralStatus.REGISTERED,
              registeredAt: new Date(),
            })
          }
        }
      } catch (refError) {
        console.error('Failed to track referral:', refError)
        // Don't fail registration if referral tracking fails
      }
    }

    // Send verification email (non-blocking)
    sendVerificationEmail(user.email, user.verificationToken, firstName).catch((err) => {
      console.error('Failed to send verification email:', err)
    })

    const successMessage = validatedInvite
      ? 'Registration successful! You have been added to the company. Please check your email to verify your account.'
      : 'Registration successful! Please check your email to verify your account.'

    return NextResponse.json(
      {
        message: successMessage,
        userId: user._id.toString(),
        companyJoined: validatedInvite ? true : false,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
