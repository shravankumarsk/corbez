import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'
import { connectDB } from '@/lib/db/mongoose'
import { Merchant } from '@/lib/db/models/merchant.model'
import { moderationService } from '@/lib/services/moderation.service'
import { ModerationReason } from '@/lib/db/models/moderation-action.model'

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
    const { reason, duration } = body

    await connectDB()

    // Use moderation service to suspend merchant
    const result = await moderationService.suspendMerchant(params.id, {
      reason: reason || ModerationReason.TERMS_VIOLATION,
      reasonDetails: body.reasonDetails,
      duration: duration || { value: 1, unit: 'permanent' },
      evidence: {
        description: body.evidence || 'Suspended by platform admin',
      },
      performedBy: session.user.id,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Merchant suspended successfully',
    })
  } catch (error) {
    console.error('Error suspending merchant:', error)
    return NextResponse.json(
      { error: 'Failed to suspend merchant' },
      { status: 500 }
    )
  }
}
