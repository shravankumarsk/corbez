import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/mongoose'
import { Merchant } from '@/lib/db/models/merchant.model'
import { audit, AuditAction, AuditSeverity } from '@/lib/audit/logger'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

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
    await audit(AuditAction.MERCHANT_APPROVED, {
      performedBy: session.user.id,
      targetId: merchant._id.toString(),
      targetType: 'Merchant',
      severity: AuditSeverity.MEDIUM,
      metadata: {
        merchantName: merchant.businessName,
        previousStatus: 'PENDING',
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
