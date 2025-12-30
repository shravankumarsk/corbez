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

    const body = await request.json()
    const { reason } = body

    await connectDB()

    const merchant = await Merchant.findById(params.id)

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
    }

    // Update status to SUSPENDED (rejected)
    merchant.status = 'SUSPENDED'
    await merchant.save()

    // Log audit trail
    await audit(AuditAction.MERCHANT_REJECTED, {
      performedBy: session.user.id,
      targetId: merchant._id.toString(),
      targetType: 'Merchant',
      severity: AuditSeverity.HIGH,
      metadata: {
        merchantName: merchant.businessName,
        reason,
      },
    })

    // TODO: Send rejection email to merchant

    return NextResponse.json({
      success: true,
      message: 'Merchant rejected successfully',
    })
  } catch (error) {
    console.error('Error rejecting merchant:', error)
    return NextResponse.json(
      { error: 'Failed to reject merchant' },
      { status: 500 }
    )
  }
}
