import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import { InviteCode, InviteCodeStatus } from '@/lib/db/models/invite-code.model'
import { Company } from '@/lib/db/models/company.model'

// GET - Verify an invite code (check if valid)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Invite code is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Find the invite code
    const invite = await InviteCode.findOne({
      code: code.toUpperCase().replace(/\s/g, ''),
    })

    if (!invite) {
      return NextResponse.json(
        { success: false, error: 'Invalid invite code' },
        { status: 404 }
      )
    }

    // Check status
    if (invite.status === InviteCodeStatus.USED) {
      return NextResponse.json(
        { success: false, error: 'This invite code has already been used' },
        { status: 400 }
      )
    }

    if (invite.status === InviteCodeStatus.REVOKED) {
      return NextResponse.json(
        { success: false, error: 'This invite code has been revoked' },
        { status: 400 }
      )
    }

    // Check expiration
    if (new Date() > new Date(invite.expiresAt)) {
      // Update status to expired
      invite.status = InviteCodeStatus.EXPIRED
      await invite.save()

      return NextResponse.json(
        { success: false, error: 'This invite code has expired' },
        { status: 400 }
      )
    }

    // Get company info
    const company = await Company.findById(invite.companyId)

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      invite: {
        code: invite.code,
        companyId: company._id,
        companyName: company.name,
        email: invite.email, // If invite is tied to specific email
        expiresAt: invite.expiresAt,
      },
    })
  } catch (error) {
    console.error('Verify invite error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to verify invite code' },
      { status: 500 }
    )
  }
}
