import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { User } from '@/lib/db/models/user.model'
import { Employee } from '@/lib/db/models/employee.model'
import { Company } from '@/lib/db/models/company.model'
import { Referral, ReferralStatus } from '@/lib/db/models/referral.model'

// Generate a unique, readable referral code
function generateReferralCode(firstName?: string): string {
  const prefix = firstName
    ? firstName.substring(0, 3).toUpperCase()
    : 'REF'
  const random = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `${prefix}-${random}`
}

// GET - Get user's referral info and stats
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Generate referral code if doesn't exist
    if (!user.referralCode) {
      user.referralCode = generateReferralCode(user.firstName)
      await user.save()
    }

    // Get user's company info (if employee)
    let companyName = null
    let companyId = null
    const employee = await Employee.findOne({ userId: user._id }).populate('companyId')
    if (employee?.companyId) {
      const company = await Company.findById(employee.companyId)
      if (company) {
        companyName = company.name
        companyId = company._id.toString()
      }
    }

    // Get referral stats
    const referralStats = await Referral.aggregate([
      { $match: { referrerId: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ])

    const stats = {
      pending: 0,
      registered: 0,
      completed: 0,
      total: 0,
      sameCompany: 0,
    }

    referralStats.forEach((stat) => {
      stats[stat._id.toLowerCase() as keyof typeof stats] = stat.count
      stats.total += stat.count
    })

    // Count same company referrals
    const sameCompanyCount = await Referral.countDocuments({
      referrerId: user._id,
      sameCompany: true,
      status: { $in: [ReferralStatus.REGISTERED, ReferralStatus.COMPLETED] },
    })
    stats.sameCompany = sameCompanyCount

    // Get recent referrals
    const recentReferrals = await Referral.find({ referrerId: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('referredUserId', 'firstName lastName email')

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3010'
    const referralLink = `${baseUrl}/register?ref=${user.referralCode}`

    return NextResponse.json({
      referralCode: user.referralCode,
      referralLink,
      companyName,
      companyId,
      stats,
      recentReferrals: recentReferrals.map((r) => ({
        id: r._id.toString(),
        email: r.referredEmail,
        user: r.referredUserId ? {
          firstName: (r.referredUserId as any).firstName,
          lastName: (r.referredUserId as any).lastName,
          email: (r.referredUserId as any).email,
        } : null,
        status: r.status,
        sameCompany: r.sameCompany,
        createdAt: r.createdAt,
        registeredAt: r.registeredAt,
      })),
    })
  } catch (error) {
    console.error('Referral fetch error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
