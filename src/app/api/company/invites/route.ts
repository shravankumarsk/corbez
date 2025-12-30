import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { InviteCode, InviteCodeStatus, generateInviteCode } from '@/lib/db/models/invite-code.model'
import { CompanyAdmin } from '@/lib/db/models/company-admin.model'
import { Company } from '@/lib/db/models/company.model'
import { User } from '@/lib/db/models/user.model'
import { sendInviteEmail } from '@/lib/services/email/resend'

// GET - List all invite codes for the company
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'

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

    // Build query
    const query: Record<string, unknown> = { companyId: adminRecord.companyId }

    if (status !== 'all') {
      query.status = status.toUpperCase()
    }

    // Get invite codes
    const invites = await InviteCode.find(query)
      .populate('createdBy', 'email')
      .populate('usedBy', 'email')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    // Check for expired codes and update them
    const now = new Date()
    const formattedInvites = invites.map((invite: any) => {
      let currentStatus = invite.status
      if (invite.status === 'ACTIVE' && new Date(invite.expiresAt) < now) {
        currentStatus = 'EXPIRED'
      }

      return {
        _id: invite._id,
        code: invite.code,
        email: invite.email,
        status: currentStatus,
        createdBy: invite.createdBy?.email,
        usedBy: invite.usedBy?.email,
        expiresAt: invite.expiresAt,
        usedAt: invite.usedAt,
        createdAt: invite.createdAt,
      }
    })

    return NextResponse.json({
      success: true,
      invites: formattedInvites,
    })
  } catch (error) {
    console.error('Failed to fetch invites:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invites' },
      { status: 500 }
    )
  }
}

// POST - Create invite codes
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
    const { count = 1, emails = [], expiresInDays = 30, sendEmails = true } = body

    // Validate
    if (count < 1 || count > 100) {
      return NextResponse.json(
        { success: false, error: 'Count must be between 1 and 100' },
        { status: 400 }
      )
    }

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

    // Get company and inviter info for email
    const company = await Company.findById(adminRecord.companyId)
    const inviterUser = await User.findById(session.user.id)

    const companyName = company?.name || 'Your Company'
    const inviterName = inviterUser?.email?.split('@')[0] || undefined

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    const createdInvites: Array<{
      _id: string
      code: string
      email?: string
      expiresAt: Date
      emailSent?: boolean
    }> = []
    let emailsSent = 0
    let emailsFailed = 0

    // If emails are provided, create one invite per email
    if (emails.length > 0) {
      for (const email of emails) {
        // Check if invite already exists for this email
        const existing = await InviteCode.findOne({
          companyId: adminRecord.companyId,
          email: email.toLowerCase(),
          status: InviteCodeStatus.ACTIVE,
        })

        if (existing) {
          continue // Skip if already has active invite
        }

        let code = generateInviteCode()
        // Ensure unique code
        while (await InviteCode.findOne({ code })) {
          code = generateInviteCode()
        }

        const invite = await InviteCode.create({
          code,
          companyId: adminRecord.companyId,
          createdBy: session.user.id,
          email: email.toLowerCase(),
          expiresAt,
        })

        const inviteData: {
          _id: string
          code: string
          email: string
          expiresAt: Date
          emailSent?: boolean
        } = {
          _id: invite._id.toString(),
          code: invite.code,
          email: invite.email,
          expiresAt: invite.expiresAt,
        }

        // Send invite email if enabled
        if (sendEmails) {
          const emailResult = await sendInviteEmail(
            email.toLowerCase(),
            invite.code,
            companyName,
            inviterName,
            expiresAt
          )

          if (emailResult.success) {
            emailsSent++
            inviteData.emailSent = true
          } else {
            emailsFailed++
            inviteData.emailSent = false
          }
        }

        createdInvites.push(inviteData)
      }
    } else {
      // Create generic invites (no specific email)
      for (let i = 0; i < count; i++) {
        let code = generateInviteCode()
        // Ensure unique code
        while (await InviteCode.findOne({ code })) {
          code = generateInviteCode()
        }

        const invite = await InviteCode.create({
          code,
          companyId: adminRecord.companyId,
          createdBy: session.user.id,
          expiresAt,
        })

        createdInvites.push({
          _id: invite._id.toString(),
          code: invite.code,
          expiresAt: invite.expiresAt,
        })
      }
    }

    // Build response message
    let message = `Created ${createdInvites.length} invite code(s)`
    if (emails.length > 0 && sendEmails) {
      if (emailsSent > 0 && emailsFailed === 0) {
        message += ` and sent ${emailsSent} invitation email(s)`
      } else if (emailsSent > 0 && emailsFailed > 0) {
        message += `. Sent ${emailsSent} email(s), ${emailsFailed} failed`
      } else if (emailsFailed > 0) {
        message += ` but failed to send emails`
      }
    }

    return NextResponse.json({
      success: true,
      invites: createdInvites,
      message,
      emailsSent,
      emailsFailed,
    })
  } catch (error) {
    console.error('Failed to create invites:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create invites' },
      { status: 500 }
    )
  }
}
