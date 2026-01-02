import { Job } from 'bullmq'
import { connectDB } from '@/lib/db/mongoose'
import { Merchant, SubscriptionStatus } from '@/lib/db/models/merchant.model'
import { sendTrialExpirationReminder } from '@/lib/services/email/trial-emails'
import { JobType } from '../queue'

/**
 * Send trial expiration reminders to merchants
 * Checks for trials expiring in 30, 14, 7, 3, and 1 days
 */
export async function sendTrialExpirationReminders(
  job: Job
): Promise<{ sent: number; failed: number; skipped: number }> {
  await connectDB()

  console.log('[TrialWorker] Checking for trial expirations...')

  const now = new Date()
  let sent = 0
  let failed = 0
  const skipped = 0

  // Define reminder thresholds (days before expiration)
  const reminderDays = [30, 14, 7, 3, 1]

  for (const days of reminderDays) {
    // Calculate the target date (trial ends in X days)
    const targetDate = new Date(now)
    targetDate.setDate(targetDate.getDate() + days)
    targetDate.setHours(0, 0, 0, 0)

    const targetDateEnd = new Date(targetDate)
    targetDateEnd.setHours(23, 59, 59, 999)

    // Find merchants with trials expiring on this date
    const merchants = await Merchant.find({
      subscriptionStatus: SubscriptionStatus.TRIALING,
      subscriptionTrialEnd: {
        $gte: targetDate,
        $lte: targetDateEnd,
      },
      // Don't send if they already have an active subscription or canceled
      subscriptionCancelAtPeriodEnd: { $ne: true },
    }).select('businessName ownerEmail ownerName subscriptionTrialEnd')

    console.log(
      `[TrialWorker] Found ${merchants.length} merchants with trials expiring in ${days} days`
    )

    for (const merchant of merchants) {
      try {
        // Check if we've already sent a reminder for this threshold
        // (Simple check: if we run this daily, we won't double-send)
        // For production, you might want to track sent reminders in the merchant model

        const result = await sendTrialExpirationReminder({
          merchantEmail: merchant.ownerEmail,
          merchantName: merchant.ownerName || 'there',
          businessName: merchant.businessName,
          daysRemaining: days,
          trialEndDate: merchant.subscriptionTrialEnd!.toISOString(),
        })

        if (result.success) {
          sent++
          console.log(
            `[TrialWorker] Sent ${days}-day reminder to ${merchant.businessName}`
          )
        } else {
          failed++
          console.error(
            `[TrialWorker] Failed to send reminder to ${merchant.businessName}:`,
            result.error
          )
        }

        // Add small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        failed++
        console.error(
          `[TrialWorker] Error sending reminder to ${merchant.businessName}:`,
          error
        )
      }
    }
  }

  console.log(
    `[TrialWorker] Completed: ${sent} sent, ${failed} failed, ${skipped} skipped`
  )

  return { sent, failed, skipped }
}

/**
 * Check for failed payments and merchants who need follow-up
 */
export async function checkFailedPayments(
  job: Job
): Promise<{ checked: number; needsAction: number }> {
  await connectDB()

  console.log('[TrialWorker] Checking for failed payments...')

  const now = new Date()
  let checked = 0
  let needsAction = 0

  // Find merchants with past_due or unpaid status
  const merchants = await Merchant.find({
    subscriptionStatus: {
      $in: [SubscriptionStatus.PAST_DUE, SubscriptionStatus.UNPAID],
    },
  }).select('businessName ownerEmail subscriptionStatus subscriptionCurrentPeriodEnd')

  checked = merchants.length

  console.log(`[TrialWorker] Found ${merchants.length} merchants with payment issues`)

  for (const merchant of merchants) {
    // Check if payment has been past due for more than 3 days
    const periodEnd = merchant.subscriptionCurrentPeriodEnd
    if (periodEnd) {
      const daysPastDue = Math.floor(
        (now.getTime() - new Date(periodEnd).getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysPastDue >= 3) {
        needsAction++
        // In a real implementation, send follow-up email or suspend service
        console.log(
          `[TrialWorker] Merchant ${merchant.businessName} payment ${daysPastDue} days overdue`
        )
      }
    }
  }

  console.log(
    `[TrialWorker] Payment check complete: ${checked} checked, ${needsAction} need action`
  )

  return { checked, needsAction }
}
