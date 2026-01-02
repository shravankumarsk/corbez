import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { moderationService } from '@/lib/services/moderation.service'
import { ModerationReason } from '@/lib/db/models/moderation-action.model'

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

    const body = await request.json()
    const { reason, duration } = body

    await connectDB()

    // Use moderation service to suspend merchant
    const result = await moderationService.suspendMerchant(
      params.id,
      session.user.id,
      session.user.role,
      {
        reason: reason || ModerationReason.TERMS_VIOLATION,
        reasonDetails: body.reasonDetails,
        duration: duration || { value: 1, unit: 'permanent' },
        evidence: {
          description: body.evidence || 'Suspended by platform admin',
        },
      }
    )

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
