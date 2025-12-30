import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { CompanyAdmin } from '@/lib/db/models/company-admin.model'
import { Employee } from '@/lib/db/models/employee.model'
import { InviteCode } from '@/lib/db/models/invite-code.model'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()

    // Check if user is a company admin
    const adminRecord = await CompanyAdmin.findOne({
      userId: session.user.id,
      status: 'ACTIVE',
    }).populate('companyId')

    if (!adminRecord) {
      return NextResponse.json(
        { success: false, error: 'Not a company admin' },
        { status: 403 }
      )
    }

    const company = adminRecord.companyId as any

    // Get employee count
    const employeeCount = await Employee.countDocuments({
      companyId: company._id,
      status: 'ACTIVE',
    })

    // Get pending employee count
    const pendingCount = await Employee.countDocuments({
      companyId: company._id,
      status: 'PENDING',
    })

    // Get invite code analytics
    const now = new Date()

    // Total invites ever created
    const totalInvites = await InviteCode.countDocuments({
      companyId: company._id,
    })

    // Active invites (not expired, not used, not revoked)
    const activeInvites = await InviteCode.countDocuments({
      companyId: company._id,
      status: 'ACTIVE',
      expiresAt: { $gt: now },
    })

    // Used invites
    const usedInvites = await InviteCode.countDocuments({
      companyId: company._id,
      status: 'USED',
    })

    // Expired invites
    const expiredInvites = await InviteCode.countDocuments({
      companyId: company._id,
      $or: [
        { status: 'EXPIRED' },
        { status: 'ACTIVE', expiresAt: { $lte: now } },
      ],
    })

    // Revoked invites
    const revokedInvites = await InviteCode.countDocuments({
      companyId: company._id,
      status: 'REVOKED',
    })

    // Invites used in last 7 days
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const usedLast7Days = await InviteCode.countDocuments({
      companyId: company._id,
      status: 'USED',
      usedAt: { $gte: sevenDaysAgo },
    })

    // Invites used in last 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const usedLast30Days = await InviteCode.countDocuments({
      companyId: company._id,
      status: 'USED',
      usedAt: { $gte: thirtyDaysAgo },
    })

    // Calculate conversion rate (used / total created, excluding active)
    const completedInvites = usedInvites + expiredInvites + revokedInvites
    const conversionRate = completedInvites > 0
      ? Math.round((usedInvites / completedInvites) * 100)
      : 0

    return NextResponse.json({
      success: true,
      company: {
        _id: company._id,
        name: company.name,
        slug: company.slug,
        logo: company.logo,
        emailDomain: company.settings?.emailDomain,
        status: company.status,
      },
      admin: {
        role: adminRecord.role,
        title: adminRecord.title,
        permissions: adminRecord.permissions,
      },
      stats: {
        employeeCount,
        pendingCount,
      },
      inviteStats: {
        total: totalInvites,
        active: activeInvites,
        used: usedInvites,
        expired: expiredInvites,
        revoked: revokedInvites,
        usedLast7Days,
        usedLast30Days,
        conversionRate,
      },
    })
  } catch (error) {
    console.error('Failed to fetch company:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch company' },
      { status: 500 }
    )
  }
}
