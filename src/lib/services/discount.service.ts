import { Discount, IDiscount, DiscountType } from '@/lib/db/models/discount.model'
import { BaseService } from './base.service'
import { eventBus, createEvent } from '@/lib/events'
import { cache, cacheKeys } from '@/lib/cache/redis'
import { Types } from 'mongoose'

export interface CreateDiscountInput {
  merchantId: string
  merchantName: string
  type: DiscountType
  name: string
  percentage: number
  companyId?: string
  companyName?: string
  minSpend?: number
  priority?: number
}

export interface UpdateDiscountInput {
  name?: string
  percentage?: number
  minSpend?: number
  isActive?: boolean
  priority?: number
}

class DiscountService extends BaseService<IDiscount> {
  constructor() {
    super(Discount, 'discount', 300) // 5 min cache
  }

  /**
   * Create a new discount
   */
  async createDiscount(input: CreateDiscountInput, userId: string): Promise<IDiscount> {
    await this.ensureConnection()

    const discount = await this.create({
      merchantId: new Types.ObjectId(input.merchantId),
      type: input.type,
      name: input.name,
      percentage: input.percentage,
      companyId: input.companyId ? new Types.ObjectId(input.companyId) : undefined,
      companyName: input.companyName,
      minSpend: input.minSpend,
      priority: input.priority || 0,
      isActive: true,
    })

    // Emit event
    eventBus.emitAsync(
      createEvent.discountCreated({
        discountId: discount._id.toString(),
        merchantId: input.merchantId,
        merchantName: input.merchantName,
        percentage: input.percentage,
        description: input.name,
      })
    )

    // Invalidate merchant discounts cache
    await cache.del(cacheKeys.merchantDiscounts(input.merchantId))

    return discount
  }

  /**
   * Get all discounts for a merchant
   */
  async getByMerchant(merchantId: string, activeOnly = true): Promise<IDiscount[]> {
    const cacheKey = cacheKeys.merchantDiscounts(merchantId)

    const fetchDiscounts = async () => {
      const filter: Record<string, unknown> = {
        merchantId: new Types.ObjectId(merchantId),
      }
      if (activeOnly) {
        filter.isActive = true
      }

      return this.find(filter, { sort: { priority: -1 } })
    }

    if (activeOnly) {
      return cache.getOrSet(cacheKey, fetchDiscounts, this.cacheTTL)
    }

    return fetchDiscounts()
  }

  /**
   * Get applicable discount for an employee at a merchant
   */
  async getApplicableDiscount(
    merchantId: string,
    employeeCompanyId?: string,
    orderAmount?: number
  ): Promise<IDiscount | null> {
    const discounts = await this.getByMerchant(merchantId)

    // Sort by priority (highest first) and find best applicable discount
    const sortedDiscounts = discounts.sort((a, b) => b.priority - a.priority)

    let bestDiscount: IDiscount | null = null
    let bestPercentage = 0

    for (const discount of sortedDiscounts) {
      // Check if discount is applicable
      if (!this.isDiscountApplicable(discount, employeeCompanyId, orderAmount)) {
        continue
      }

      // Track best discount by percentage
      if (discount.percentage > bestPercentage) {
        bestDiscount = discount
        bestPercentage = discount.percentage
      }
    }

    return bestDiscount
  }

  /**
   * Check if a discount is applicable for given context
   */
  private isDiscountApplicable(
    discount: IDiscount,
    employeeCompanyId?: string,
    orderAmount?: number
  ): boolean {
    switch (discount.type) {
      case DiscountType.BASE:
        // Base discount applies to all verified employees
        return true

      case DiscountType.COMPANY:
        // Company discount only applies if employee is from that company
        return !!employeeCompanyId && discount.companyId?.toString() === employeeCompanyId

      case DiscountType.SPEND_THRESHOLD:
        // Spend threshold discount requires minimum order amount
        return !!orderAmount && !!discount.minSpend && orderAmount >= discount.minSpend

      default:
        return false
    }
  }

  /**
   * Update a discount
   */
  async updateDiscount(
    discountId: string,
    merchantId: string,
    input: UpdateDiscountInput
  ): Promise<IDiscount | null> {
    const discount = await this.updateById(discountId, { $set: input })

    if (discount) {
      // Emit event
      eventBus.emitAsync(
        createEvent.discountUpdated({
          discountId,
          merchantId,
          changes: input as unknown as Record<string, unknown>,
        })
      )

      // Invalidate cache
      await cache.del(cacheKeys.merchantDiscounts(merchantId))
    }

    return discount
  }

  /**
   * Toggle discount active status
   */
  async toggleActive(discountId: string, merchantId: string): Promise<IDiscount | null> {
    const discount = await this.findById(discountId)
    if (!discount) return null

    return this.updateDiscount(discountId, merchantId, { isActive: !discount.isActive })
  }

  /**
   * Delete a discount
   */
  async deleteDiscount(discountId: string, merchantId: string): Promise<boolean> {
    const deleted = await this.deleteById(discountId)

    if (deleted) {
      // Invalidate cache
      await cache.del(cacheKeys.merchantDiscounts(merchantId))
    }

    return deleted
  }

  /**
   * Get all discounts for a company (across all merchants)
   */
  async getCompanyDiscounts(companyId: string): Promise<IDiscount[]> {
    return this.find(
      {
        companyId: new Types.ObjectId(companyId),
        type: DiscountType.COMPANY,
        isActive: true,
      },
      { sort: { percentage: -1 } }
    )
  }

  /**
   * Calculate potential savings for a company
   */
  async calculateCompanySavings(
    companyId: string,
    employeeCount: number,
    avgVisitsPerMonth = 2
  ): Promise<{
    totalMonthlySavings: number
    merchantBreakdown: Array<{
      merchantId: string
      merchantName: string
      discountPercentage: number
      estimatedSavings: number
    }>
  }> {
    await this.ensureConnection()

    // Get company-specific discounts with merchant details
    const discounts = await Discount.find({
      companyId: new Types.ObjectId(companyId),
      type: DiscountType.COMPANY,
      isActive: true,
    })
      .populate('merchantId', 'businessName businessMetrics')
      .lean()

    let totalMonthlySavings = 0
    const merchantBreakdown: Array<{
      merchantId: string
      merchantName: string
      discountPercentage: number
      estimatedSavings: number
    }> = []

    for (const discount of discounts) {
      const merchant = discount.merchantId as unknown as {
        _id: Types.ObjectId
        businessName: string
        businessMetrics?: { avgOrderValue?: number }
      }

      const avgOrderValue = merchant.businessMetrics?.avgOrderValue || 15
      const monthlySavings =
        avgOrderValue * (discount.percentage / 100) * employeeCount * avgVisitsPerMonth

      totalMonthlySavings += monthlySavings

      merchantBreakdown.push({
        merchantId: merchant._id.toString(),
        merchantName: merchant.businessName,
        discountPercentage: discount.percentage,
        estimatedSavings: Math.round(monthlySavings * 100) / 100,
      })
    }

    return {
      totalMonthlySavings: Math.round(totalMonthlySavings * 100) / 100,
      merchantBreakdown: merchantBreakdown.sort((a, b) => b.estimatedSavings - a.estimatedSavings),
    }
  }
}

export const discountService = new DiscountService()
export default discountService
