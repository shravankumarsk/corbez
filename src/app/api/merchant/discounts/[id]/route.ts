import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { Merchant } from '@/lib/db/models/merchant.model'
import { Discount, DiscountType } from '@/lib/db/models/discount.model'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PUT - Update a discount
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
    const { name, percentage, companyName, minSpend, isActive, monthlyUsageLimit } = body

    await connectDB()

    // Get merchant
    const merchant = await Merchant.findOne({ userId: session.user.id })

    if (!merchant) {
      return NextResponse.json(
        { success: false, error: 'Merchant profile not found' },
        { status: 404 }
      )
    }

    // Find the discount
    const discount = await Discount.findOne({
      _id: id,
      merchantId: merchant._id,
    })

    if (!discount) {
      return NextResponse.json(
        { success: false, error: 'Discount not found' },
        { status: 404 }
      )
    }

    // Validate percentage if provided
    if (percentage !== undefined && (percentage < 0 || percentage > 100)) {
      return NextResponse.json(
        { success: false, error: 'Percentage must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Update fields
    if (name !== undefined) discount.name = name
    if (percentage !== undefined) discount.percentage = percentage
    if (isActive !== undefined) discount.isActive = isActive

    // Type-specific updates
    if (discount.type === DiscountType.COMPANY && companyName !== undefined) {
      // Check for duplicate
      const existingCompany = await Discount.findOne({
        merchantId: merchant._id,
        type: DiscountType.COMPANY,
        companyName: { $regex: new RegExp(`^${companyName}$`, 'i') },
        _id: { $ne: discount._id },
      })

      if (existingCompany) {
        return NextResponse.json(
          { success: false, error: 'A discount for this company already exists' },
          { status: 400 }
        )
      }

      discount.companyName = companyName
    }

    if (discount.type === DiscountType.SPEND_THRESHOLD && minSpend !== undefined) {
      if (minSpend <= 0) {
        return NextResponse.json(
          { success: false, error: 'Minimum spend must be greater than 0' },
          { status: 400 }
        )
      }
      discount.minSpend = minSpend
    }

    // Update monthly usage limit
    if (monthlyUsageLimit !== undefined) {
      if (monthlyUsageLimit === null || monthlyUsageLimit === '') {
        discount.monthlyUsageLimit = null
      } else {
        const limit = Number(monthlyUsageLimit)
        if (limit < 1 || limit > 100) {
          return NextResponse.json(
            { success: false, error: 'Monthly usage limit must be between 1 and 100' },
            { status: 400 }
          )
        }
        discount.monthlyUsageLimit = limit
      }
    }

    await discount.save()

    return NextResponse.json({
      success: true,
      discount,
    })
  } catch (error) {
    console.error('Failed to update discount:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update discount' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a discount
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

    // Get merchant
    const merchant = await Merchant.findOne({ userId: session.user.id })

    if (!merchant) {
      return NextResponse.json(
        { success: false, error: 'Merchant profile not found' },
        { status: 404 }
      )
    }

    // Find and delete the discount
    const discount = await Discount.findOneAndDelete({
      _id: id,
      merchantId: merchant._id,
    })

    if (!discount) {
      return NextResponse.json(
        { success: false, error: 'Discount not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Discount deleted successfully',
    })
  } catch (error) {
    console.error('Failed to delete discount:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete discount' },
      { status: 500 }
    )
  }
}
