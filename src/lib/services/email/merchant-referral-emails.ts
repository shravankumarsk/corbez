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
const SUPPORT_EMAIL = 'support@corbez.com'

interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// 1. Email to REFERRER: Confirmation when they submit a referral
export async function sendReferrerConfirmationEmail(params: {
  referrerEmail: string
  referrerName: string
  referredBusinessName: string
  referredContactName?: string
}): Promise<SendEmailResult> {
  const { referrerEmail, referrerName, referredBusinessName, referredContactName } = params
  const dashboardUrl = `${APP_URL}/dashboard/merchant/referrals`

  try {
    const { data, error } = await getResendClient().emails.send({
      from: FROM_EMAIL,
      to: referrerEmail,
      subject: `Thanks for referring ${referredBusinessName}!`,
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

            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #bbf7d0;">
              <h2 style="margin-top: 0; color: #166534;">Thanks for the referral, ${referrerName}!</h2>
              <p>
                We received your referral for <strong>${referredBusinessName}</strong>
                ${referredContactName ? ` (${referredContactName})` : ''}.
              </p>
              <p>Here's what happens next:</p>
            </div>

            <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
              <h3 style="margin-top: 0; color: #1e293b; font-size: 18px;">Your reward timeline</h3>
              <div style="margin-bottom: 20px;">
                <div style="display: flex; align-items: start; margin-bottom: 15px;">
                  <div style="width: 40px; height: 40px; background: #F45D48; border-radius: 50%; display: flex; align-items: center; justify-center; flex-shrink: 0; margin-right: 15px;">
                    <span style="color: white; font-size: 20px;">📧</span>
                  </div>
                  <div>
                    <h4 style="margin: 0 0 5px 0; color: #1e293b;">Within 48 hours</h4>
                    <p style="margin: 0; color: #666; font-size: 14px;">We'll personally reach out to ${referredBusinessName} with your warm introduction.</p>
                  </div>
                </div>

                <div style="display: flex; align-items: start; margin-bottom: 15px;">
                  <div style="width: 40px; height: 40px; background: #F45D48; border-radius: 50%; display: flex; align-items: center; justify-center; flex-shrink: 0; margin-right: 15px;">
                    <span style="color: white; font-size: 20px;">✨</span>
                  </div>
                  <div>
                    <h4 style="margin: 0 0 5px 0; color: #1e293b;">When they sign up</h4>
                    <p style="margin: 0; color: #666; font-size: 14px;">You earn <strong>1 month free</strong> credit to your subscription.</p>
                  </div>
                </div>

                <div style="display: flex; align-items: start;">
                  <div style="width: 40px; height: 40px; background: #F45D48; border-radius: 50%; display: flex; align-items: center; justify-center; flex-shrink: 0; margin-right: 15px;">
                    <span style="color: white; font-size: 20px;">🎉</span>
                  </div>
                  <div>
                    <h4 style="margin: 0 0 5px 0; color: #1e293b;">When they convert</h4>
                    <p style="margin: 0; color: #666; font-size: 14px;">You earn <strong>2 more months free</strong> (3 months total!).</p>
                  </div>
                </div>
              </div>

              <p style="background: #fff; padding: 15px; border-radius: 8px; border-left: 4px solid #F45D48; margin: 20px 0 0 0; font-size: 14px; color: #666;">
                <strong>Tip:</strong> Rewards activate after they process 10+ verified employee visits. We'll notify you at each milestone!
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardUrl}"
                 style="display: inline-block; background: #F45D48; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Track Your Referrals
              </a>
            </div>

            <div style="text-align: center; color: #666; font-size: 12px;">
              <p>Questions? Reply to this email or contact us at ${SUPPORT_EMAIL}</p>
              <p style="margin-top: 20px;">&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Email service error:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

// 2. Email to REFEREE: Invitation with special 9-month offer
export async function sendRefereeInvitationEmail(params: {
  refereeEmail: string
  referredBusinessName: string
  referredContactName?: string
  referrerBusinessName: string
  referrerName?: string
}): Promise<SendEmailResult> {
  const { refereeEmail, referredBusinessName, referredContactName, referrerBusinessName, referrerName } = params
  const registerUrl = `${APP_URL}/register?type=merchant&ref=${encodeURIComponent(referrerBusinessName)}`
  const contactName = referredContactName || 'there'

  try {
    const { data, error } = await getResendClient().emails.send({
      from: FROM_EMAIL,
      to: refereeEmail,
      subject: `${referrerBusinessName} recommended Corbez for ${referredBusinessName}`,
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

            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #fcd34d;">
              <div style="background: #fff; border-radius: 8px; padding: 15px; margin-bottom: 20px; border: 2px dashed #f59e0b;">
                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">⭐ SPECIAL REFERRAL OFFER</p>
                <p style="margin: 5px 0 0 0; color: #78350f; font-size: 22px; font-weight: bold;">9 Months Free Trial</p>
              </div>

              <h2 style="margin-top: 0; color: #92400e;">Hi ${contactName},</h2>
              <p>
                ${referrerName || referrerBusinessName} thinks ${referredBusinessName} would be a great fit for Corbez—and we agree!
              </p>
              <p>
                Corbez connects local restaurants with thousands of corporate employees looking for places to eat.
                Give them exclusive discounts, and they'll become your regulars.
              </p>
            </div>

            <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
              <h3 style="margin-top: 0; color: #1e293b; font-size: 18px;">Why restaurants love Corbez</h3>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 10px;"><strong>Fill empty tables</strong> – Corporate employees eat out regularly and bring colleagues</li>
                <li style="margin-bottom: 10px;"><strong>Keep 100% revenue</strong> – No commissions. Just $9.99/month after trial (vs 30% on delivery apps)</li>
                <li style="margin-bottom: 10px;"><strong>You control discounts</strong> – Set different rates for different companies or slow hours</li>
                <li style="margin-bottom: 10px;"><strong>Dead simple</strong> – If your staff can take a photo, they can scan a QR code</li>
              </ul>
            </div>

            <div style="background: #eff6ff; border-radius: 12px; padding: 25px; margin-bottom: 30px; border: 1px solid #bfdbfe;">
              <h3 style="margin-top: 0; color: #1e40af; font-size: 18px;">Your special referral offer</h3>
              <div style="background: #fff; border-radius: 8px; padding: 20px; margin: 15px 0; text-align: center;">
                <p style="margin: 0; font-size: 48px; font-weight: bold; color: #F45D48; line-height: 1;">9</p>
                <p style="margin: 5px 0 0 0; font-size: 18px; color: #666;">months completely free</p>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #999;">(vs standard 6 months)</p>
              </div>
              <p style="margin: 15px 0 0 0; color: #666; font-size: 14px; text-align: center;">
                After that, just $9.99/month. Cancel anytime, no questions asked.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${registerUrl}"
                 style="display: inline-block; background: #F45D48; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 6px rgba(244, 93, 72, 0.3);">
                Start Your 9-Month Free Trial
              </a>
              <p style="margin: 15px 0 0 0; color: #666; font-size: 14px;">No credit card required</p>
            </div>

            <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                Have questions? Our team is here to help.<br>
                Reply to this email or call us at (555) 123-4567
              </p>
            </div>

            <div style="text-align: center; color: #666; font-size: 12px;">
              <p>This special offer is only available through referrals.</p>
              <p style="margin-top: 20px;">&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Email service error:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

// 3. Email to REFERRER: When referee registers (1 month earned)
export async function sendReferrerRegisteredNotificationEmail(params: {
  referrerEmail: string
  referrerName: string
  referredBusinessName: string
}): Promise<SendEmailResult> {
  const { referrerEmail, referrerName, referredBusinessName } = params
  const dashboardUrl = `${APP_URL}/dashboard/merchant/referrals`

  try {
    const { data, error } = await getResendClient().emails.send({
      from: FROM_EMAIL,
      to: referrerEmail,
      subject: `Great news! ${referredBusinessName} just joined Corbez`,
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

            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #bbf7d0; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 15px;">🎉</div>
              <h2 style="margin: 0 0 15px 0; color: #166534;">Your referral worked, ${referrerName}!</h2>
              <p style="font-size: 18px; color: #15803d; margin: 0;">
                <strong>${referredBusinessName}</strong> just signed up for Corbez.
              </p>
            </div>

            <div style="background: #fff; border: 2px solid #10b981; border-radius: 12px; padding: 25px; margin-bottom: 30px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">You earned</p>
              <p style="margin: 0; font-size: 42px; font-weight: bold; color: #10b981;">1 Month Free</p>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
                This credit will be applied to your next billing cycle
              </p>
            </div>

            <div style="background: #fffbeb; border-radius: 12px; padding: 25px; margin-bottom: 30px; border: 1px solid #fde68a;">
              <h3 style="margin-top: 0; color: #92400e; font-size: 16px;">💰 How to earn 2 more months free</h3>
              <p style="margin: 0; color: #78350f;">
                When ${referredBusinessName} processes 10+ verified employee visits and becomes a paying customer,
                you'll earn <strong>2 additional months free</strong> (3 months total).
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardUrl}"
                 style="display: inline-block; background: #F45D48; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                View All Your Referrals
              </a>
            </div>

            <div style="text-align: center; color: #666; font-size: 12px;">
              <p>Know more restaurants? Keep referring and keep earning!</p>
              <p style="margin-top: 20px;">&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Email service error:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

// 4. Email to REFERRER: When referee converts (2 more months earned)
export async function sendReferrerConvertedNotificationEmail(params: {
  referrerEmail: string
  referrerName: string
  referredBusinessName: string
  totalMonthsEarned: number
}): Promise<SendEmailResult> {
  const { referrerEmail, referrerName, referredBusinessName, totalMonthsEarned } = params
  const dashboardUrl = `${APP_URL}/dashboard/merchant/referrals`

  try {
    const { data, error } = await getResendClient().emails.send({
      from: FROM_EMAIL,
      to: referrerEmail,
      subject: `You just earned 2 more months free!`,
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

            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #fcd34d; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 15px;">🚀</div>
              <h2 style="margin: 0 0 15px 0; color: #92400e;">Congratulations, ${referrerName}!</h2>
              <p style="font-size: 18px; color: #78350f; margin: 0;">
                <strong>${referredBusinessName}</strong> became a paying customer.
              </p>
            </div>

            <div style="background: #fff; border: 3px solid #f59e0b; border-radius: 12px; padding: 30px; margin-bottom: 30px; text-align: center;">
              <p style="margin: 0 0 15px 0; color: #666; font-size: 16px;">You just earned</p>
              <p style="margin: 0; font-size: 52px; font-weight: bold; color: #f59e0b; line-height: 1;">+2 Months</p>
              <p style="margin: 15px 0 0 0; color: #666; font-size: 14px;">
                That's <strong>${totalMonthsEarned} months free</strong> from this referral!
              </p>
            </div>

            <div style="background: #f0fdf4; border-radius: 12px; padding: 25px; margin-bottom: 30px; border: 1px solid #bbf7d0;">
              <h3 style="margin-top: 0; color: #166534; font-size: 18px; text-align: center;">🎯 Why stop here?</h3>
              <p style="margin: 0; color: #15803d; text-align: center;">
                You can earn up to <strong>6 months free per year</strong> through referrals.
                Know another restaurant that should join?
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_URL}/refer-a-restaurant"
                 style="display: inline-block; background: #F45D48; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px; margin-bottom: 15px;">
                Refer Another Restaurant
              </a>
              <br>
              <a href="${dashboardUrl}"
                 style="color: #F45D48; text-decoration: underline; font-size: 14px;">
                View your referral dashboard
              </a>
            </div>

            <div style="text-align: center; color: #666; font-size: 12px;">
              <p>Thank you for helping grow the Corbez community! 🙏</p>
              <p style="margin-top: 20px;">&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Email service error:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

// 5. Internal notification: New referral submitted
export async function sendInternalReferralNotificationEmail(params: {
  referrerBusinessName: string
  referrerEmail: string
  referredBusinessName: string
  referredEmail: string
  referredPhone?: string
  referredAddress?: string
  referredNotes?: string
}): Promise<SendEmailResult> {
  const {
    referrerBusinessName,
    referrerEmail,
    referredBusinessName,
    referredEmail,
    referredPhone,
    referredAddress,
    referredNotes,
  } = params
  const internalEmail = process.env.INTERNAL_NOTIFICATIONS_EMAIL || 'team@corbez.com'

  try {
    const { data, error } = await getResendClient().emails.send({
      from: FROM_EMAIL,
      to: internalEmail,
      subject: `🔔 New merchant referral: ${referredBusinessName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1e293b;">New Merchant Referral</h2>

            <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #475569;">Referrer Information</h3>
              <p style="margin: 5px 0;"><strong>Business:</strong> ${referrerBusinessName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${referrerEmail}</p>
            </div>

            <div style="background: #fffbeb; border-radius: 8px; padding: 20px; margin-bottom: 20px; border: 2px solid #fcd34d;">
              <h3 style="margin-top: 0; color: #92400e;">Referred Business</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${referredBusinessName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${referredEmail}">${referredEmail}</a></p>
              ${referredPhone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${referredPhone}</p>` : ''}
              ${referredAddress ? `<p style="margin: 5px 0;"><strong>Address:</strong> ${referredAddress}</p>` : ''}
            </div>

            ${referredNotes ? `
              <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="margin-top: 0; color: #166534;">Why they'd be a good fit</h3>
                <p style="margin: 0; color: #15803d; font-style: italic;">"${referredNotes}"</p>
              </div>
            ` : ''}

            <div style="background: #F45D48; color: white; border-radius: 8px; padding: 15px; text-align: center;">
              <p style="margin: 0; font-weight: 600;">⏰ Action Required: Contact within 48 hours</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Email service error:', error)
    return { success: false, error: 'Failed to send email' }
  }
}
