/**
 * Promotional Pricing Configuration
 *
 * Single source of truth for New Year 2026 promotion:
 * - 6 months free trial until July 1, 2026
 * - Then reverts to 3 months free trial
 *
 * This file controls all trial duration messaging across the site.
 */

// Promotion end date: July 1, 2026 at midnight Pacific Time
export const PROMO_END_DATE = new Date('2026-07-01T00:00:00-07:00')

// Trial durations
export const PROMO_TRIAL_MONTHS = 6
export const STANDARD_TRIAL_MONTHS = 3

// Promotional disclaimer text
export const PROMO_DISCLAIMER = '*New Year 2026 promotion. 6 months free trial expires July 1, 2026. Standard 3-month trial applies thereafter.'

// Short disclaimer for tooltips
export const PROMO_DISCLAIMER_SHORT = 'Promotional offer expires July 1, 2026'

/**
 * Check if the New Year 2026 promotion is currently active
 */
export function isPromotionActive(): boolean {
  const now = new Date()
  return now < PROMO_END_DATE
}

/**
 * Get the current trial duration based on promotion status
 */
export function getTrialDuration(): { months: number; isPromo: boolean } {
  const active = isPromotionActive()
  return {
    months: active ? PROMO_TRIAL_MONTHS : STANDARD_TRIAL_MONTHS,
    isPromo: active,
  }
}

/**
 * Get trial duration as text (e.g., "6 months" or "3 months")
 */
export function getTrialDurationText(): string {
  const { months } = getTrialDuration()
  return `${months} month${months > 1 ? 's' : ''}`
}

/**
 * Get days remaining until promotion ends (for countdown)
 */
export function getDaysUntilPromoEnd(): number {
  if (!isPromotionActive()) return 0

  const now = new Date()
  const diff = PROMO_END_DATE.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Format the promotion end date for display
 */
export function getPromoEndDateFormatted(): string {
  return PROMO_END_DATE.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
