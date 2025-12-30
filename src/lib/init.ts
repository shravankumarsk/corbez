/**
 * Application initialization
 * Import and call this once at application startup
 */

import { initializeEventHandlers } from './events'

let initialized = false

/**
 * Initialize all application services
 * Call this once at application startup
 */
export function initializeApp(): void {
  if (initialized) {
    console.log('[Init] Application already initialized')
    return
  }

  console.log('[Init] Initializing application...')

  // Initialize event handlers
  initializeEventHandlers()

  // Note: BullMQ workers should only be started in a dedicated worker process
  // Not in the main Next.js application process
  // Use: npm run worker (or similar) to start workers separately

  initialized = true
  console.log('[Init] Application initialized successfully')
}

/**
 * Initialize application for API routes
 * Lighter initialization without workers
 */
export function initializeAPI(): void {
  if (initialized) return

  // Initialize event handlers for API
  initializeEventHandlers()

  initialized = true
}

export default initializeApp
