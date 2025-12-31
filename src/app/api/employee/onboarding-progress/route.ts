import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { User } from '@/lib/db/models/user.model'
import { Employee } from '@/lib/db/models/employee.model'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Get user with onboarding progress
    const user = await User.findById(session.user.id).select(
      'firstName onboardingProgress emailVerified'
    )

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Get employee data to check company linking
    const employee = await Employee.findOne({ userId: user._id }).select('companyId')

    // Build progress object with defaults
    const progress = {
      emailVerified: user.emailVerified || false,
      companyLinked: !!employee?.companyId || false,
      firstDiscountClaimed: user.onboardingProgress?.firstDiscountClaimed || false,
      firstDiscountUsed: user.onboardingProgress?.firstDiscountUsed || false,
      walletPassAdded: user.onboardingProgress?.walletPassAdded || false,
      firstReferralSent: user.onboardingProgress?.firstReferralSent || false,
      completedAt: user.onboardingProgress?.completedAt,
    }

    return NextResponse.json({
      success: true,
      progress,
      userName: user.firstName,
    })
  } catch (error) {
    console.error('Error fetching onboarding progress:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// PATCH endpoint to update specific progress fields
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { field, value } = await request.json()

    // Validate field
    const validFields = [
      'firstDiscountClaimed',
      'firstDiscountUsed',
      'walletPassAdded',
      'firstReferralSent',
    ]

    if (!validFields.includes(field)) {
      return NextResponse.json({ message: 'Invalid field' }, { status: 400 })
    }

    await connectDB()

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Update the specific field
    if (!user.onboardingProgress) {
      user.onboardingProgress = {
        emailVerified: false,
        companyLinked: false,
        firstDiscountClaimed: false,
        firstDiscountUsed: false,
        walletPassAdded: false,
        firstReferralSent: false,
      }
    }

    user.onboardingProgress[field as keyof typeof user.onboardingProgress] = value

    // Check if all steps are completed
    const employee = await Employee.findOne({ userId: user._id })
    const allCompleted =
      user.emailVerified &&
      !!employee?.companyId &&
      user.onboardingProgress.firstDiscountClaimed &&
      user.onboardingProgress.firstDiscountUsed &&
      user.onboardingProgress.walletPassAdded &&
      user.onboardingProgress.firstReferralSent

    if (allCompleted && !user.onboardingProgress.completedAt) {
      user.onboardingProgress.completedAt = new Date()
    }

    await user.save()

    return NextResponse.json({
      success: true,
      message: 'Progress updated',
    })
  } catch (error) {
    console.error('Error updating onboarding progress:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
