import { connectDB } from '@/lib/db/mongoose'
import { Discount, DiscountType } from '@/lib/db/models/discount.model'
import { Types } from 'mongoose'

export interface DiscountCalculationParams {
  merchantId: string | Types.ObjectId
  companyName: string
  orderAmount?: number
}

export interface DiscountResult {
  percentage: number
  name: string
  type: DiscountType
}

/**
 * Calculate the best applicable discount for an employee
 *
 * Priority (highest to lowest):
 * 1. Spend threshold (if order amount exceeds minimum)
 * 2. Company-specific discount
 * 3. Base discount
 */
export async function calculateDiscount(
  params: DiscountCalculationParams
): Promise<DiscountResult | null> {
  await connectDB()

  const { merchantId, companyName, orderAmount } = params

  // Get all active discounts for this merchant
  const discounts = await Discount.find({
    merchantId,
    isActive: true,
  }).sort({ priority: -1, percentage: -1 })

  if (discounts.length === 0) {
    return null
  }

  // Find best applicable discount
  let bestDiscount: DiscountResult | null = null

  for (const discount of discounts) {
    // Check spend threshold discounts first (highest priority)
    if (discount.type === DiscountType.SPEND_THRESHOLD) {
      if (orderAmount && discount.minSpend && orderAmount >= discount.minSpend) {
        if (!bestDiscount || discount.percentage > bestDiscount.percentage) {
          bestDiscount = {
            percentage: discount.percentage,
            name: discount.name,
            type: discount.type,
          }
        }
      }
      continue
    }

    // Check company-specific discounts (medium priority)
    if (discount.type === DiscountType.COMPANY) {
      if (
        discount.companyName &&
        companyName.toLowerCase().includes(discount.companyName.toLowerCase())
      ) {
        if (!bestDiscount || discount.percentage > bestDiscount.percentage) {
          bestDiscount = {
            percentage: discount.percentage,
            name: discount.name,
            type: discount.type,
          }
        }
      }
      continue
    }

    // Base discount (lowest priority, fallback)
    if (discount.type === DiscountType.BASE) {
      if (!bestDiscount) {
        bestDiscount = {
          percentage: discount.percentage,
          name: discount.name,
          type: discount.type,
        }
      }
    }
  }

  return bestDiscount
}

/**
 * Get all applicable discounts for display (not just the best one)
 */
export async function getApplicableDiscounts(
  params: DiscountCalculationParams
): Promise<DiscountResult[]> {
  await connectDB()

  const { merchantId, companyName, orderAmount } = params

  const discounts = await Discount.find({
    merchantId,
    isActive: true,
  }).sort({ priority: -1, percentage: -1 })

  const applicable: DiscountResult[] = []

  for (const discount of discounts) {
    if (discount.type === DiscountType.SPEND_THRESHOLD) {
      if (orderAmount && discount.minSpend && orderAmount >= discount.minSpend) {
        applicable.push({
          percentage: discount.percentage,
          name: discount.name,
          type: discount.type,
        })
      }
    } else if (discount.type === DiscountType.COMPANY) {
      if (
        discount.companyName &&
        companyName.toLowerCase().includes(discount.companyName.toLowerCase())
      ) {
        applicable.push({
          percentage: discount.percentage,
          name: discount.name,
          type: discount.type,
        })
      }
    } else if (discount.type === DiscountType.BASE) {
      applicable.push({
        percentage: discount.percentage,
        name: discount.name,
        type: discount.type,
      })
    }
  }

  return applicable
}
