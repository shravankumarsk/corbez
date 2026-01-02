import { Worker, Job } from 'bullmq'
import { JobType, redisConnection } from '../queue'
import { processEmailJob, processBulkEmailJob } from './email.worker'
import { processCleanupJob } from './cleanup.worker'
import { processAnalyticsJob } from './analytics.worker'
import {
  sendTrialExpirationReminders,
  checkFailedPayments,
} from './trial.worker'

type JobProcessor = (job: Job) => Promise<void>

// Map job types to processors
const processors: Partial<Record<JobType, JobProcessor>> = {
  [JobType.SEND_EMAIL]: processEmailJob,
  [JobType.SEND_BULK_EMAIL]: processBulkEmailJob,
  [JobType.CLEANUP_EXPIRED_COUPONS]: processCleanupJob,
  [JobType.CLEANUP_OLD_AUDIT_LOGS]: processCleanupJob,
  [JobType.CLEANUP_SESSIONS]: processCleanupJob,
  [JobType.PROCESS_EXPIRED_SUSPENSIONS]: processCleanupJob,
  [JobType.GENERATE_DAILY_REPORT]: processAnalyticsJob,
  [JobType.SYNC_ANALYTICS]: processAnalyticsJob,
  [JobType.UPDATE_MERCHANT_STATS]: processAnalyticsJob,
  [JobType.GENERATE_SAVINGS_REPORT]: processAnalyticsJob,
  [JobType.SEND_TRIAL_EXPIRATION_REMINDERS]: async (job) => {
    await sendTrialExpirationReminders(job)
  },
  [JobType.CHECK_FAILED_PAYMENTS]: async (job) => {
    await checkFailedPayments(job)
  },
}

let worker: Worker | null = null

/**
 * Start the job worker
 */
export function startWorker(): Worker | null {
  if (!redisConnection) {
    console.warn('[Worker] Redis not available, worker disabled')
    return null
  }

  if (worker) {
    console.log('[Worker] Already running')
    return worker
  }

  worker = new Worker(
    'corbe-jobs',
    async (job) => {
      const processor = processors[job.name as JobType]

      if (!processor) {
        console.warn(`[Worker] No processor for job type: ${job.name}`)
        return
      }

      console.log(`[Worker] Processing job: ${job.name} (${job.id})`)

      try {
        await processor(job)
        console.log(`[Worker] Completed job: ${job.name} (${job.id})`)
      } catch (error) {
        console.error(`[Worker] Failed job: ${job.name} (${job.id})`, error)
        throw error
      }
    },
    {
      connection: redisConnection,
      concurrency: 5,
      limiter: {
        max: 100,
        duration: 1000,
      },
    }
  )

  worker.on('completed', (job) => {
    console.log(`[Worker] Job completed: ${job.name} (${job.id})`)
  })

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job failed: ${job?.name} (${job?.id})`, err.message)
  })

  worker.on('error', (err) => {
    console.error('[Worker] Error:', err)
  })

  console.log('[Worker] Started')
  return worker
}

/**
 * Stop the job worker
 */
export async function stopWorker(): Promise<void> {
  if (worker) {
    await worker.close()
    worker = null
    console.log('[Worker] Stopped')
  }
}

/**
 * Check if worker is running
 */
export function isWorkerRunning(): boolean {
  return worker !== null && !worker.closing
}

export { worker }
