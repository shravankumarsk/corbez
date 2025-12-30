import { NextRequest, NextResponse } from 'next/server'
import { verifyEmployee } from '@/lib/services/qr/token-validator'
import { calculateDiscount } from '@/lib/services/discount/calculator'

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const { searchParams } = new URL(request.url)
    const merchantId = searchParams.get('merchantId')

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token required' }, { status: 400 })
    }

    const result = await verifyEmployee(token)

    if (!result.valid) {
      return NextResponse.json({
        success: false,
        data: null,
        error: result.message,
      })
    }

    // Calculate discount if merchantId is provided
    let discountInfo: {
      percentage: number
      name: string
      type: string
    } = {
      percentage: 0,
      name: 'No discount configured',
      type: 'NONE',
    }

    if (merchantId && result.companyName) {
      const discount = await calculateDiscount({
        merchantId,
        companyName: result.companyName,
      })

      if (discount) {
        discountInfo = {
          percentage: discount.percentage,
          name: discount.name,
          type: discount.type,
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        employeeName: result.employeeName,
        companyName: result.companyName,
        email: result.email,
        discount: discountInfo,
      },
      error: null,
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 })
  }
}
