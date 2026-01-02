import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import { Discount, DiscountType } from '@/lib/db/models/discount.model'
import { requireActiveSubscription } from '@/lib/middleware/subscription-guard'
import { updateDiscountSchema, discountIdSchema } from '@/lib/validations/discount.schema'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PUT - Update a discount
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check subscription status - merchant must have active subscription
    const { merchant, error } = await requireActiveSubscription(request)
    if (error) return error

    const { id } = await params

    // SECURITY: Validate discount ID format
    const idValidation = discountIdSchema.safeParse({ id })
    if (!idValidation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid discount ID format' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // SECURITY: Validate input with Zod to prevent NoSQL injection
    const validationResult = updateDiscountSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    await connectDB()

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

    // Update fields with validated data
    if (data.name !== undefined) discount.name = data.name
    if (data.percentage !== undefined) discount.percentage = data.percentage
    if (data.isActive !== undefined) discount.isActive = data.isActive

    // Type-specific updates with validated data
    // SECURITY: Validated input prevents regex injection
    if (discount.type === DiscountType.COMPANY && data.companyName !== undefined) {
      // Check for duplicate
      const existingCompany = await Discount.findOne({
        merchantId: merchant._id,
        type: DiscountType.COMPANY,
        companyName: { $regex: new RegExp(`^${data.companyName}$`, 'i') },
        _id: { $ne: discount._id },
      })

      if (existingCompany) {
        return NextResponse.json(
          { success: false, error: 'A discount for this company already exists' },
          { status: 400 }
        )
      }

      discount.companyName = data.companyName
    }

    if (discount.type === DiscountType.SPEND_THRESHOLD && data.minSpend !== undefined) {
      discount.minSpend = data.minSpend
    }

    // SECURITY: Validated input prevents regex injection
    if (discount.type === DiscountType.COMPANY_PERK) {
      if (data.companyName !== undefined) {
        // Check for duplicate
        const existingPerk = await Discount.findOne({
          merchantId: merchant._id,
          type: DiscountType.COMPANY_PERK,
          companyName: { $regex: new RegExp(`^${data.companyName}$`, 'i') },
          perkItem: data.perkItem || discount.perkItem,
          _id: { $ne: discount._id },
        })

        if (existingPerk) {
          return NextResponse.json(
            { success: false, error: 'A perk with this item for this company already exists' },
            { status: 400 }
          )
        }

        discount.companyName = data.companyName
      }

      if (data.perkItem !== undefined) {
        // Check for duplicate with new perk item
        const existingPerk = await Discount.findOne({
          merchantId: merchant._id,
          type: DiscountType.COMPANY_PERK,
          companyName: discount.companyName,
          perkItem: { $regex: new RegExp(`^${data.perkItem}$`, 'i') },
          _id: { $ne: discount._id },
        })

        if (existingPerk) {
          return NextResponse.json(
            { success: false, error: 'A perk with this item for this company already exists' },
            { status: 400 }
          )
        }

        discount.perkItem = data.perkItem
      }

      if (data.perkValue !== undefined) discount.perkValue = data.perkValue
      if (data.perkDescription !== undefined) discount.perkDescription = data.perkDescription
      if (data.perkRestrictions !== undefined) discount.perkRestrictions = data.perkRestrictions
    }

    // Update monthly usage limit with validated data
    if (data.monthlyUsageLimit !== undefined) {
      if (data.monthlyUsageLimit === null || data.monthlyUsageLimit === '') {
        discount.monthlyUsageLimit = null
      } else {
        discount.monthlyUsageLimit = data.monthlyUsageLimit
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
    // Check subscription status - merchant must have active subscription
    const { merchant, error } = await requireActiveSubscription(request)
    if (error) return error

    const { id } = await params

    // SECURITY: Validate discount ID format
    const idValidation = discountIdSchema.safeParse({ id })
    if (!idValidation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid discount ID format' },
        { status: 400 }
      )
    }

    await connectDB()

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
