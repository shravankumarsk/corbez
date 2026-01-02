import { Resend } from 'resend'

// Lazy initialization to avoid build-time errors
let resendClient: Resend | null = null

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured. Email sending is disabled.')
    }
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Corbez <noreply@corbez.com>'
const APP_NAME = 'Corbez'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const SUPPORT_EMAIL = 'contact@corbez.com'

interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send trial expiration reminder email
 * @param daysRemaining - Number of days until trial expires (30, 14, 7, 3, or 1)
 */
export async function sendTrialExpirationReminder(params: {
  merchantEmail: string
  merchantName: string
  businessName: string
  daysRemaining: number
  trialEndDate: string
}): Promise<SendEmailResult> {
  const { merchantEmail, merchantName, businessName, daysRemaining, trialEndDate } = params
  const billingUrl = `${APP_URL}/dashboard/merchant/billing`

  // Determine urgency level
  const isUrgent = daysRemaining <= 7
  const isFinal = daysRemaining <= 1

  // Customize subject and tone based on days remaining
  const subject = isFinal
    ? `⚠️ Your Corbez trial ends tomorrow`
    : isUrgent
    ? `Your Corbez trial ends in ${daysRemaining} days`
    : `Friendly reminder: Your Corbez trial ends in ${daysRemaining} days`

  try {
    const { data, error } = await getResendClient().emails.send({
      from: FROM_EMAIL,
      to: merchantEmail,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="margin: 0; font-size: 32px;">
                <span style="color: #1e293b;">cor</span><span style="color: #F45D48;">bez</span>
              </h1>
              <p style="color: #666; margin-top: 5px;">Corporate Dining Benefits</p>
            </div>

            ${isFinal ? `
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 3px solid #f59e0b; text-align: center;">
                <div style="font-size: 64px; margin-bottom: 15px;">⏰</div>
                <h2 style="margin: 0 0 15px 0; color: #92400e;">Your trial ends tomorrow!</h2>
                <p style="font-size: 18px; color: #78350f; margin: 0;">
                  Add a payment method now to keep using Corbez
                </p>
              </div>
            ` : isUrgent ? `
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 2px solid #fcd34d;">
                <h2 style="margin-top: 0; color: #92400e;">Hi ${merchantName},</h2>
                <p style="color: #78350f; font-size: 16px; margin: 0;">
                  Your free trial for <strong>${businessName}</strong> ends in <strong>${daysRemaining} days</strong> on ${new Date(trialEndDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
                </p>
              </div>
            ` : `
              <div style="background: #f8fafc; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
                <h2 style="margin-top: 0; color: #1e293b;">Hi ${merchantName},</h2>
                <p style="color: #475569; margin: 0;">
                  Just a friendly reminder that your free trial for <strong>${businessName}</strong> ends in <strong>${daysRemaining} days</strong> on ${new Date(trialEndDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
                </p>
              </div>
            `}

            <div style="background: #fff; border-radius: 12px; padding: 25px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
              <h3 style="margin-top: 0; color: #1e293b; font-size: 18px;">What happens next?</h3>

              ${isFinal ? `
                <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                  <p style="margin: 0; color: #991b1b; font-weight: 600;">
                    ⚠️ If you don't add a payment method by tomorrow, your service will be interrupted.
                  </p>
                </div>
              ` : ''}

              <p style="color: #475569; margin-bottom: 15px;">
                To continue using Corbez after your trial ends:
              </p>

              <ol style="color: #475569; padding-left: 20px; margin: 15px 0;">
                <li style="margin-bottom: 10px;">
                  <strong>Add a payment method</strong> - Click the button below to securely add your card
                </li>
                <li style="margin-bottom: 10px;">
                  <strong>We'll charge $9.99/month</strong> starting ${new Date(trialEndDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </li>
                <li style="margin-bottom: 10px;">
                  <strong>Keep attracting corporate customers</strong> - No interruption to your service
                </li>
              </ol>

              <p style="color: #64748b; font-size: 14px; margin-top: 15px;">
                Don't want to continue? No problem - your trial will simply end and you won't be charged.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${billingUrl}"
                 style="display: inline-block; background: #F45D48; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 6px rgba(244, 93, 72, 0.3);">
                ${isFinal ? 'Add Payment Method Now' : 'Manage Billing'}
              </a>
            </div>

            <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
              <h4 style="margin-top: 0; color: #1e293b;">Why our merchants love Corbez:</h4>
              <ul style="color: #475569; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Average of 30+ new corporate customers per month</li>
                <li style="margin-bottom: 8px;">$9.99/month - no transaction fees, no hidden costs</li>
                <li style="margin-bottom: 8px;">Customers who visit regularly and spend more</li>
                <li>Simple QR code scanning - no expensive hardware</li>
              </ul>
            </div>

            <div style="text-align: center; background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
              <p style="margin: 0; color: #64748b; font-size: 14px;">
                Questions about billing or your trial?<br>
                Reply to this email or contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #F45D48; text-decoration: none;">${SUPPORT_EMAIL}</a>
              </p>
            </div>

            <div style="text-align: center; color: #94a3b8; font-size: 12px;">
              <p style="margin: 5px 0;">Trial ends: ${new Date(trialEndDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
              <p style="margin-top: 20px;">&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Trial reminder email send error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Trial reminder email service error:', error)
    return { success: false, error: 'Failed to send trial reminder email' }
  }
}

/**
 * Send trial ended notification (payment failed or no payment method)
 */
export async function sendTrialEndedNotification(params: {
  merchantEmail: string
  merchantName: string
  businessName: string
  hasPaymentMethod: boolean
}): Promise<SendEmailResult> {
  const { merchantEmail, merchantName, businessName, hasPaymentMethod } = params
  const billingUrl = `${APP_URL}/dashboard/merchant/billing`

  try {
    const { data, error } = await getResendClient().emails.send({
      from: FROM_EMAIL,
      to: merchantEmail,
      subject: hasPaymentMethod
        ? '⚠️ Payment failed - Corbez service paused'
        : 'Your Corbez trial has ended',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="margin: 0; font-size: 32px;">
                <span style="color: #1e293b;">cor</span><span style="color: #F45D48;">bez</span>
              </h1>
            </div>

            ${hasPaymentMethod ? `
              <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 3px solid #ef4444; text-align: center;">
                <div style="font-size: 64px; margin-bottom: 15px;">⚠️</div>
                <h2 style="margin: 0 0 15px 0; color: #991b1b;">Payment Failed</h2>
                <p style="font-size: 16px; color: #7f1d1d; margin: 0;">
                  We couldn't process your payment for <strong>${businessName}</strong>
                </p>
              </div>

              <div style="background: #fff; border-radius: 12px; padding: 25px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
                <h3 style="margin-top: 0; color: #1e293b;">Your service has been paused</h3>
                <p style="color: #475569;">
                  We attempted to charge your payment method for your Corbez subscription, but the payment was declined.
                </p>
                <p style="color: #475569;">
                  To restore your service:
                </p>
                <ol style="color: #475569; padding-left: 20px;">
                  <li style="margin-bottom: 10px;">Update your payment method</li>
                  <li style="margin-bottom: 10px;">We'll automatically retry the charge</li>
                  <li>Your service will be restored immediately</li>
                </ol>
              </div>
            ` : `
              <div style="background: #f8fafc; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
                <h2 style="margin-top: 0; color: #1e293b;">Hi ${merchantName},</h2>
                <p style="color: #475569; margin: 0;">
                  Your free trial for <strong>${businessName}</strong> has ended.
                </p>
              </div>

              <div style="background: #fff; border-radius: 12px; padding: 25px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
                <h3 style="margin-top: 0; color: #1e293b;">Want to continue?</h3>
                <p style="color: #475569;">
                  You can reactivate your Corbez subscription anytime for just $9.99/month.
                </p>
                <ul style="color: #475569; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Continue attracting corporate customers</li>
                  <li style="margin-bottom: 8px;">Keep all your discount settings and data</li>
                  <li>Cancel anytime, no long-term commitment</li>
                </ul>
              </div>
            `}

            <div style="text-align: center; margin: 30px 0;">
              <a href="${billingUrl}"
                 style="display: inline-block; background: #F45D48; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px;">
                ${hasPaymentMethod ? 'Update Payment Method' : 'Reactivate Subscription'}
              </a>
            </div>

            <div style="text-align: center; background: #f8fafc; border-radius: 8px; padding: 20px;">
              <p style="margin: 0; color: #64748b; font-size: 14px;">
                Questions? Reply to this email or contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #F45D48;">${SUPPORT_EMAIL}</a>
              </p>
            </div>

            <div style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 30px;">
              <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Trial ended email send error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Trial ended email service error:', error)
    return { success: false, error: 'Failed to send trial ended email' }
  }
}
