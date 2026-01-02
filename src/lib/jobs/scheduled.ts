import { scheduleJob, JobType } from './queue'

/**
 * Initialize all scheduled/cron jobs
 * Call this once at application startup (in a worker process)
 */
export async function initializeScheduledJobs(): Promise<void> {
  console.log('[Scheduler] Initializing scheduled jobs...')

  // Cleanup expired coupons - run daily at 2 AM
  await scheduleJob(JobType.CLEANUP_EXPIRED_COUPONS, {}, '0 2 * * *')

  // Cleanup old audit logs (beyond 90 days) - run weekly on Sunday at 3 AM
  await scheduleJob(JobType.CLEANUP_OLD_AUDIT_LOGS, { olderThanDays: 90 }, '0 3 * * 0')

  // Cleanup expired sessions - run every 6 hours
  await scheduleJob(JobType.CLEANUP_SESSIONS, {}, '0 */6 * * *')

  // Process expired suspensions - run every hour
  await scheduleJob(JobType.PROCESS_EXPIRED_SUSPENSIONS, {}, '0 * * * *')

  // Generate daily report - run at midnight
  await scheduleJob(
    JobType.GENERATE_DAILY_REPORT,
    { date: '{{date}}' }, // Will be replaced at runtime
    '5 0 * * *'
  )

  // Sync analytics - run every hour
  await scheduleJob(
    JobType.SYNC_ANALYTICS,
    { startDate: '', endDate: '' }, // Will be populated at runtime
    '0 * * * *'
  )

  // Send trial expiration reminders - run daily at 10 AM
  await scheduleJob(JobType.SEND_TRIAL_EXPIRATION_REMINDERS, {}, '0 10 * * *')

  // Check for failed payments - run daily at 11 AM
  await scheduleJob(JobType.CHECK_FAILED_PAYMENTS, {}, '0 11 * * *')

  console.log('[Scheduler] Scheduled jobs initialized')
}

// Cron expression reference:
// ┌───────────── minute (0 - 59)
// │ ┌───────────── hour (0 - 23)
// │ │ ┌───────────── day of month (1 - 31)
// │ │ │ ┌───────────── month (1 - 12)
// │ │ │ │ ┌───────────── day of week (0 - 6) (Sunday = 0)
// │ │ │ │ │
// * * * * *
//
// Examples:
// '0 0 * * *'     - Daily at midnight
// '0 */6 * * *'   - Every 6 hours
// '0 2 * * *'     - Daily at 2 AM
// '0 3 * * 0'     - Weekly on Sunday at 3 AM
// '*/15 * * * *'  - Every 15 minutes

export default initializeScheduledJobs
