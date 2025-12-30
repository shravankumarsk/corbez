import { Merchant, IMerchant, MerchantStatus, IBusinessMetrics, ILocation } from '@/lib/db/models/merchant.model'
import { BaseService } from './base.service'
import { eventBus, createEvent } from '@/lib/events'
import { cache, cacheKeys } from '@/lib/cache/redis'
import { Types } from 'mongoose'

export interface CreateMerchantInput {
  userId: string
  businessName: string
  description?: string
  categories?: string[]
  location: Omit<ILocation, '_id'>
  contactEmail?: string
  contactPhone?: string
  website?: string
}

export interface UpdateMerchantInput {
  businessName?: string
  description?: string
  logo?: string
  coverImage?: string
  categories?: string[]
  contactEmail?: string
  contactPhone?: string
  website?: string
}

export interface OnboardingInput {
  businessName: string
  description?: string
  categories: string[]
  location: Omit<ILocation, '_id'>
  businessMetrics: IBusinessMetrics
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

class MerchantService extends BaseService<IMerchant> {
  constructor() {
    super(Merchant, 'merchant', 600) // 10 min cache
  }

  /**
   * Create a new merchant
   */
  async createMerchant(input: CreateMerchantInput, ownerEmail: string): Promise<IMerchant> {
    await this.ensureConnection()

    const slug = await this.generateUniqueSlug(input.businessName)

    const merchant = await this.create({
      userId: new Types.ObjectId(input.userId),
      businessName: input.businessName,
      slug,
      description: input.description,
      categories: input.categories?.map((id) => new Types.ObjectId(id)) || [],
      locations: [input.location],
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      website: input.website,
      status: MerchantStatus.PENDING,
    })

    // Emit event
    eventBus.emitAsync(
      createEvent.merchantCreated({
        merchantId: merchant._id.toString(),
        businessName: merchant.businessName,
        ownerId: input.userId,
        ownerEmail,
      })
    )

    return merchant
  }

  /**
   * Find merchant by user ID
   */
  async findByUserId(userId: string): Promise<IMerchant | null> {
    const cacheKey = `merchant:by-user:${userId}`
    return cache.getOrSet(
      cacheKey,
      () => this.findOne({ userId: new Types.ObjectId(userId) }),
      this.cacheTTL
    )
  }

  /**
   * Find merchant by slug
   */
  async findBySlug(slug: string): Promise<IMerchant | null> {
    const cacheKey = `merchant:by-slug:${slug}`
    return cache.getOrSet(
      cacheKey,
      () => this.findOne({ slug }),
      this.cacheTTL
    )
  }

  /**
   * Update merchant profile
   */
  async updateProfile(merchantId: string, input: UpdateMerchantInput): Promise<IMerchant | null> {
    const updateData: Record<string, unknown> = { ...input }

    if (input.categories) {
      updateData.categories = input.categories.map((id) => new Types.ObjectId(id))
    }

    const merchant = await this.updateById(merchantId, { $set: updateData })

    if (merchant) {
      await this.invalidateCache(merchantId)
      await cache.del(`merchant:by-user:${merchant.userId}`)
      await cache.del(`merchant:by-slug:${merchant.slug}`)
    }

    return merchant
  }

  /**
   * Complete merchant onboarding
   */
  async completeOnboarding(merchantId: string, input: OnboardingInput): Promise<IMerchant | null> {
    const merchant = await this.updateById(merchantId, {
      $set: {
        businessName: input.businessName,
        description: input.description,
        categories: input.categories.map((id) => new Types.ObjectId(id)),
        locations: [input.location],
        businessMetrics: input.businessMetrics,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      },
    })

    if (merchant) {
      // Emit event
      eventBus.emitAsync(
        createEvent.merchantOnboardingCompleted({
          merchantId,
          businessMetrics: {
            avgOrderValue: input.businessMetrics.avgOrderValue,
            priceTier: input.businessMetrics.priceTier,
            cateringAvailable: input.businessMetrics.cateringAvailable,
          },
        })
      )

      // Invalidate caches
      await this.invalidateCache(merchantId)
    }

    return merchant
  }

