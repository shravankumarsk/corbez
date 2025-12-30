import { Queue, Worker, Job, QueueEvents, ConnectionOptions } from 'bullmq'

// Job types
export enum JobType {
  // Email jobs
  SEND_EMAIL = 'send-email',
  SEND_BULK_EMAIL = 'send-bulk-email',

  // Cleanup jobs
  CLEANUP_EXPIRED_COUPONS = 'cleanup-expired-coupons',
  CLEANUP_OLD_AUDIT_LOGS = 'cleanup-old-audit-logs',
  CLEANUP_SESSIONS = 'cleanup-sessions',

  // Moderation jobs
  PROCESS_EXPIRED_SUSPENSIONS = 'process-expired-suspensions',

  // Notification jobs
  SEND_PUSH_NOTIFICATION = 'send-push-notification',
  SEND_SMS = 'send-sms',

  // Analytics jobs
  GENERATE_DAILY_REPORT = 'generate-daily-report',
  SYNC_ANALYTICS = 'sync-analytics',

  // Merchant jobs
  PROCESS_MERCHANT_PAYOUT = 'process-merchant-payout',
  UPDATE_MERCHANT_STATS = 'update-merchant-stats',

  // Company jobs
  GENERATE_SAVINGS_REPORT = 'generate-savings-report',
  SYNC_EMPLOYEE_DATA = 'sync-employee-data',
}

// Job payloads
export interface JobPayloads {
  [JobType.SEND_EMAIL]: {
    to: string
    subject: string
    template: string
    data: Record<string, unknown>
  }
  [JobType.SEND_BULK_EMAIL]: {
    recipients: string[]
    subject: string
    template: string
    data: Record<string, unknown>
  }
  [JobType.CLEANUP_EXPIRED_COUPONS]: Record<string, never>
  [JobType.CLEANUP_OLD_AUDIT_LOGS]: { olderThanDays: number }
  [JobType.CLEANUP_SESSIONS]: Record<string, never>
  [JobType.PROCESS_EXPIRED_SUSPENSIONS]: Record<string, never>
  [JobType.SEND_PUSH_NOTIFICATION]: {
    userId: string
    title: string
    body: string
    data?: Record<string, string>
  }
  [JobType.SEND_SMS]: {
    to: string
    message: string
  }
  [JobType.GENERATE_DAILY_REPORT]: { date: string }
  [JobType.SYNC_ANALYTICS]: { startDate: string; endDate: string }
  [JobType.PROCESS_MERCHANT_PAYOUT]: {
    merchantId: string
    amount: number
    period: string
  }
  [JobType.UPDATE_MERCHANT_STATS]: { merchantId: string }
  [JobType.GENERATE_SAVINGS_REPORT]: { companyId: string; month: string }
  [JobType.SYNC_EMPLOYEE_DATA]: { companyId: string }
}

// Redis connection configuration
const getRedisConnection = (): ConnectionOptions | null => {
  const url = process.env.REDIS_URL
  if (!url) {
    console.warn('[Jobs] REDIS_URL not set - job queue disabled')
    return null
  }

  // Parse Redis URL
  const parsed = new URL(url)
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port) || 6379,
    password: parsed.password || undefined,
    username: parsed.username || undefined,
  }
}

const connection = getRedisConnection()

// Queue instance
const queueName = 'corbe-jobs'
export const jobQueue = connection ? new Queue(queueName, { connection }) : null

// Queue events for monitoring
export const queueEvents = connection ? new QueueEvents(queueName, { connection }) : null

/**
 * Add a job to the queue
 */
export async function addJob<T extends JobType>(
  type: T,
  data: JobPayloads[T],
  options?: {
    delay?: number
    priority?: number
    attempts?: number
    backoff?: { type: 'fixed' | 'exponential'; delay: number }
    removeOnComplete?: boolean | { count: number }
    removeOnFail?: boolean | { count: number }
  }
): Promise<Job | null> {
  if (!jobQueue) {
    console.warn('[Jobs] Queue not available, skipping job:', type)
    return null
  }

  return jobQueue.add(type, data, {
    attempts: options?.attempts || 3,
    backoff: options?.backoff || { type: 'exponential', delay: 1000 },
    removeOnComplete: options?.removeOnComplete ?? { count: 100 },
    removeOnFail: options?.removeOnFail ?? { count: 50 },
    delay: options?.delay,
    priority: options?.priority,
  })
}

/**
 * Schedule a repeating job
 */
export async function scheduleJob<T extends JobType>(
  type: T,
  data: JobPayloads[T],
  pattern: string // cron pattern
): Promise<void> {
  if (!jobQueue) {
    console.warn('[Jobs] Queue not available, skipping scheduled job:', type)
    return
  }

  await jobQueue.add(type, data, {
    repeat: { pattern },
    removeOnComplete: { count: 10 },
    removeOnFail: { count: 10 },
  })
}

/**
 * Get queue stats
 */
export async function getQueueStats(): Promise<{
  waiting: number
  active: number
  completed: number
  failed: number
  delayed: number
} | null> {
  if (!jobQueue) return null

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    jobQueue.getWaitingCount(),
    jobQueue.getActiveCount(),
    jobQueue.getCompletedCount(),
    jobQueue.getFailedCount(),
    jobQueue.getDelayedCount(),
  ])

  return { waiting, active, completed, failed, delayed }
}

/**
 * Pause the queue
 */
export async function pauseQueue(): Promise<void> {
  await jobQueue?.pause()
}

/**
 * Resume the queue
 */
export async function resumeQueue(): Promise<void> {
  await jobQueue?.resume()
}

/**
 * Clean old jobs from the queue
 */
export async function cleanQueue(grace = 24 * 60 * 60 * 1000): Promise<void> {
  if (!jobQueue) return

  await Promise.all([
    jobQueue.clean(grace, 1000, 'completed'),
    jobQueue.clean(grace, 1000, 'failed'),
  ])
}

export { connection as redisConnection }
