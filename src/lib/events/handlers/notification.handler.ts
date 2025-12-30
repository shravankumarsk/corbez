import { EventType, AppEvent } from '../types'
import { eventBus } from '../emitter'

/**
 * Email notification templates (placeholders for actual email service)
 */
interface EmailTemplate {
  subject: string
  template: string
}

const emailTemplates: Partial<Record<EventType, (payload: Record<string, unknown>) => EmailTemplate>> = {
  [EventType.USER_REGISTERED]: (payload) => ({
    subject: 'Welcome to Corbe!',
    template: `welcome-${payload.role}`,
  }),

  [EventType.EMPLOYEE_INVITED]: (payload) => ({
    subject: `You've been invited to join ${payload.companyName} on Corbe`,
    template: 'employee-invitation',
  }),

  [EventType.REFERRAL_SENT]: (payload) => ({
    subject: `${payload.referrerEmail} thinks you'd love Corbe`,
    template: 'referral-invitation',
  }),

  [EventType.COUPON_CLAIMED]: (payload) => ({
    subject: `Your ${payload.discountPercentage}% discount at ${payload.merchantName} is ready!`,
    template: 'coupon-claimed',
  }),

  [EventType.PAYMENT_RECEIVED]: () => ({
    subject: 'Payment confirmation',
    template: 'payment-received',
  }),

  [EventType.PAYMENT_FAILED]: () => ({
    subject: 'Payment failed - action required',
    template: 'payment-failed',
  }),
}

/**
 * Send email notification (stub - implement with actual email service)
 */
async function sendEmail(to: string, template: EmailTemplate, data: Record<string, unknown>): Promise<void> {
  // TODO: Implement with actual email service (SendGrid, Resend, etc.)
  console.log('[Email] Would send email:', {
    to,
    subject: template.subject,
    template: template.template,
    data,
  })
}

/**
 * Handle notification events
 */
async function handleNotificationEvent(event: AppEvent): Promise<void> {
  const templateFn = emailTemplates[event.type]
  if (!templateFn) return

  const template = templateFn(event.payload as Record<string, unknown>)
  const recipient = getRecipientEmail(event)

  if (!recipient) {
    console.warn('[Notification] No recipient for event:', event.type)
    return
  }

  await sendEmail(recipient, template, {
    ...event.payload,
    timestamp: event.timestamp,
  })
}

/**
 * Extract recipient email from event payload
 */
function getRecipientEmail(event: AppEvent): string | null {
  const payload = event.payload as Record<string, string | undefined>

  switch (event.type) {
    case EventType.USER_REGISTERED:
    case EventType.USER_LOGIN:
      return payload.email || null

    case EventType.EMPLOYEE_INVITED:
    case EventType.REFERRAL_SENT:
      return payload.email || payload.refereeEmail || null

    default:
      return payload.email || payload.userEmail || null
  }
}

/**
 * Register notification handlers
 */
export function registerNotificationHandlers(): void {
  const notificationEvents = Object.keys(emailTemplates) as EventType[]
  eventBus.onMany(notificationEvents, handleNotificationEvent)
  console.log('[Events] Notification handlers registered')
}

export default registerNotificationHandlers
