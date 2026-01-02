import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import { Discount, DiscountType } from '@/lib/db/models/discount.model'
import { requireActiveSubscription } from '@/lib/middleware/subscription-guard'
import { createDiscountSchema } from '@/lib/validations/discount.schema'
import { checkRateLimit, rateLimitConfigs } from '@/lib/middleware/rate-limit'

// GET - List all discounts for the merchant
export async function GET(request: NextRequest) {
  try {
    // SECURITY: Rate limiting
    const rateLimitResult = await checkRateLimit(request, rateLimitConfigs.default)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitConfigs.default.message },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimitResult.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitResult.reset),
          },
        }
      )
    }

    // Check subscription status
    const { merchant, error } = await requireActiveSubscription(request)
    if (error) return error

    await connectDB()

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
    // SECURITY: Rate limiting
    const rateLimitResult = await checkRateLimit(request, rateLimitConfigs.default)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitConfigs.default.message },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimitResult.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitResult.reset),
          },
        }
      )
    }

    // Check subscription status - merchant must have active subscription
    const { merchant, error } = await requireActiveSubscription(request)
    if (error) return error

    const body = await request.json()

    // SECURITY: Validate input with Zod to prevent NoSQL injection
    const validationResult = createDiscountSchema.safeParse(body)
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

    // Check if base discount already exists
    if (data.type === DiscountType.BASE) {
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
    // SECURITY: Validated input prevents regex injection
    if (data.type === DiscountType.COMPANY && 'companyName' in data) {
      const existingCompany = await Discount.findOne({
        merchantId: merchant._id,
        type: DiscountType.COMPANY,
        companyName: { $regex: new RegExp(`^${data.companyName}$`, 'i') },
      })

      if (existingCompany) {
        return NextResponse.json(
          { success: false, error: 'A discount for this company already exists' },
          { status: 400 }
        )
      }
    }

    // Check for duplicate company perk with same item
    // SECURITY: Validated input prevents regex injection
    if (data.type === DiscountType.COMPANY_PERK && 'companyName' in data && 'perkItem' in data) {
      const existingPerk = await Discount.findOne({
        merchantId: merchant._id,
        type: DiscountType.COMPANY_PERK,
        companyName: { $regex: new RegExp(`^${data.companyName}$`, 'i') },
        perkItem: { $regex: new RegExp(`^${data.perkItem}$`, 'i') },
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
    if (data.type === DiscountType.SPEND_THRESHOLD) {
      priority = 10 // Highest priority
    } else if (data.type === DiscountType.COMPANY_PERK) {
      priority = 6 // Medium-high priority (perks are special)
    } else if (data.type === DiscountType.COMPANY) {
      priority = 5 // Medium priority
    }
    // BASE has priority 0 (lowest)

    // Create discount with validated data
    const discount = await Discount.create({
      merchantId: merchant._id,
      type: data.type,
      name: data.name,
      percentage: data.type === DiscountType.COMPANY_PERK ? 0 : (data.percentage ?? 0),
      companyName: (data.type === DiscountType.COMPANY || data.type === DiscountType.COMPANY_PERK) && 'companyName' in data ? data.companyName : undefined,
      minSpend: data.type === DiscountType.SPEND_THRESHOLD && 'minSpend' in data ? data.minSpend : undefined,
      perkItem: data.type === DiscountType.COMPANY_PERK && 'perkItem' in data ? data.perkItem : undefined,
      perkValue: data.type === DiscountType.COMPANY_PERK && 'perkValue' in data ? data.perkValue : undefined,
      perkDescription: data.type === DiscountType.COMPANY_PERK && 'perkDescription' in data ? data.perkDescription : undefined,
      perkRestrictions: data.type === DiscountType.COMPANY_PERK && 'perkRestrictions' in data ? data.perkRestrictions : undefined,
      monthlyUsageLimit: data.monthlyUsageLimit ?? null,
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
