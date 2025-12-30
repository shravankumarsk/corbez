import { Job } from 'bullmq'
import { JobType, JobPayloads } from '../queue'
import { connectDB } from '@/lib/db/mongoose'
import { cache } from '@/lib/cache/redis'

/**
 * Process analytics jobs
 */
export async function processAnalyticsJob(job: Job): Promise<void> {
  await connectDB()

  switch (job.name) {
    case JobType.GENERATE_DAILY_REPORT:
      await generateDailyReport(job.data as JobPayloads[JobType.GENERATE_DAILY_REPORT])
      break

    case JobType.SYNC_ANALYTICS:
      await syncAnalytics(job.data as JobPayloads[JobType.SYNC_ANALYTICS])
      break

    case JobType.UPDATE_MERCHANT_STATS:
      await updateMerchantStats(job.data as JobPayloads[JobType.UPDATE_MERCHANT_STATS])
      break

    case JobType.GENERATE_SAVINGS_REPORT:
      await generateSavingsReport(job.data as JobPayloads[JobType.GENERATE_SAVINGS_REPORT])
      break

    default:
      console.warn(`[Analytics Worker] Unknown job type: ${job.name}`)
  }
}

/**
 * Generate daily analytics report
 */
async function generateDailyReport(data: { date: string }): Promise<void> {
  console.log(`[Analytics Worker] Generating daily report for ${data.date}`)

  const { User } = await import('@/lib/db/models/user.model')
  const { ClaimedCoupon: Coupon } = await import('@/lib/db/models/claimed-coupon.model')

  const dateStart = new Date(data.date)
  dateStart.setHours(0, 0, 0, 0)
  const dateEnd = new Date(data.date)
  dateEnd.setHours(23, 59, 59, 999)

  // Gather metrics
  const [newUsers, couponsCreated, couponsRedeemed] = await Promise.all([
    User.countDocuments({
      createdAt: { $gte: dateStart, $lte: dateEnd },
    }),
    Coupon.countDocuments({
      createdAt: { $gte: dateStart, $lte: dateEnd },
    }),
    Coupon.countDocuments({
      status: 'REDEEMED',
      redeemedAt: { $gte: dateStart, $lte: dateEnd },
    }),
  ])

  const report = {
    date: data.date,
    newUsers,
    couponsCreated,
    couponsRedeemed,
    generatedAt: new Date(),
  }

  // Cache the report for quick access
  await cache.set(`report:daily:${data.date}`, report, 86400 * 7) // 7 days

  console.log('[Analytics Worker] Daily report generated:', report)
}

/**
 * Sync analytics to external service
 */
async function syncAnalytics(data: { startDate: string; endDate: string }): Promise<void> {
  console.log(`[Analytics Worker] Syncing analytics from ${data.startDate} to ${data.endDate}`)

  // TODO: Implement sync to external analytics service
  // Example: Send aggregated data to Mixpanel, Amplitude, etc.

  console.log('[Analytics Worker] Analytics sync complete')
}

/**
 * Update merchant statistics
 */
async function updateMerchantStats(data: { merchantId: string }): Promise<void> {
  console.log(`[Analytics Worker] Updating stats for merchant ${data.merchantId}`)

  const { ClaimedCoupon: Coupon } = await import('@/lib/db/models/claimed-coupon.model')
  const { Discount } = await import('@/lib/db/models/discount.model')
  const { Merchant } = await import('@/lib/db/models/merchant.model')

  const [totalCoupons, redeemedCoupons, activeDiscounts] = await Promise.all([
    Coupon.countDocuments({ merchantId: data.merchantId }),
    Coupon.countDocuments({ merchantId: data.merchantId, status: 'REDEEMED' }),
    Discount.countDocuments({ merchantId: data.merchantId, isActive: true }),
  ])

  // Calculate redemption rate
  const redemptionRate = totalCoupons > 0 ? (redeemedCoupons / totalCoupons) * 100 : 0

  const stats = {
    totalCoupons,
    redeemedCoupons,
    activeDiscounts,
    redemptionRate: Math.round(redemptionRate * 100) / 100,
    updatedAt: new Date(),
  }

  // Update merchant record
  await Merchant.findByIdAndUpdate(data.merchantId, {
    $set: { stats },
  })

  // Cache stats
  await cache.set(`merchant:${data.merchantId}:stats`, stats, 3600) // 1 hour

  console.log('[Analytics Worker] Merchant stats updated:', stats)
}

/**
 * Generate savings report for a company
 */
async function generateSavingsReport(data: { companyId: string; month: string }): Promise<void> {
  console.log(`[Analytics Worker] Generating savings report for company ${data.companyId} - ${data.month}`)

  const { ClaimedCoupon: Coupon } = await import('@/lib/db/models/claimed-coupon.model')
  const { User } = await import('@/lib/db/models/user.model')

  // Parse month (format: YYYY-MM)
  const [year, month] = data.month.split('-').map(Number)
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  // Get employees in company
  const employees = await User.find({ companyId: data.companyId }).select('_id')
  const employeeIds = employees.map((e) => e._id)

  // Get redeemed coupons for these employees
  const coupons = await Coupon.aggregate([
    {
      $match: {
        userId: { $in: employeeIds },
        status: 'REDEEMED',
        redeemedAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$merchantId',
        count: { $sum: 1 },
        totalSaved: { $sum: '$savedAmount' },
      },
    },
  ])

  const report = {
    companyId: data.companyId,
    month: data.month,
    totalRedemptions: coupons.reduce((sum, c) => sum + c.count, 0),
    totalSavings: coupons.reduce((sum, c) => sum + (c.totalSaved || 0), 0),
    merchantBreakdown: coupons,
    generatedAt: new Date(),
  }

  // Cache the report
  await cache.set(`report:savings:${data.companyId}:${data.month}`, report, 86400 * 30) // 30 days

  console.log('[Analytics Worker] Savings report generated:', report)
}
