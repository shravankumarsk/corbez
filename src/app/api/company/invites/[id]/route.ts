import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { InviteCode, InviteCodeStatus } from '@/lib/db/models/invite-code.model'
import { CompanyAdmin } from '@/lib/db/models/company-admin.model'
import { Company } from '@/lib/db/models/company.model'
import { User } from '@/lib/db/models/user.model'
import { sendInviteEmail } from '@/lib/services/email/resend'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST - Resend invite email
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Check if user is a company admin with invite permission
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

    if (!adminRecord.permissions.manageInvites) {
      return NextResponse.json(
        { success: false, error: 'No permission to manage invites' },
        { status: 403 }
      )
    }

    // Find the invite
    const invite = await InviteCode.findOne({
      _id: id,
      companyId: adminRecord.companyId,
    })

    if (!invite) {
      return NextResponse.json(
        { success: false, error: 'Invite not found' },
        { status: 404 }
      )
    }

    // Check if invite has an email address
    if (!invite.email) {
      return NextResponse.json(
        { success: false, error: 'This invite code is not tied to an email address' },
        { status: 400 }
      )
    }

    // Check if invite is still active
    if (invite.status !== InviteCodeStatus.ACTIVE) {
      return NextResponse.json(
        { success: false, error: `Cannot resend email for ${invite.status.toLowerCase()} invite` },
        { status: 400 }
      )
    }

    // Check if invite is expired
    if (new Date() > new Date(invite.expiresAt)) {
      invite.status = InviteCodeStatus.EXPIRED
      await invite.save()
      return NextResponse.json(
        { success: false, error: 'This invite has expired' },
        { status: 400 }
      )
    }

    // Get company and inviter info for email
    const company = await Company.findById(adminRecord.companyId)
    const inviterUser = await User.findById(session.user.id)

    const companyName = company?.name || 'Your Company'
    const inviterName = inviterUser?.email?.split('@')[0] || undefined

    // Send the invite email
    const emailResult = await sendInviteEmail(
      invite.email,
      invite.code,
      companyName,
      inviterName,
      invite.expiresAt
    )

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to send email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Invitation email resent to ${invite.email}`,
    })
  } catch (error) {
    console.error('Failed to resend invite:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to resend invite' },
      { status: 500 }
    )
  }
}

// DELETE - Revoke an invite code
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

    // Check if user is a company admin with invite permission
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

    if (!adminRecord.permissions.manageInvites) {
      return NextResponse.json(
        { success: false, error: 'No permission to manage invites' },
        { status: 403 }
      )
    }

    // Find and revoke invite
    const invite = await InviteCode.findOne({
      _id: id,
      companyId: adminRecord.companyId,
    })

    if (!invite) {
      return NextResponse.json(
        { success: false, error: 'Invite not found' },
        { status: 404 }
      )
    }

    if (invite.status === InviteCodeStatus.USED) {
      return NextResponse.json(
        { success: false, error: 'Cannot revoke a used invite' },
        { status: 400 }
      )
    }

    invite.status = InviteCodeStatus.REVOKED
    await invite.save()

    return NextResponse.json({
      success: true,
      message: 'Invite revoked successfully',
    })
  } catch (error) {
    console.error('Failed to revoke invite:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to revoke invite' },
      { status: 500 }
    )
  }
}
