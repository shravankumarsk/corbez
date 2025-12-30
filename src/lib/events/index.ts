// Event system exports
export { eventBus, createEvent } from './emitter'
export { EventType } from './types'
export type {
  AppEvent,
  BaseEvent,
  EventHandler,
  UserRegisteredEvent,
  UserLoginEvent,
  UserProfileUpdatedEvent,
  CompanyCreatedEvent,
  EmployeeInvitedEvent,
  EmployeeJoinedEvent,
  MerchantCreatedEvent,
  MerchantOnboardingCompletedEvent,
  DiscountCreatedEvent,
  DiscountUpdatedEvent,
  CouponClaimedEvent,
  CouponRedeemedEvent,
  ReferralSentEvent,
  ReferralCompletedEvent,
  PaymentReceivedEvent,
} from './types'

export { initializeEventHandlers } from './handlers'
