import { Job } from 'bullmq'
import { JobType, JobPayloads } from '../queue'

/**
 * Process single email job
 */
export async function processEmailJob(job: Job<JobPayloads[JobType.SEND_EMAIL]>): Promise<void> {
  const { to, subject, template, data } = job.data

  // TODO: Implement with actual email service (SendGrid, Resend, etc.)
  console.log('[Email Worker] Sending email:', {
    to,
    subject,
    template,
    dataKeys: Object.keys(data),
  })

  // Simulate email sending
  await simulateAsyncWork(100)

  // Example implementation with SendGrid:
  // await sendgrid.send({
  //   to,
  //   from: 'noreply@corbez.com',
  //   subject,
  //   templateId: template,
  //   dynamicTemplateData: data,
  // })
}

/**
 * Process bulk email job
 */
export async function processBulkEmailJob(job: Job<JobPayloads[JobType.SEND_BULK_EMAIL]>): Promise<void> {
  const { recipients, subject, template, data } = job.data

  console.log('[Email Worker] Sending bulk email:', {
    recipientCount: recipients.length,
    subject,
    template,
  })

  // Process in batches of 100
  const batchSize = 100
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize)

    // Update job progress
    await job.updateProgress(Math.round((i / recipients.length) * 100))

    // Process batch
    await Promise.all(
      batch.map(async (recipient) => {
        // TODO: Implement actual email sending
        console.log(`[Email Worker] Sending to ${recipient}`)
        await simulateAsyncWork(50)
      })
    )

    // Rate limiting between batches
    await simulateAsyncWork(1000)
  }

  await job.updateProgress(100)
}

/**
 * Simulate async work for development
 */
function simulateAsyncWork(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
