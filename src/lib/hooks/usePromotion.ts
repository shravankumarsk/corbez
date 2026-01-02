'use client'

import { useState, useEffect } from 'react'
import {
  isPromotionActive,
  getTrialDuration,
  getTrialDurationText,
  getDaysUntilPromoEnd,
  getPromoEndDateFormatted,
  PROMO_DISCLAIMER,
  PROMO_DISCLAIMER_SHORT,
} from '@/lib/config/promotion'

export interface PromotionState {
  isActive: boolean
  trialMonths: number
  trialText: string
  isPromo: boolean
  disclaimer: string
  disclaimerShort: string
  daysRemaining: number
  endDate: string
}

/**
 * React hook for accessing promotional pricing information
 *
 * Returns current promotion status and trial duration.
 * Automatically updates when promotion expires (checks every minute).
 *
 * @example
 * ```tsx
 * function PricingCard() {
 *   const promo = usePromotion()
 *
 *   return (
 *     <div>
 *       <h2>{promo.trialText} free trial</h2>
 *       {promo.isActive && <p className="text-sm">{promo.disclaimerShort}</p>}
 *     </div>
 *   )
 * }
 * ```
 */
export function usePromotion(): PromotionState {
  const [isActive, setIsActive] = useState(isPromotionActive())
  const [daysRemaining, setDaysRemaining] = useState(getDaysUntilPromoEnd())

  // Update promotion status every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setIsActive(isPromotionActive())
      setDaysRemaining(getDaysUntilPromoEnd())
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  const trialInfo = getTrialDuration()

  return {
    isActive,
    trialMonths: trialInfo.months,
    trialText: getTrialDurationText(),
    isPromo: trialInfo.isPromo,
    disclaimer: PROMO_DISCLAIMER,
    disclaimerShort: PROMO_DISCLAIMER_SHORT,
    daysRemaining,
    endDate: getPromoEndDateFormatted(),
  }
}
