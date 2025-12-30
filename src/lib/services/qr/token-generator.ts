import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key'
const TOKEN_EXPIRY = '10m' // Token expires in 10 minutes

export interface VerificationToken {
  employeeId: string
  companyId?: string
  email: string
  nonce: string
  iat: number
  exp: number
}

export interface VerificationPayload {
  employeeId: string
  companyId?: string
  companyName?: string
  email: string
  verified: boolean
}

/**
 * Generates a JWT token for employee verification
 */
export function generateVerificationToken(payload: {
  employeeId: string
  companyId?: string
  email: string
}): string {
  const nonce = crypto.randomBytes(16).toString('hex')

  const token = jwt.sign(
    {
      employeeId: payload.employeeId,
      companyId: payload.companyId,
      email: payload.email,
      nonce,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  )

  return token
}

/**
 * Validates a verification token
 */
export function validateVerificationToken(token: string): VerificationToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as VerificationToken
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * Generates the QR code content URL
 */
export function generateQRCodeURL(baseUrl: string, token: string): string {
  return `${baseUrl}/verify/${encodeURIComponent(token)}`
}

/**
 * Generates a static URL for wallet passes that points to dynamic QR page
 */
export function generateWalletQRURL(baseUrl: string, employeeId: string): string {
  return `${baseUrl}/show?id=${employeeId}`
}
