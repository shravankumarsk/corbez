import { connectDB } from '@/lib/db/mongoose'
import { ClaimedCoupon, CouponStatus, IClaimedCoupon } from '@/lib/db/models/claimed-coupon.model'
import { EmployeePass, PassStatus, PassType, IEmployeePass } from '@/lib/db/models/employee-pass.model'
import { Employee, EmployeeStatus } from '@/lib/db/models/employee.model'
import { Discount, IDiscount } from '@/lib/db/models/discount.model'
import { Merchant } from '@/lib/db/models/merchant.model'
import { qrcodeService } from './qrcode.service'
import { moderationService } from './moderation.service'
import { eventBus, createEvent } from '@/lib/events'
import { cache } from '@/lib/cache/redis'
import { Types } from 'mongoose'

// Helper to get current month in YYYY-MM format
function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export interface ClaimCouponInput {
  employeeId: string
  discountId: string
  merchantId: string
}

export interface CouponWithDetails extends IClaimedCoupon {
  merchant?: {
    businessName: string
    logo?: string
  }
  discount?: {
    name: string
    percentage: number
    monthlyUsageLimit?: number | null
  }
  qrData?: {
    dataUrl: string
    svg: string
    verificationUrl: string
  }
  usageStatus?: {
    usedThisMonth: number
    limit: number | null
    canUseToday: boolean
    resetsOn?: string
  }
}

class CouponService {
  /**
   * Claim a coupon (create a new claimed coupon with QR code)
   */
  async claimCoupon(input: ClaimCouponInput, userId: string): Promise<{
    success: boolean
    coupon?: CouponWithDetails
    error?: string
  }> {
    await connectDB()

    // Check if employee can access features
    const access = await moderationService.canAccessFeatures(input.employeeId)
    if (!access.canAccess) {
      return { success: false, error: access.reason }
    }

    // Get employee
    const employee = await Employee.findById(input.employeeId)
    if (!employee) {
      return { success: false, error: 'Employee not found' }
    }

    // Get discount
    const discount = await Discount.findById(input.discountId)
    if (!discount || !discount.isActive) {
      return { success: false, error: 'Discount not available' }
    }

    // Get merchant
    const merchant = await Merchant.findById(input.merchantId)
    if (!merchant || merchant.status !== 'ACTIVE') {
      return { success: false, error: 'Merchant not available' }
    }

    // Check if already has active coupon for this merchant
    const existingCoupon = await ClaimedCoupon.findOne({
      employeeId: input.employeeId,
      merchantId: input.merchantId,
      status: CouponStatus.ACTIVE,
    })

    if (existingCoupon) {
      return { success: false, error: 'You already have an active coupon for this restaurant' }
    }

    // Generate QR code (no default expiry - coupons are reusable)
    const couponId = new Types.ObjectId()
    const qrResult = await qrcodeService.createCouponQR({
      couponId: couponId.toString(),
      employeeId: input.employeeId,
      merchantId: input.merchantId,
      discountId: input.discountId,
      expiresAt: null, // No expiry
    })

    // Create coupon with usage tracking
    const currentMonth = getCurrentMonth()
    const coupon = await ClaimedCoupon.create({
      _id: couponId,
      employeeId: new Types.ObjectId(input.employeeId),
      dealId: new Types.ObjectId(input.discountId),
      merchantId: new Types.ObjectId(input.merchantId),
      uniqueCode: qrResult.code,
      qrCodeUrl: qrResult.qrDataUrl,
      expiresAt: null, // No expiry by default
      status: CouponStatus.ACTIVE,
      usageHistory: [],
      usageThisMonth: 0,
      lastResetMonth: currentMonth,
    })

    // Emit event
    eventBus.emitAsync(
      createEvent.couponClaimed({
        couponId: coupon._id.toString(),
        discountId: input.discountId,
        employeeId: input.employeeId,
        merchantId: input.merchantId,
        merchantName: merchant.businessName,
        discountPercentage: discount.percentage,
      })
    )

    return {
      success: true,
      coupon: {
        ...coupon.toObject(),
        merchant: {
          businessName: merchant.businessName,
          logo: merchant.logo,
        },
        discount: {
          name: discount.name,
          percentage: discount.percentage,
        },
        qrData: {
          dataUrl: qrResult.qrDataUrl,
          svg: qrResult.qrSvg,
          verificationUrl: qrResult.verificationUrl,
        },
      } as CouponWithDetails,
    }
  }

