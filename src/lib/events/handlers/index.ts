import { registerAuditHandlers } from './audit.handler'
import { registerNotificationHandlers } from './notification.handler'
import { registerAnalyticsHandlers } from './analytics.handler'

let initialized = false

/**
 * Register all event handlers
 * Call this once at application startup
 */
export function initializeEventHandlers(): void {
  if (initialized) {
    console.log('[Events] Handlers already initialized')
    return
  }

  registerAuditHandlers()
  registerNotificationHandlers()
  registerAnalyticsHandlers()

  initialized = true
  console.log('[Events] All handlers initialized')
}

export { registerAuditHandlers } from './audit.handler'
export { registerNotificationHandlers } from './notification.handler'
export { registerAnalyticsHandlers } from './analytics.handler'
