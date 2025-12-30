import { Job } from 'bullmq'
import { JobType, JobPayloads } from '../queue'
import { connectDB } from '@/lib/db/mongoose'

/**
 * Process cleanup jobs
 */
export async function processCleanupJob(job: Job): Promise<void> {
  await connectDB()

  switch (job.name) {
    case JobType.CLEANUP_EXPIRED_COUPONS:
      await cleanupExpiredCoupons()
      break

    case JobType.CLEANUP_OLD_AUDIT_LOGS:
      await cleanupOldAuditLogs(job.data as JobPayloads[JobType.CLEANUP_OLD_AUDIT_LOGS])
      break

    case JobType.CLEANUP_SESSIONS:
      await cleanupSessions()
      break

    case JobType.PROCESS_EXPIRED_SUSPENSIONS:
      await processExpiredSuspensions()
      break

    default:
      console.warn(`[Cleanup Worker] Unknown job type: ${job.name}`)
  }
}

/**
 * Clean up expired coupons
 */
async function cleanupExpiredCoupons(): Promise<void> {
  console.log('[Cleanup Worker] Cleaning up expired coupons')

  // Dynamically import to avoid circular dependencies
  const { ClaimedCoupon: Coupon } = await import('@/lib/db/models/claimed-coupon.model')

  const result = await Coupon.updateMany(
    {
      status: 'ACTIVE',
      expiresAt: { $lt: new Date() },
    },
    {
      $set: { status: 'EXPIRED' },
    }
  )

  console.log(`[Cleanup Worker] Marked ${result.modifiedCount} coupons as expired`)
}

/**
 * Clean up old audit logs (beyond TTL if manual cleanup needed)
 */
async function cleanupOldAuditLogs(data: { olderThanDays: number }): Promise<void> {
  console.log(`[Cleanup Worker] Cleaning audit logs older than ${data.olderThanDays} days`)

  const { AuditLog } = await import('@/lib/db/models/audit-log.model')

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - data.olderThanDays)

  const result = await AuditLog.deleteMany({
    timestamp: { $lt: cutoffDate },
  })

  console.log(`[Cleanup Worker] Deleted ${result.deletedCount} old audit logs`)
}

/**
 * Clean up expired sessions
 */
async function cleanupSessions(): Promise<void> {
  console.log('[Cleanup Worker] Cleaning up expired sessions')

  // If using database sessions, clean them here
  // const { Session } = await import('@/lib/db/models/session.model')
  // await Session.deleteMany({ expires: { $lt: new Date() } })

  console.log('[Cleanup Worker] Session cleanup complete')
}

/**
 * Process expired suspensions (auto-unsuspend)
 */
async function processExpiredSuspensions(): Promise<void> {
  console.log('[Cleanup Worker] Processing expired suspensions')

  const { moderationService } = await import('@/lib/services/moderation.service')
  const count = await moderationService.processExpiredSuspensions()

  console.log(`[Cleanup Worker] Processed ${count} expired suspensions`)
}
