import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { User } from '@/lib/db/models/user.model'
import { CompanyAdmin, AdminRole, AdminStatus, getDefaultPermissions } from '@/lib/db/models/company-admin.model'

// GET - List all admins for the company
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
    })

    if (!adminRecord) {
      return NextResponse.json(
        { success: false, error: 'Not a company admin' },
        { status: 403 }
      )
    }

    // Get all admins for this company
    const admins = await CompanyAdmin.find({
      companyId: adminRecord.companyId,
    })
      .populate('userId', 'email name')
      .populate('invitedBy', 'email')
      .sort({ role: 1, createdAt: 1 })
      .lean()

    const formattedAdmins = admins.map((admin: any) => ({
      _id: admin._id,
      email: admin.userId?.email,
      name: admin.userId?.name,
      role: admin.role,
      title: admin.title,
      status: admin.status,
      permissions: admin.permissions,
      invitedBy: admin.invitedBy?.email,
      acceptedAt: admin.acceptedAt,
      createdAt: admin.createdAt,
    }))

    return NextResponse.json({
      success: true,
      admins: formattedAdmins,
    })
  } catch (error) {
    console.error('Failed to fetch admins:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admins' },
      { status: 500 }
    )
  }
}

// POST - Add a new admin
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { email, role, title } = body

    // Validate
    if (!email || !role) {
      return NextResponse.json(
        { success: false, error: 'Email and role are required' },
        { status: 400 }
      )
    }

    if (!Object.values(AdminRole).includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if user is a company admin with permission to manage admins
    const adminRecord = await CompanyAdmin.findOne({
      userId: session.user.id,
      status: 'ACTIVE',
    })

    if (!adminRecord) {
      return NextResponse.json(
        { success: false, error: 'Not a company admin' },
        { status: 403 }
      )
    }

    if (!adminRecord.permissions.manageAdmins) {
      return NextResponse.json(
        { success: false, error: 'No permission to manage admins' },
        { status: 403 }
      )
    }

    // Only OWNER can add another OWNER
    if (role === AdminRole.OWNER && adminRecord.role !== AdminRole.OWNER) {
      return NextResponse.json(
        { success: false, error: 'Only owners can add other owners' },
        { status: 403 }
      )
    }

    // Find the user by email
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found. They must register first.' },
        { status: 404 }
      )
    }

    // Check if already an admin
    const existingAdmin = await CompanyAdmin.findOne({
      userId: user._id,
      companyId: adminRecord.companyId,
    })

    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'User is already an admin for this company' },
        { status: 400 }
      )
    }

    // Create admin record
    const newAdmin = await CompanyAdmin.create({
      userId: user._id,
      companyId: adminRecord.companyId,
      role,
      title,
      status: AdminStatus.ACTIVE,
      invitedBy: session.user.id,
      invitedAt: new Date(),
      acceptedAt: new Date(), // Auto-accepted for now
      permissions: getDefaultPermissions(role),
    })

    // Update user role if needed
    if (user.role !== 'COMPANY_ADMIN') {
      user.role = 'COMPANY_ADMIN'
      await user.save()
    }

    return NextResponse.json({
      success: true,
      admin: {
        _id: newAdmin._id,
        email: user.email,
        role: newAdmin.role,
        title: newAdmin.title,
        status: newAdmin.status,
      },
    })
  } catch (error) {
    console.error('Failed to add admin:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add admin' },
      { status: 500 }
    )
  }
}