  /**
   * Add a new location to merchant
   */
  async addLocation(merchantId: string, location: Omit<ILocation, '_id'>): Promise<IMerchant | null> {
    const merchant = await this.updateById(merchantId, {
      $push: { locations: location },
    })

    if (merchant) {
      await this.invalidateCache(merchantId)
    }

    return merchant
  }

  /**
   * Update a specific location
   */
  async updateLocation(
    merchantId: string,
    locationId: string,
    updates: Partial<ILocation>
  ): Promise<IMerchant | null> {
    const updateFields: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(updates)) {
      updateFields[`locations.$.${key}`] = value
    }

    const merchant = await this.model.findOneAndUpdate(
      { _id: merchantId, 'locations._id': locationId },
      { $set: updateFields },
      { new: true }
    ).lean()

    if (merchant) {
      await this.invalidateCache(merchantId)
    }

    return merchant as IMerchant | null
  }

  /**
   * Remove a location
   */
  async removeLocation(merchantId: string, locationId: string): Promise<IMerchant | null> {
    const merchant = await this.updateById(merchantId, {
      $pull: { locations: { _id: locationId } },
    })

    if (merchant) {
      await this.invalidateCache(merchantId)
    }

    return merchant
  }

  /**
   * Update merchant status
   */
  async updateStatus(merchantId: string, status: MerchantStatus): Promise<IMerchant | null> {
    const update: Record<string, unknown> = { status }
    if (status === MerchantStatus.ACTIVE) {
      update.verifiedAt = new Date()
    }

    return this.updateById(merchantId, { $set: update })
  }

  /**
   * Get active merchants with discounts (for employee discovery)
   */
  async getActiveMerchants(options?: {
    categoryId?: string
    city?: string
    limit?: number
    skip?: number
  }): Promise<IMerchant[]> {
    const filter: Record<string, unknown> = {
      status: MerchantStatus.ACTIVE,
      onboardingCompleted: true,
    }

    if (options?.categoryId) {
      filter.categories = new Types.ObjectId(options.categoryId)
    }

    if (options?.city) {
      filter['locations.city'] = { $regex: options.city, $options: 'i' }
    }

    return this.find(filter, {
      limit: options?.limit || 20,
      skip: options?.skip || 0,
      sort: { rating: -1 },
    })
  }

  /**
   * Search merchants
   */
  async search(query: string, options?: { limit?: number; skip?: number }): Promise<IMerchant[]> {
    await this.ensureConnection()

    return Merchant.find({
      status: MerchantStatus.ACTIVE,
      onboardingCompleted: true,
      $or: [
        { businessName: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
    })
      .limit(options?.limit || 20)
      .skip(options?.skip || 0)
      .lean() as unknown as Promise<IMerchant[]>
  }

  /**
   * Get merchant stats
   */
  async getStats(merchantId: string): Promise<{
    totalCoupons: number
    redeemedCoupons: number
    activeDiscounts: number
    avgRating: number
  }> {
    const cacheKey = `${this.cachePrefix}:${merchantId}:stats`

    return cache.getOrSet(
      cacheKey,
      async () => {
        // This would query related collections
        // For now, return placeholder data
        return {
          totalCoupons: 0,
          redeemedCoupons: 0,
          activeDiscounts: 0,
          avgRating: 0,
        }
      },
      300 // 5 min
    )
  }

  /**
   * Generate unique slug
   */
  private async generateUniqueSlug(name: string): Promise<string> {
    let slug = generateSlug(name)
    let counter = 0

    while (await this.exists({ slug })) {
      counter++
      slug = `${generateSlug(name)}-${counter}`
    }

    return slug
  }
}

export const merchantService = new MerchantService()
export default merchantService
