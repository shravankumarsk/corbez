// Event types for the application event bus

export enum EventType {
  // User events
  USER_REGISTERED = 'user.registered',
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  USER_PROFILE_UPDATED = 'user.profile.updated',
  USER_PASSWORD_RESET = 'user.password.reset',
  USER_EMAIL_VERIFIED = 'user.email.verified',

  // Company events
  COMPANY_CREATED = 'company.created',
  COMPANY_UPDATED = 'company.updated',
  EMPLOYEE_INVITED = 'employee.invited',
  EMPLOYEE_JOINED = 'employee.joined',
  EMPLOYEE_REMOVED = 'employee.removed',

  // Merchant events
  MERCHANT_CREATED = 'merchant.created',
  MERCHANT_UPDATED = 'merchant.updated',
  MERCHANT_ONBOARDING_COMPLETED = 'merchant.onboarding.completed',

  // Discount events
  DISCOUNT_CREATED = 'discount.created',
  DISCOUNT_UPDATED = 'discount.updated',
  DISCOUNT_DELETED = 'discount.deleted',

  // Coupon events
  COUPON_CLAIMED = 'coupon.claimed',
  COUPON_REDEEMED = 'coupon.redeemed',
  COUPON_EXPIRED = 'coupon.expired',

  // Referral events
  REFERRAL_SENT = 'referral.sent',
  REFERRAL_COMPLETED = 'referral.completed',

  // Payment events
  PAYMENT_RECEIVED = 'payment.received',
  PAYMENT_FAILED = 'payment.failed',
  SUBSCRIPTION_CREATED = 'subscription.created',
  SUBSCRIPTION_CANCELLED = 'subscription.cancelled',
}

// Base event interface
export interface BaseEvent {
  type: EventType
  timestamp: Date
  correlationId?: string
  userId?: string
  metadata?: Record<string, unknown>
}

// User events
export interface UserRegisteredEvent extends BaseEvent {
  type: EventType.USER_REGISTERED
  payload: {
    userId: string
    email: string
    role: string
    companyId?: string
    merchantId?: string
  }
}

export interface UserLoginEvent extends BaseEvent {
  type: EventType.USER_LOGIN
  payload: {
    userId: string
    email: string
    ipAddress?: string
    userAgent?: string
    success: boolean
    errorMessage?: string
  }
}

export interface UserProfileUpdatedEvent extends BaseEvent {
  type: EventType.USER_PROFILE_UPDATED
  payload: {
    userId: string
    changes: Record<string, unknown>
  }
}

// Company events
export interface CompanyCreatedEvent extends BaseEvent {
  type: EventType.COMPANY_CREATED
  payload: {
    companyId: string
    name: string
    adminId: string
    adminEmail: string
  }
}

export interface CompanyUpdatedEvent extends BaseEvent {
  type: EventType.COMPANY_UPDATED
  payload: {
    companyId: string
    changes: Record<string, unknown>
  }
}

export interface EmployeeInvitedEvent extends BaseEvent {
  type: EventType.EMPLOYEE_INVITED
  payload: {
    companyId: string
    companyName: string
    email: string
    invitedBy: string
  }
}

export interface EmployeeJoinedEvent extends BaseEvent {
  type: EventType.EMPLOYEE_JOINED
  payload: {
    companyId: string
    employeeId: string
    email: string
  }
}

export interface EmployeeRemovedEvent extends BaseEvent {
  type: EventType.EMPLOYEE_REMOVED
  payload: {
    companyId: string
    employeeId: string
    email: string
  }
}

// Merchant events
export interface MerchantCreatedEvent extends BaseEvent {
  type: EventType.MERCHANT_CREATED
  payload: {
    merchantId: string
    businessName: string
    ownerId: string
    ownerEmail: string
  }
}

export interface MerchantUpdatedEvent extends BaseEvent {
  type: EventType.MERCHANT_UPDATED
  payload: {
    merchantId: string
    changes: Record<string, unknown>
  }
}

export interface MerchantOnboardingCompletedEvent extends BaseEvent {
  type: EventType.MERCHANT_ONBOARDING_COMPLETED
  payload: {
    merchantId: string
    businessMetrics: {
      avgOrderValue?: number
      priceTier?: string
      cateringAvailable?: boolean
    }
  }
}

// Discount events
export interface DiscountCreatedEvent extends BaseEvent {
  type: EventType.DISCOUNT_CREATED
  payload: {
    discountId: string
    merchantId: string
    merchantName: string
    percentage: number
    description?: string
  }
}

export interface DiscountUpdatedEvent extends BaseEvent {
  type: EventType.DISCOUNT_UPDATED
  payload: {
    discountId: string
    merchantId: string
    changes: Record<string, unknown>
  }
}

export interface DiscountDeletedEvent extends BaseEvent {
  type: EventType.DISCOUNT_DELETED
  payload: {
    discountId: string
    merchantId: string
  }
}

// Coupon events
export interface CouponClaimedEvent extends BaseEvent {
  type: EventType.COUPON_CLAIMED
  payload: {
    couponId: string
    discountId: string
    employeeId: string
    merchantId: string
    merchantName: string
    discountPercentage: number
  }
}

export interface CouponRedeemedEvent extends BaseEvent {
  type: EventType.COUPON_REDEEMED
  payload: {
    couponId: string
    discountId: string
    employeeId: string
    merchantId: string
    amount?: number
    redeemedAt: Date
  }
}

// Referral events
export interface ReferralSentEvent extends BaseEvent {
  type: EventType.REFERRAL_SENT
  payload: {
    referrerId: string
    referrerEmail: string
    refereeEmail: string
    referralCode: string
    companyId: string
  }
}

export interface ReferralCompletedEvent extends BaseEvent {
  type: EventType.REFERRAL_COMPLETED
  payload: {
    referrerId: string
    refereeId: string
    companyId: string
    referralCode: string
  }
}

// Payment events
export interface PaymentReceivedEvent extends BaseEvent {
  type: EventType.PAYMENT_RECEIVED
  payload: {
    paymentId: string
    companyId: string
    amount: number
    currency: string
    subscriptionId?: string
  }
}

// Union type of all events
export type AppEvent =
  | UserRegisteredEvent
  | UserLoginEvent
  | UserProfileUpdatedEvent
  | CompanyCreatedEvent
  | CompanyUpdatedEvent
  | EmployeeInvitedEvent
  | EmployeeJoinedEvent
  | EmployeeRemovedEvent
  | MerchantCreatedEvent
  | MerchantUpdatedEvent
  | MerchantOnboardingCompletedEvent
  | DiscountCreatedEvent
  | DiscountUpdatedEvent
  | DiscountDeletedEvent
  | CouponClaimedEvent
  | CouponRedeemedEvent
  | ReferralSentEvent
  | ReferralCompletedEvent
  | PaymentReceivedEvent

// Event handler type
export type EventHandler<T extends AppEvent = AppEvent> = (event: T) => Promise<void>
