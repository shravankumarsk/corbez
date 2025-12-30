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
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Corbe'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  firstName?: string
): Promise<SendEmailResult> {
  const verificationUrl = `${APP_URL}/verify-email?token=${token}`
  const name = firstName || email.split('@')[0]

  try {
    const { data, error } = await getResendClient().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Verify your email for ${APP_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify your email</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">${APP_NAME}</h1>
              <p style="color: #666; margin-top: 5px;">Corporate Benefits</p>
            </div>

            <div style="background: #f8fafc; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
              <h2 style="margin-top: 0; color: #1e293b;">Hi ${name}!</h2>
              <p>Thanks for signing up for ${APP_NAME}. Please verify your email address to access your corporate benefits.</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}"
                   style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Verify Email Address
                </a>
              </div>

              <p style="color: #666; font-size: 14px;">
                Or copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #2563eb; word-break: break-all;">${verificationUrl}</a>
              </p>
            </div>

            <div style="text-align: center; color: #666; font-size: 12px;">
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account with ${APP_NAME}, you can safely ignore this email.</p>
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

export async function sendWelcomeEmail(
  email: string,
  firstName?: string
): Promise<SendEmailResult> {
  const name = firstName || email.split('@')[0]
  const dashboardUrl = `${APP_URL}/dashboard/employee`

  try {
    const { data, error } = await getResendClient().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Welcome to ${APP_NAME}!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">${APP_NAME}</h1>
            </div>

            <div style="background: #f0fdf4; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #bbf7d0;">
              <h2 style="margin-top: 0; color: #166534;">Welcome, ${name}!</h2>
              <p>Your email has been verified. You now have full access to corporate discounts at partner restaurants.</p>

              <h3 style="color: #1e293b;">What's next?</h3>
              <ul style="color: #666;">
                <li>Add your digital ID to Apple or Google Wallet</li>
                <li>Show your QR code at partner restaurants</li>
                <li>Enjoy exclusive corporate discounts</li>
              </ul>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${dashboardUrl}"
                   style="display: inline-block; background: #16a34a; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  Go to Dashboard
                </a>
              </div>
            </div>

            <div style="text-align: center; color: #666; font-size: 12px;">
              <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
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

export async function sendInviteEmail(
  email: string,
  inviteCode: string,
  companyName: string,
  inviterName?: string,
  expiresAt?: Date
): Promise<SendEmailResult> {
  const registerUrl = `${APP_URL}/register?code=${encodeURIComponent(inviteCode)}`
  const expiryText = expiresAt
    ? `This invite expires on ${expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`
    : 'This invite expires in 30 days.'

  try {
    const { data, error } = await getResendClient().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `You're invited to join ${companyName} on ${APP_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>You're Invited</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">${APP_NAME}</h1>
              <p style="color: #666; margin-top: 5px;">Corporate Benefits</p>
            </div>

            <div style="background: #eff6ff; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #bfdbfe;">
              <h2 style="margin-top: 0; color: #1e40af;">You're Invited!</h2>
              <p>
                ${inviterName ? `<strong>${inviterName}</strong> has invited you` : 'You have been invited'}
                to join <strong>${companyName}</strong> on ${APP_NAME}.
              </p>

              <p>As a verified employee, you'll get access to exclusive discounts at partner restaurants.</p>

              <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; border: 2px dashed #3b82f6;">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Your Invite Code</p>
                <p style="margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 3px; color: #1e40af; font-family: monospace;">
                  ${inviteCode}
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${registerUrl}"
                   style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Create Your Account
                </a>
              </div>

              <p style="color: #666; font-size: 14px; text-align: center;">
                ${expiryText}
              </p>
            </div>

            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
              <h3 style="margin-top: 0; color: #1e293b; font-size: 16px;">How it works</h3>
              <ol style="color: #666; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Click the button above or enter the invite code during registration</li>
                <li style="margin-bottom: 8px;">Verify your email address</li>
                <li style="margin-bottom: 8px;">Add your digital ID to Apple or Google Wallet</li>
                <li>Show your QR code at partner restaurants for exclusive discounts</li>
              </ol>
            </div>

            <div style="text-align: center; color: #666; font-size: 12px;">
              <p>If you didn't expect this invitation, you can safely ignore this email.</p>
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

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<SendEmailResult> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`

  try {
    const { data, error } = await getResendClient().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Reset your ${APP_NAME} password`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">${APP_NAME}</h1>
            </div>

            <div style="background: #fef3c7; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #fcd34d;">
              <h2 style="margin-top: 0; color: #92400e;">Password Reset Request</h2>
              <p>We received a request to reset your password. Click the button below to create a new password.</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}"
                   style="display: inline-block; background: #d97706; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  Reset Password
                </a>
              </div>

              <p style="color: #666; font-size: 14px;">
                This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
              </p>
            </div>

            <div style="text-align: center; color: #666; font-size: 12px;">
              <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
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

interface ReferralInviteParams {
  to: string
  referrerName: string
  referralLink: string
  companyName?: string | null
  personalMessage?: string
}

export async function sendReferralInviteEmail(
  params: ReferralInviteParams
): Promise<SendEmailResult> {
  const { to, referrerName, referralLink, companyName, personalMessage } = params

  try {
    const { data, error } = await getResendClient().emails.send({
      from: FROM_EMAIL,
      to,
      subject: `${referrerName} invited you to join ${APP_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="margin: 0; font-size: 28px;">
                <span style="color: #1e293b;">cor</span><span style="color: #F45D48;">bez</span>
              </h1>
              <p style="color: #666; margin-top: 5px;">Corporate Benefits</p>
            </div>

            <div style="background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #fed7aa;">
              <h2 style="margin-top: 0; color: #c2410c;">You're Invited!</h2>
              <p>
                <strong>${referrerName}</strong> thinks you'd love ${APP_NAME} -
                the easiest way to get corporate discounts at local restaurants.
              </p>

              ${companyName ? `
                <p style="color: #666;">
                  They're part of <strong>${companyName}</strong> on ${APP_NAME}.
                  If you work there too, you can join the same company!
                </p>
              ` : ''}

              ${personalMessage ? `
                <div style="background: white; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #F45D48;">
                  <p style="margin: 0; color: #666; font-style: italic;">"${personalMessage}"</p>
                  <p style="margin: 10px 0 0 0; color: #999; font-size: 14px;">- ${referrerName}</p>
                </div>
              ` : ''}

              <div style="text-align: center; margin: 30px 0;">
                <a href="${referralLink}"
                   style="display: inline-block; background: #F45D48; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Join ${APP_NAME}
                </a>
              </div>
            </div>

            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
              <h3 style="margin-top: 0; color: #1e293b; font-size: 16px;">Why join?</h3>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Get exclusive discounts at partner restaurants</li>
                <li style="margin-bottom: 8px;">Digital ID card in your Apple/Google Wallet</li>
                <li style="margin-bottom: 8px;">Just scan your QR code to save</li>
                <li>100% free for employees</li>
              </ul>
            </div>

            <div style="text-align: center; color: #666; font-size: 12px;">
              <p>If you didn't expect this invitation, you can safely ignore this email.</p>
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
