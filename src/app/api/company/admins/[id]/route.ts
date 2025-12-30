import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { CompanyAdmin, AdminRole, AdminStatus } from '@/lib/db/models/company-admin.model'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PUT - Update admin role/permissions
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { role, title, permissions, status } = body

    await connectDB()

    // Check if user is a company admin with permission
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

    // Find the admin to update
    const targetAdmin = await CompanyAdmin.findOne({
      _id: id,
      companyId: adminRecord.companyId,
    })

    if (!targetAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      )
    }

    // Cannot modify an OWNER unless you are an OWNER
    if (targetAdmin.role === AdminRole.OWNER && adminRecord.role !== AdminRole.OWNER) {
      return NextResponse.json(
        { success: false, error: 'Cannot modify an owner' },
        { status: 403 }
      )
    }

    // Cannot change role to OWNER unless you are an OWNER
    if (role === AdminRole.OWNER && adminRecord.role !== AdminRole.OWNER) {
      return NextResponse.json(
        { success: false, error: 'Cannot promote to owner' },
        { status: 403 }
      )
    }

    // Update fields
    if (role && Object.values(AdminRole).includes(role)) {
      targetAdmin.role = role
    }
    if (title !== undefined) {
      targetAdmin.title = title
    }
    if (status && Object.values(AdminStatus).includes(status)) {
      targetAdmin.status = status
    }
    if (permissions) {
      targetAdmin.permissions = {
        ...targetAdmin.permissions,
        ...permissions,
      }
    }

    await targetAdmin.save()

    return NextResponse.json({
      success: true,
      admin: {
        _id: targetAdmin._id,
        role: targetAdmin.role,
        title: targetAdmin.title,
        status: targetAdmin.status,
        permissions: targetAdmin.permissions,
      },
    })
  } catch (error) {
    console.error('Failed to update admin:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update admin' },
      { status: 500 }
    )
  }
}

// DELETE - Remove admin
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    await connectDB()

    // Check if user is a company admin with permission
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

    // Find the admin to remove
    const targetAdmin = await CompanyAdmin.findOne({
      _id: id,
      companyId: adminRecord.companyId,
    })

    if (!targetAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      )
    }

    // Cannot remove yourself
    if (targetAdmin.userId.toString() === session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot remove yourself' },
        { status: 400 }
      )
    }

    // Cannot remove an OWNER unless you are an OWNER
    if (targetAdmin.role === AdminRole.OWNER && adminRecord.role !== AdminRole.OWNER) {
      return NextResponse.json(
        { success: false, error: 'Cannot remove an owner' },
        { status: 403 }
      )
    }

    // Count remaining owners
    if (targetAdmin.role === AdminRole.OWNER) {
      const ownerCount = await CompanyAdmin.countDocuments({
        companyId: adminRecord.companyId,
        role: AdminRole.OWNER,
        status: AdminStatus.ACTIVE,
      })

      if (ownerCount <= 1) {
        return NextResponse.json(
          { success: false, error: 'Cannot remove the last owner' },
          { status: 400 }
        )
      }
    }

    await targetAdmin.deleteOne()

    return NextResponse.json({
      success: true,
      message: 'Admin removed successfully',
    })
  } catch (error) {
    console.error('Failed to remove admin:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove admin' },
      { status: 500 }
    )
  }
}