  /**
   * Get employee's active coupons with usage status
   */
  async getEmployeeCoupons(employeeId: string): Promise<CouponWithDetails[]> {
    await connectDB()

    // Check access
    const access = await moderationService.canAccessFeatures(employeeId)
    if (!access.canAccess) {
      return []
    }

    const currentMonth = getCurrentMonth()

    // Get active coupons (no expiry check since most have null expiresAt)
    const coupons = await ClaimedCoupon.find({
      employeeId: new Types.ObjectId(employeeId),
      status: CouponStatus.ACTIVE,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } },
      ],
    })
      .populate('merchantId', 'businessName logo')
      .populate('dealId', 'name percentage monthlyUsageLimit')
      .sort({ claimedAt: -1 })
      .lean()

    // Add QR data and usage status to each coupon
    const couponsWithDetails = coupons.map((coupon) => {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://corbez.com'
      const verificationUrl = `${baseUrl}/verify/coupon/${coupon.uniqueCode}`
      const discount = coupon.dealId as unknown as { name: string; percentage: number; monthlyUsageLimit?: number | null }

      // Calculate usage status
      const usedThisMonth = coupon.lastResetMonth === currentMonth ? (coupon.usageThisMonth || 0) : 0
      const limit = discount?.monthlyUsageLimit || null
      const canUseToday = limit === null || usedThisMonth < limit

      // Calculate when limit resets
      let resetsOn: string | undefined
      if (limit !== null && !canUseToday) {
        const now = new Date()
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        resetsOn = nextMonth.toLocaleDateString()
      }

      return {
        ...coupon,
        merchant: coupon.merchantId as unknown as { businessName: string; logo?: string },
        discount,
        qrData: {
          dataUrl: coupon.qrCodeUrl || '',
          svg: '',
          verificationUrl,
        },
        usageStatus: {
          usedThisMonth,
          limit,
          canUseToday,
          resetsOn,
        },
      } as unknown as CouponWithDetails
    })

    return couponsWithDetails
  }

  /**
   * Get a single coupon by code
   */
  async getCouponByCode(code: string): Promise<CouponWithDetails | null> {
    await connectDB()

    const coupon = await ClaimedCoupon.findOne({ uniqueCode: code })
      .populate('merchantId', 'businessName logo locations')
      .populate('dealId', 'name percentage')
      .populate('employeeId', 'firstName lastName')
      .lean() as (IClaimedCoupon & { qrCodeUrl?: string }) | null

    if (!coupon) return null

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://corbez.com'

    return {
      ...coupon,
      merchant: coupon.merchantId as unknown as { businessName: string; logo?: string },
      discount: coupon.dealId as unknown as { name: string; percentage: number },
      qrData: {
        dataUrl: coupon.qrCodeUrl || '',
        svg: '',
        verificationUrl: `${baseUrl}/verify/coupon/${coupon.uniqueCode}`,
      },
    } as unknown as CouponWithDetails
  }

  /**
   * Redeem a coupon (track usage, keep coupon active for reuse)
   */
  async redeemCoupon(
    code: string,
    merchantId: string,
    notes?: string
  ): Promise<{
    success: boolean
    error?: string
    usageRemaining?: number | null
    appliedBonus?: number
    totalDiscount?: number
  }> {
    await connectDB()

    const coupon = await ClaimedCoupon.findOne({ uniqueCode: code })
      .populate('dealId', 'monthlyUsageLimit percentage firstTimeUserBonusPercentage')

    if (!coupon) {
      return { success: false, error: 'Coupon not found' }
    }

    if (coupon.merchantId.toString() !== merchantId) {
      return { success: false, error: 'This coupon is not for your restaurant' }
    }

    if (coupon.status !== CouponStatus.ACTIVE) {
      return { success: false, error: `Coupon is ${coupon.status.toLowerCase()}` }
    }

    // Check expiry (if set)
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      coupon.status = CouponStatus.EXPIRED
      await coupon.save()
      return { success: false, error: 'Coupon has expired' }
    }

    // Check employee status
    const access = await moderationService.canAccessFeatures(coupon.employeeId.toString())
    if (!access.canAccess) {
      return { success: false, error: 'Employee account is not active' }
    }

    // Get discount for monthly limit check
    const discount = coupon.dealId as unknown as IDiscount
    const monthlyLimit = discount?.monthlyUsageLimit
    const baseDiscountPercentage = discount?.percentage || 0
    const firstTimeBonusPercentage = discount?.firstTimeUserBonusPercentage || 0

    // Check if this is user's FIRST EVER redemption (any restaurant)
    const isFirstTimeUser = await ClaimedCoupon.countDocuments({
      employeeId: coupon.employeeId,
      status: CouponStatus.ACTIVE,
      usageHistory: { $exists: true, $not: { $size: 0 } },
    }) === 0

    // Calculate total discount (base + first-time bonus if applicable)
    let totalDiscountPercentage = baseDiscountPercentage
    let appliedBonusPercentage = 0

    if (isFirstTimeUser && firstTimeBonusPercentage > 0) {
      appliedBonusPercentage = firstTimeBonusPercentage
      totalDiscountPercentage = Math.min(baseDiscountPercentage + firstTimeBonusPercentage, 100)
    }

    // Reset monthly counter if month changed
    const currentMonth = getCurrentMonth()
    if (coupon.lastResetMonth !== currentMonth) {
      coupon.usageThisMonth = 0
      coupon.lastResetMonth = currentMonth
    }

    // Check monthly limit
    if (monthlyLimit !== null && monthlyLimit !== undefined && coupon.usageThisMonth >= monthlyLimit) {
      return {
        success: false,
        error: `Monthly limit reached (${monthlyLimit} uses). Resets next month.`,
        usageRemaining: 0,
      }
    }

    // Track usage (keep coupon ACTIVE for reuse)
    const now = new Date()
    coupon.usageHistory = coupon.usageHistory || []
    coupon.usageHistory.push({
      redeemedAt: now,
      month: currentMonth,
      notes: notes || undefined,
    })
    coupon.usageThisMonth = (coupon.usageThisMonth || 0) + 1
    coupon.redeemedAt = now // Track last redemption
    coupon.redemptionNotes = notes
    await coupon.save()

    // Calculate remaining uses
    const usageRemaining = monthlyLimit !== null && monthlyLimit !== undefined
      ? monthlyLimit - coupon.usageThisMonth
      : null

    // Emit event
    eventBus.emitAsync(
      createEvent.couponRedeemed({
        couponId: coupon._id.toString(),
        discountId: coupon.dealId.toString(),
        employeeId: coupon.employeeId.toString(),
        merchantId,
        redeemedAt: now,
      })
    )

    // Award referral credits on first redemption
    try {
      // Check if this is the user's first redemption
      const totalRedemptions = await ClaimedCoupon.countDocuments({
        employeeId: coupon.employeeId,
        status: CouponStatus.ACTIVE,
        usageHistory: { $exists: true, $not: { $size: 0 } },
      })

      // If this is their first redemption
      if (totalRedemptions === 1) {
        const { User } = await import('@/lib/db/models/user.model')
        const employee = await Employee.findById(coupon.employeeId)

        if (employee) {
          const user = await User.findById(employee.userId)

          // If user was referred by someone, award credit to referrer
          if (user?.referredBy) {
            const referrer = await User.findOne({ referralCode: user.referredBy })

            if (referrer) {
              // Award 100 Corbez Points (not real money - just gamification points)
              referrer.accountCredits = (referrer.accountCredits || 0) + 100
              await referrer.save()

              // Emit referral points earned event
              eventBus.emitAsync(
                createEvent.custom({
                  type: 'REFERRAL_POINTS_EARNED',
                  payload: {
                    referrerId: referrer._id.toString(),
                    referredUserId: user._id.toString(),
                    pointsEarned: 100,
                    earnedAt: new Date(),
                  },
                })
              )
            }
          }

          // Update onboarding progress - first discount used
          if (user && !user.onboardingProgress?.firstDiscountUsed) {
            if (!user.onboardingProgress) {
              user.onboardingProgress = {
                emailVerified: false,
                companyLinked: false,
                firstDiscountClaimed: false,
                firstDiscountUsed: false,
                walletPassAdded: false,
                firstReferralSent: false,
              }
            }
            user.onboardingProgress.firstDiscountUsed = true
            await user.save()
          }
        }
      }
    } catch (error) {
      // Don't fail redemption if credit award fails
      console.error('Failed to award referral credit:', error)
    }

    // Invalidate cache
    await cache.del(`coupon:code:${code}`)

    return {
      success: true,
      usageRemaining,
      appliedBonus: appliedBonusPercentage,
      totalDiscount: totalDiscountPercentage,
    }
  }

  /**
   * Check if employee has active coupon for a merchant
   */
  async hasActiveCouponForMerchant(employeeId: string, merchantId: string): Promise<boolean> {
    await connectDB()

    const coupon = await ClaimedCoupon.findOne({
      employeeId: new Types.ObjectId(employeeId),
      merchantId: new Types.ObjectId(merchantId),
      status: CouponStatus.ACTIVE,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } },
      ],
    })

    return !!coupon
  }

  /**
   * Get employee's claimed merchant IDs (for filtering in explore page)
   */
  async getClaimedMerchantIds(employeeId: string): Promise<string[]> {
    await connectDB()

    const coupons = await ClaimedCoupon.find({
      employeeId: new Types.ObjectId(employeeId),
      status: CouponStatus.ACTIVE,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } },
      ],
    }).select('merchantId').lean()

    return coupons.map(c => c.merchantId.toString())
  }

  // ==================== EMPLOYEE PASS ====================

  /**
   * Get or create employee pass
   */
  async getOrCreateEmployeePass(
    userId: string,
    employeeId: string,
    companyId: string
  ): Promise<IEmployeePass | null> {
    await connectDB()

    // Check access
    const access = await moderationService.canAccessFeatures(employeeId)
    if (!access.canAccess) {
      return null
    }

    // Check for existing active pass
    let pass = await EmployeePass.findOne({
      employeeId: new Types.ObjectId(employeeId),
      passType: PassType.EMPLOYEE_CARD,
      status: PassStatus.ACTIVE,
    })

    if (pass) {
      return pass
    }

    // Create new pass
    const passId = `PASS-${Date.now().toString(36).toUpperCase()}`

    const qrResult = await qrcodeService.createEmployeePassQR({
      passId,
      userId,
      employeeId,
      companyId,
    })

    pass = await EmployeePass.create({
      userId: new Types.ObjectId(userId),
      employeeId: new Types.ObjectId(employeeId),
      companyId: new Types.ObjectId(companyId),
      passType: PassType.EMPLOYEE_CARD,
      passId,
      qrCodeDataUrl: qrResult.qrDataUrl,
      qrCodeSvg: qrResult.qrSvg,
      verificationUrl: qrResult.verificationUrl,
      signature: qrResult.data.signature,
      status: PassStatus.ACTIVE,
    })

    // Update onboarding progress - wallet pass added
    try {
      const { User } = await import('@/lib/db/models/user.model')
      const user = await User.findById(userId)

      if (user && !user.onboardingProgress?.walletPassAdded) {
        if (!user.onboardingProgress) {
          user.onboardingProgress = {
            emailVerified: false,
            companyLinked: false,
            firstDiscountClaimed: false,
            firstDiscountUsed: false,
            walletPassAdded: false,
            firstReferralSent: false,
          }
        }
        user.onboardingProgress.walletPassAdded = true
        await user.save()
      }
    } catch (progressError) {
      console.error('Failed to update onboarding progress:', progressError)
      // Don't fail pass creation if progress update fails
    }

    return pass
  }

  /**
   * Revoke employee pass (when suspended/banned)
   */
  async revokeEmployeePass(employeeId: string): Promise<void> {
    await connectDB()

    await EmployeePass.updateMany(
      { employeeId: new Types.ObjectId(employeeId), status: PassStatus.ACTIVE },
      { $set: { status: PassStatus.REVOKED } }
    )
  }

  /**
   * Verify employee pass
   */
  async verifyEmployeePass(passId: string, signature: string): Promise<{
    valid: boolean
    employee?: {
      firstName: string
      lastName: string
      company: string
      status: string
    }
    error?: string
  }> {
    await connectDB()

    const pass = await EmployeePass.findOne({ passId })
      .populate('employeeId', 'firstName lastName status')
      .populate('companyId', 'name')

    if (!pass) {
      return { valid: false, error: 'Pass not found' }
    }

    if (pass.status !== PassStatus.ACTIVE) {
      return { valid: false, error: 'Pass is no longer active' }
    }

    if (pass.signature !== signature) {
      return { valid: false, error: 'Invalid signature' }
    }

    const employee = pass.employeeId as unknown as {
      firstName: string
      lastName: string
      status: EmployeeStatus
    }
    const company = pass.companyId as unknown as { name: string }

    // Check employee status
    if (employee.status !== EmployeeStatus.ACTIVE) {
      return { valid: false, error: 'Employee account is not active' }
    }

    // Update usage
    pass.lastUsedAt = new Date()
    pass.usageCount += 1
    await pass.save()

    return {
      valid: true,
      employee: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        company: company.name,
        status: employee.status,
      },
    }
  }

  /**
   * Regenerate QR code for a coupon
   */
  async regenerateCouponQR(couponId: string): Promise<{
    success: boolean
    qrData?: { dataUrl: string; svg: string; verificationUrl: string }
    error?: string
  }> {
    await connectDB()

    const coupon = await ClaimedCoupon.findById(couponId)
    if (!coupon) {
      return { success: false, error: 'Coupon not found' }
    }

    if (coupon.status !== CouponStatus.ACTIVE) {
      return { success: false, error: 'Coupon is not active' }
    }

    const qrResult = await qrcodeService.createCouponQR({
      couponId: coupon._id.toString(),
      employeeId: coupon.employeeId.toString(),
      merchantId: coupon.merchantId.toString(),
      discountId: coupon.dealId.toString(),
      expiresAt: coupon.expiresAt,
    })

    coupon.uniqueCode = qrResult.code
    coupon.qrCodeUrl = qrResult.qrDataUrl
    await coupon.save()

    return {
      success: true,
      qrData: {
        dataUrl: qrResult.qrDataUrl,
        svg: qrResult.qrSvg,
        verificationUrl: qrResult.verificationUrl,
      },
    }
  }
}

export const couponService = new CouponService()
export default couponService
