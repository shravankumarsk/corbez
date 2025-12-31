import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { Merchant } from '@/lib/db/models/merchant.model'
import { Discount, DiscountType } from '@/lib/db/models/discount.model'

// GET - List all discounts for the merchant
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()

    // Get merchant
    const merchant = await Merchant.findOne({ userId: session.user.id })

    if (!merchant) {
      return NextResponse.json(
        { success: false, error: 'Merchant profile not found' },
        { status: 404 }
      )
    }

    // Get all discounts for this merchant
    const discounts = await Discount.find({ merchantId: merchant._id })
      .sort({ type: 1, priority: -1, createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      discounts,
    })
  } catch (error) {
    console.error('Failed to fetch discounts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch discounts' },
      { status: 500 }
    )
  }
}

// POST - Create a new discount
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
    const {
      type,
      name,
      percentage,
      companyName,
      minSpend,
      perkItem,
      perkValue,
      perkDescription,
      perkRestrictions,
      monthlyUsageLimit
    } = body

    // Validate required fields
    if (!type || !name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Percentage is required for all types except COMPANY_PERK
    if (type !== DiscountType.COMPANY_PERK && percentage === undefined) {
      return NextResponse.json(
        { success: false, error: 'Percentage is required' },
        { status: 400 }
      )
    }

    // Validate type
    if (!Object.values(DiscountType).includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid discount type' },
        { status: 400 }
      )
    }

    // Validate percentage (if provided)
    if (percentage !== undefined && (percentage < 0 || percentage > 100)) {
      return NextResponse.json(
        { success: false, error: 'Percentage must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Type-specific validation
    if (type === DiscountType.COMPANY && !companyName) {
      return NextResponse.json(
        { success: false, error: 'Company name is required for company discounts' },
        { status: 400 }
      )
    }

    if (type === DiscountType.SPEND_THRESHOLD && (!minSpend || minSpend <= 0)) {
      return NextResponse.json(
        { success: false, error: 'Minimum spend amount is required for spend threshold discounts' },
        { status: 400 }
      )
    }

    if (type === DiscountType.COMPANY_PERK) {
      if (!companyName) {
        return NextResponse.json(
          { success: false, error: 'Company name is required for company perks' },
          { status: 400 }
        )
      }
      if (!perkItem) {
        return NextResponse.json(
          { success: false, error: 'Perk item is required for company perks' },
          { status: 400 }
        )
      }
      if (perkValue !== undefined && perkValue < 0) {
        return NextResponse.json(
          { success: false, error: 'Perk value cannot be negative' },
          { status: 400 }
        )
      }
    }

    // Validate monthly usage limit
    if (monthlyUsageLimit !== null && monthlyUsageLimit !== undefined) {
      if (monthlyUsageLimit < 1 || monthlyUsageLimit > 100) {
        return NextResponse.json(
          { success: false, error: 'Monthly usage limit must be between 1 and 100' },
          { status: 400 }
        )
      }
    }

    await connectDB()

    // Get merchant
    const merchant = await Merchant.findOne({ userId: session.user.id })

    if (!merchant) {
      return NextResponse.json(
        { success: false, error: 'Merchant profile not found' },
        { status: 404 }
      )
    }

    // Check if base discount already exists
    if (type === DiscountType.BASE) {
      const existingBase = await Discount.findOne({
        merchantId: merchant._id,
        type: DiscountType.BASE,
      })

      if (existingBase) {
        return NextResponse.json(
          { success: false, error: 'Base discount already exists. Edit the existing one instead.' },
          { status: 400 }
        )
      }
    }

    // Check for duplicate company discount
    if (type === DiscountType.COMPANY) {
      const existingCompany = await Discount.findOne({
        merchantId: merchant._id,
        type: DiscountType.COMPANY,
        companyName: { $regex: new RegExp(`^${companyName}$`, 'i') },
      })

      if (existingCompany) {
        return NextResponse.json(
          { success: false, error: 'A discount for this company already exists' },
          { status: 400 }
        )
      }
    }

    // Check for duplicate company perk with same item
    if (type === DiscountType.COMPANY_PERK) {
      const existingPerk = await Discount.findOne({
        merchantId: merchant._id,
        type: DiscountType.COMPANY_PERK,
        companyName: { $regex: new RegExp(`^${companyName}$`, 'i') },
        perkItem: { $regex: new RegExp(`^${perkItem}$`, 'i') },
      })

      if (existingPerk) {
        return NextResponse.json(
          { success: false, error: 'A perk with this item for this company already exists' },
          { status: 400 }
        )
      }
    }

    // Set priority based on type
    let priority = 0
    if (type === DiscountType.SPEND_THRESHOLD) {
      priority = 10 // Highest priority
    } else if (type === DiscountType.COMPANY_PERK) {
      priority = 6 // Medium-high priority (perks are special)
    } else if (type === DiscountType.COMPANY) {
      priority = 5 // Medium priority
    }
    // BASE has priority 0 (lowest)

    // Create discount
    const discount = await Discount.create({
      merchantId: merchant._id,
      type,
      name,
      percentage: type === DiscountType.COMPANY_PERK ? 0 : percentage,
      companyName: (type === DiscountType.COMPANY || type === DiscountType.COMPANY_PERK) ? companyName : undefined,
      minSpend: type === DiscountType.SPEND_THRESHOLD ? minSpend : undefined,
      perkItem: type === DiscountType.COMPANY_PERK ? perkItem : undefined,
      perkValue: type === DiscountType.COMPANY_PERK ? perkValue : undefined,
      perkDescription: type === DiscountType.COMPANY_PERK ? perkDescription : undefined,
      perkRestrictions: type === DiscountType.COMPANY_PERK ? perkRestrictions : undefined,
      monthlyUsageLimit: monthlyUsageLimit || null,
      priority,
      isActive: true,
    })

    return NextResponse.json({
      success: true,
      discount,
    })
  } catch (error) {
    console.error('Failed to create discount:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create discount' },
      { status: 500 }
    )
  }
}
