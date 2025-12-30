import { EventType, AppEvent } from '../types'
import { eventBus } from '../emitter'
import { cache, cacheKeys } from '@/lib/cache/redis'

/**
 * Analytics metrics to track
 */
interface AnalyticsMetric {
  name: string
  value: number
  tags: Record<string, string>
}

/**
 * Track metric (stub - implement with actual analytics service)
 */
async function trackMetric(metric: AnalyticsMetric): Promise<void> {
  // TODO: Implement with actual analytics (Mixpanel, Amplitude, PostHog, etc.)
  console.log('[Analytics] Metric:', metric)
}

/**
 * Increment counter in cache for real-time stats
 */
async function incrementCounter(key: string, ttlSeconds = 86400): Promise<void> {
  await cache.incr(key, ttlSeconds)
}

/**
 * Handle analytics events
 */
async function handleAnalyticsEvent(event: AppEvent): Promise<void> {
  const today = new Date().toISOString().split('T')[0]

  switch (event.type) {
    case EventType.USER_REGISTERED: {
      await trackMetric({
        name: 'user.registered',
        value: 1,
        tags: { role: event.payload.role },
      })
      await incrementCounter(`stats:registrations:${today}`)
      await incrementCounter(`stats:registrations:${event.payload.role}:${today}`)
      break
    }

    case EventType.USER_LOGIN: {
      if (event.payload.success) {
        await trackMetric({
          name: 'user.login.success',
          value: 1,
          tags: {},
        })
        await incrementCounter(`stats:logins:${today}`)
      } else {
        await trackMetric({
          name: 'user.login.failed',
          value: 1,
          tags: {},
        })
        await incrementCounter(`stats:logins:failed:${today}`)
      }
      break
    }

    case EventType.COMPANY_CREATED: {
      await trackMetric({
        name: 'company.created',
        value: 1,
        tags: {},
      })
      await incrementCounter(`stats:companies:${today}`)
      break
    }

    case EventType.MERCHANT_CREATED: {
      await trackMetric({
        name: 'merchant.created',
        value: 1,
        tags: {},
      })
      await incrementCounter(`stats:merchants:${today}`)
      break
    }

    case EventType.DISCOUNT_CREATED: {
      await trackMetric({
        name: 'discount.created',
        value: 1,
        tags: { merchantId: event.payload.merchantId },
      })
      await incrementCounter(`stats:discounts:${today}`)
      break
    }

    case EventType.COUPON_CLAIMED: {
      await trackMetric({
        name: 'coupon.claimed',
        value: 1,
        tags: {
          merchantId: event.payload.merchantId,
          discountPercentage: String(event.payload.discountPercentage),
        },
      })
      await incrementCounter(`stats:coupons:claimed:${today}`)
      await incrementCounter(`stats:merchant:${event.payload.merchantId}:coupons:${today}`)
      break
    }

    case EventType.COUPON_REDEEMED: {
      await trackMetric({
        name: 'coupon.redeemed',
        value: 1,
        tags: { merchantId: event.payload.merchantId },
      })
      await incrementCounter(`stats:coupons:redeemed:${today}`)
      await incrementCounter(`stats:merchant:${event.payload.merchantId}:redemptions:${today}`)

      // Track savings if amount provided
      if (event.payload.amount) {
        await trackMetric({
          name: 'savings.amount',
          value: event.payload.amount,
          tags: { merchantId: event.payload.merchantId },
        })
      }
      break
    }

    case EventType.REFERRAL_COMPLETED: {
      await trackMetric({
        name: 'referral.completed',
        value: 1,
        tags: { companyId: event.payload.companyId },
      })
      await incrementCounter(`stats:referrals:completed:${today}`)
      await incrementCounter(`stats:company:${event.payload.companyId}:referrals:${today}`)
      break
    }

    case EventType.PAYMENT_RECEIVED: {
      await trackMetric({
        name: 'revenue',
        value: event.payload.amount,
        tags: {
          currency: event.payload.currency,
          companyId: event.payload.companyId,
        },
      })
      await incrementCounter(`stats:revenue:${today}`)
      break
    }
  }
}

/**
 * Cache invalidation handler - clear relevant caches when data changes
 */
async function handleCacheInvalidation(event: AppEvent): Promise<void> {
  switch (event.type) {
    case EventType.USER_PROFILE_UPDATED:
      await cache.del(cacheKeys.user(event.payload.userId))
      await cache.del(cacheKeys.userProfile(event.payload.userId))
      break

    case EventType.COMPANY_UPDATED:
      if ('companyId' in event.payload) {
        const companyId = event.payload.companyId as string
        await cache.invalidate(`company:${companyId}:*`)
      }
      break

    case EventType.MERCHANT_UPDATED:
    case EventType.MERCHANT_ONBOARDING_COMPLETED:
      if ('merchantId' in event.payload) {
        const merchantId = event.payload.merchantId as string
        await cache.invalidate(`merchant:${merchantId}:*`)
      }
      break

    case EventType.DISCOUNT_CREATED:
    case EventType.DISCOUNT_UPDATED:
    case EventType.DISCOUNT_DELETED:
      await cache.invalidate(`discounts:${event.payload.merchantId}:*`)
      await cache.invalidate(`merchant:${event.payload.merchantId}:discounts`)
      break

    case EventType.EMPLOYEE_JOINED:
    case EventType.EMPLOYEE_REMOVED:
      if ('companyId' in event.payload) {
        const companyId = event.payload.companyId as string
        await cache.del(cacheKeys.companyEmployees(companyId))
        await cache.del(cacheKeys.companyStats(companyId))
      }
      break
  }
}

/**
 * Register analytics handlers
 */
export function registerAnalyticsHandlers(): void {
  const analyticsEvents = [
    EventType.USER_REGISTERED,
    EventType.USER_LOGIN,
    EventType.COMPANY_CREATED,
    EventType.MERCHANT_CREATED,
    EventType.DISCOUNT_CREATED,
    EventType.COUPON_CLAIMED,
    EventType.COUPON_REDEEMED,
    EventType.REFERRAL_COMPLETED,
    EventType.PAYMENT_RECEIVED,
  ]

  const cacheInvalidationEvents = [
    EventType.USER_PROFILE_UPDATED,
    EventType.COMPANY_UPDATED,
    EventType.MERCHANT_UPDATED,
    EventType.MERCHANT_ONBOARDING_COMPLETED,
    EventType.DISCOUNT_CREATED,
    EventType.DISCOUNT_UPDATED,
    EventType.DISCOUNT_DELETED,
    EventType.EMPLOYEE_JOINED,
    EventType.EMPLOYEE_REMOVED,
  ]

  eventBus.onMany(analyticsEvents, handleAnalyticsEvent)
  eventBus.onMany(cacheInvalidationEvents, handleCacheInvalidation)

  console.log('[Events] Analytics handlers registered')
}

export default registerAnalyticsHandlers
