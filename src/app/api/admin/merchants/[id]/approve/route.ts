import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { Merchant } from '@/lib/db/models/merchant.model'
import { audit, AuditAction, AuditSeverity } from '@/lib/audit/logger'

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const session = await auth()

    if (!session || session.user.role !== 'PLATFORM_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const merchant = await Merchant.findById(params.id)

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
    }

    // Update status to ACTIVE
    merchant.status = 'ACTIVE'
    merchant.verifiedAt = new Date()
    await merchant.save()

    // Log audit trail
    audit.withUser({ id: session.user.id }).log({
      action: AuditAction.MERCHANT_UPDATED,
      description: `Approved merchant: ${merchant.businessName}`,
      resource: 'Merchant',
      resourceId: merchant._id.toString(),
      severity: AuditSeverity.INFO,
      metadata: {
        merchantName: merchant.businessName,
        previousStatus: 'PENDING',
        newStatus: 'ACTIVE',
        operation: 'approve',
      },
    })

    // TODO: Send approval email to merchant

    return NextResponse.json({
      success: true,
      message: 'Merchant approved successfully',
    })
  } catch (error) {
    console.error('Error approving merchant:', error)
    return NextResponse.json(
      { error: 'Failed to approve merchant' },
      { status: 500 }
    )
  }
}
