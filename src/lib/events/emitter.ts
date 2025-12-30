import { EventType, AppEvent, EventHandler } from './types'
import { v4 as uuidv4 } from 'uuid'

type HandlerMap = Map<EventType, Set<EventHandler>>

class EventBus {
  private handlers: HandlerMap = new Map()
  private middlewares: Array<(event: AppEvent) => Promise<AppEvent | null>> = []

  /**
   * Subscribe to an event type
   */
  on<T extends AppEvent>(eventType: T['type'], handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set())
    }
    this.handlers.get(eventType)!.add(handler as EventHandler)

    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler as EventHandler)
    }
  }

  /**
   * Subscribe to multiple event types
   */
  onMany(eventTypes: EventType[], handler: EventHandler): () => void {
    const unsubscribers = eventTypes.map((type) => this.on(type as AppEvent['type'], handler))
    return () => unsubscribers.forEach((unsub) => unsub())
  }

  /**
   * Add middleware that runs before handlers
   * Middleware can transform events or return null to stop propagation
   */
  use(middleware: (event: AppEvent) => Promise<AppEvent | null>): void {
    this.middlewares.push(middleware)
  }

  /**
   * Emit an event to all subscribers
   */
  async emit<T extends AppEvent>(event: Omit<T, 'timestamp' | 'correlationId'> & { correlationId?: string }): Promise<void> {
    const fullEvent: AppEvent = {
      ...event,
      timestamp: new Date(),
      correlationId: event.correlationId || uuidv4(),
    } as AppEvent

    // Run through middlewares
    let processedEvent: AppEvent | null = fullEvent
    for (const middleware of this.middlewares) {
      if (!processedEvent) break
      processedEvent = await middleware(processedEvent)
    }

    if (!processedEvent) return

    const handlers = this.handlers.get(processedEvent.type)
    if (!handlers || handlers.size === 0) return

    // Execute all handlers concurrently
    const promises = Array.from(handlers).map(async (handler) => {
      try {
        await handler(processedEvent!)
      } catch (error) {
        console.error(`[EventBus] Handler error for ${processedEvent!.type}:`, error)
      }
    })

    await Promise.allSettled(promises)
  }

  /**
   * Emit event without waiting for handlers (fire and forget)
   */
  emitAsync<T extends AppEvent>(event: Omit<T, 'timestamp' | 'correlationId'> & { correlationId?: string }): void {
    this.emit(event).catch((error) => {
      console.error('[EventBus] Async emit error:', error)
    })
  }

  /**
   * Remove all handlers for an event type
   */
  off(eventType: EventType): void {
    this.handlers.delete(eventType)
  }

  /**
   * Remove all handlers
   */
  clear(): void {
    this.handlers.clear()
  }

  /**
   * Get count of handlers for an event type
   */
  listenerCount(eventType: EventType): number {
    return this.handlers.get(eventType)?.size || 0
  }
}

// Singleton instance
export const eventBus = new EventBus()

// Helper to create typed events
export const createEvent = {
  userRegistered: (payload: {
    userId: string
    email: string
    role: string
    companyId?: string
    merchantId?: string
  }) => ({
    type: EventType.USER_REGISTERED as const,
    payload,
  }),

  userLogin: (payload: {
    userId: string
    email: string
    ipAddress?: string
    userAgent?: string
    success: boolean
    errorMessage?: string
  }) => ({
    type: EventType.USER_LOGIN as const,
    payload,
  }),

  userProfileUpdated: (payload: {
    userId: string
    changes: Record<string, unknown>
  }) => ({
    type: EventType.USER_PROFILE_UPDATED as const,
    payload,
  }),

  companyCreated: (payload: {
    companyId: string
    name: string
    adminId: string
    adminEmail: string
  }) => ({
    type: EventType.COMPANY_CREATED as const,
    payload,
  }),

  employeeInvited: (payload: {
    companyId: string
    companyName: string
    email: string
    invitedBy: string
  }) => ({
    type: EventType.EMPLOYEE_INVITED as const,
    payload,
  }),

  employeeJoined: (payload: {
    companyId: string
    employeeId: string
    email: string
  }) => ({
    type: EventType.EMPLOYEE_JOINED as const,
    payload,
  }),

  merchantCreated: (payload: {
    merchantId: string
    businessName: string
    ownerId: string
    ownerEmail: string
  }) => ({
    type: EventType.MERCHANT_CREATED as const,
    payload,
  }),

  merchantOnboardingCompleted: (payload: {
    merchantId: string
    businessMetrics: {
      avgOrderValue?: number
      priceTier?: string
      cateringAvailable?: boolean
    }
  }) => ({
    type: EventType.MERCHANT_ONBOARDING_COMPLETED as const,
    payload,
  }),

  discountCreated: (payload: {
    discountId: string
    merchantId: string
    merchantName: string
    percentage: number
    description?: string
  }) => ({
    type: EventType.DISCOUNT_CREATED as const,
    payload,
  }),

  discountUpdated: (payload: {
    discountId: string
    merchantId: string
    changes: Record<string, unknown>
  }) => ({
    type: EventType.DISCOUNT_UPDATED as const,
    payload,
  }),

  couponClaimed: (payload: {
    couponId: string
    discountId: string
    employeeId: string
    merchantId: string
    merchantName: string
    discountPercentage: number
  }) => ({
    type: EventType.COUPON_CLAIMED as const,
    payload,
  }),

  couponRedeemed: (payload: {
    couponId: string
    discountId: string
    employeeId: string
    merchantId: string
    amount?: number
    redeemedAt: Date
  }) => ({
    type: EventType.COUPON_REDEEMED as const,
    payload,
  }),

  referralSent: (payload: {
    referrerId: string
    referrerEmail: string
    refereeEmail: string
    referralCode: string
    companyId: string
  }) => ({
    type: EventType.REFERRAL_SENT as const,
    payload,
  }),

  referralCompleted: (payload: {
    referrerId: string
    refereeId: string
    companyId: string
    referralCode: string
  }) => ({
    type: EventType.REFERRAL_COMPLETED as const,
    payload,
  }),

  paymentReceived: (payload: {
    paymentId: string
    companyId: string
    amount: number
    currency: string
    subscriptionId?: string
  }) => ({
    type: EventType.PAYMENT_RECEIVED as const,
    payload,
  }),
}

export default eventBus
