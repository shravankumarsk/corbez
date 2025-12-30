import { EventType, AppEvent } from '../types'
import { eventBus } from '../emitter'
import { audit, AuditAction } from '@/lib/audit/logger'

/**
 * Maps event types to audit actions
 */
const eventToAuditAction: Partial<Record<EventType, AuditAction>> = {
  [EventType.USER_REGISTERED]: AuditAction.REGISTER,
  [EventType.USER_LOGIN]: AuditAction.LOGIN,
  [EventType.USER_LOGOUT]: AuditAction.LOGOUT,
  [EventType.USER_PROFILE_UPDATED]: AuditAction.PROFILE_UPDATED,
  [EventType.USER_PASSWORD_RESET]: AuditAction.PASSWORD_RESET,
  [EventType.USER_EMAIL_VERIFIED]: AuditAction.EMAIL_VERIFIED,
  [EventType.COMPANY_CREATED]: AuditAction.COMPANY_CREATED,
  [EventType.COMPANY_UPDATED]: AuditAction.COMPANY_UPDATED,
  [EventType.EMPLOYEE_INVITED]: AuditAction.EMPLOYEE_INVITED,
  [EventType.EMPLOYEE_REMOVED]: AuditAction.EMPLOYEE_REMOVED,
  [EventType.MERCHANT_CREATED]: AuditAction.MERCHANT_CREATED,
  [EventType.MERCHANT_UPDATED]: AuditAction.MERCHANT_UPDATED,
  [EventType.DISCOUNT_CREATED]: AuditAction.DISCOUNT_CREATED,
  [EventType.DISCOUNT_UPDATED]: AuditAction.DISCOUNT_UPDATED,
  [EventType.DISCOUNT_DELETED]: AuditAction.DISCOUNT_DELETED,
  [EventType.COUPON_CLAIMED]: AuditAction.COUPON_CLAIMED,
  [EventType.COUPON_REDEEMED]: AuditAction.COUPON_REDEEMED,
  [EventType.REFERRAL_SENT]: AuditAction.REFERRAL_SENT,
  [EventType.REFERRAL_COMPLETED]: AuditAction.REFERRAL_COMPLETED,
  [EventType.SUBSCRIPTION_CREATED]: AuditAction.SUBSCRIPTION_CREATED,
  [EventType.SUBSCRIPTION_CANCELLED]: AuditAction.SUBSCRIPTION_CANCELLED,
  [EventType.PAYMENT_RECEIVED]: AuditAction.PAYMENT_RECEIVED,
  [EventType.PAYMENT_FAILED]: AuditAction.PAYMENT_FAILED,
}

/**
 * Handle all events for audit logging
 */
async function handleAuditEvent(event: AppEvent): Promise<void> {
  const action = eventToAuditAction[event.type]
  if (!action) return

  const logger = audit.withUser({ id: event.userId })

  // Build description based on event type
  let description = `Event: ${event.type}`
  let resource: string | undefined
  let resourceId: string | undefined

  switch (event.type) {
    case EventType.USER_REGISTERED:
      description = `New ${event.payload.role.toLowerCase()} registered`
      resource = 'User'
      resourceId = event.payload.userId
      break

    case EventType.USER_LOGIN:
      description = event.payload.success ? 'User logged in' : 'Failed login attempt'
      resource = 'User'
      resourceId = event.payload.userId
      break

    case EventType.USER_PROFILE_UPDATED:
      description = 'User profile updated'
      resource = 'User'
      resourceId = event.payload.userId
      break

    case EventType.COMPANY_CREATED:
      description = `Company "${event.payload.name}" created`
      resource = 'Company'
      resourceId = event.payload.companyId
      break

    case EventType.EMPLOYEE_INVITED:
      description = `Employee invited to ${event.payload.companyName}`
      resource = 'Company'
      resourceId = event.payload.companyId
      break

    case EventType.EMPLOYEE_JOINED:
      description = 'Employee joined company'
      resource = 'Company'
      resourceId = event.payload.companyId
      break

    case EventType.MERCHANT_CREATED:
      description = `Merchant "${event.payload.businessName}" created`
      resource = 'Merchant'
      resourceId = event.payload.merchantId
      break

    case EventType.DISCOUNT_CREATED:
      description = `${event.payload.percentage}% discount created`
      resource = 'Discount'
      resourceId = event.payload.discountId
      break

    case EventType.COUPON_CLAIMED:
      description = `Coupon claimed at ${event.payload.merchantName}`
      resource = 'Coupon'
      resourceId = event.payload.couponId
      break

    case EventType.COUPON_REDEEMED:
      description = 'Coupon redeemed'
      resource = 'Coupon'
      resourceId = event.payload.couponId
      break

    case EventType.REFERRAL_SENT:
      description = `Referral sent to ${event.payload.refereeEmail}`
      resource = 'Referral'
      resourceId = event.payload.referralCode
      break

    case EventType.REFERRAL_COMPLETED:
      description = 'Referral completed'
      resource = 'Referral'
      resourceId = event.payload.referralCode
      break

    case EventType.PAYMENT_RECEIVED:
      description = `Payment of ${event.payload.amount} ${event.payload.currency} received`
      resource = 'Payment'
      resourceId = event.payload.paymentId
      break
  }

  logger.log({
    action,
    description,
    resource,
    resourceId,
    metadata: {
      ...event.payload,
      correlationId: event.correlationId,
    },
    success: 'success' in event.payload ? (event.payload as { success: boolean }).success : true,
  })
}

/**
 * Register audit handler for all auditable events
 */
export function registerAuditHandlers(): void {
  const auditableEvents = Object.keys(eventToAuditAction) as EventType[]
  eventBus.onMany(auditableEvents, handleAuditEvent)
  console.log('[Events] Audit handlers registered')
}

export default registerAuditHandlers
