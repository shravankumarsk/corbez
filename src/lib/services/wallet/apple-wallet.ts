import { PKPass } from 'passkit-generator'
import path from 'path'
import fs from 'fs'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Corbe'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Certificate paths (configure in production)
const CERTIFICATES_PATH = process.env.APPLE_CERTIFICATES_PATH || path.join(process.cwd(), 'certificates')
const PASS_TYPE_IDENTIFIER = process.env.APPLE_PASS_TYPE_ID || 'pass.com.corbe.employee'
const TEAM_IDENTIFIER = process.env.APPLE_TEAM_ID || 'XXXXXXXXXX'

export interface EmployeePassData {
  odId: string
  odName: string
  email: string
  companyName: string
  odStatus: 'verified' | 'pending'
}

interface PassGenerationResult {
  success: boolean
  buffer?: Buffer
  error?: string
  demoMode?: boolean
}

/**
 * Check if Apple Wallet certificates are configured
 */
export function isAppleWalletConfigured(): boolean {
  try {
    const signerCertPath = path.join(CERTIFICATES_PATH, 'signerCert.pem')
    const signerKeyPath = path.join(CERTIFICATES_PATH, 'signerKey.pem')
    const wwdrPath = path.join(CERTIFICATES_PATH, 'wwdr.pem')

    return (
      fs.existsSync(signerCertPath) &&
      fs.existsSync(signerKeyPath) &&
      fs.existsSync(wwdrPath)
    )
  } catch {
    return false
  }
}

/**
 * Generate Apple Wallet pass for an employee
 */
export async function generateAppleWalletPass(data: EmployeePassData): Promise<PassGenerationResult> {
  // Check if certificates are configured
  if (!isAppleWalletConfigured()) {
    return {
      success: false,
      error: 'Apple Wallet certificates not configured. Please set up your Apple Developer certificates.',
      demoMode: true,
    }
  }

  try {
    const signerCert = fs.readFileSync(path.join(CERTIFICATES_PATH, 'signerCert.pem'))
    const signerKey = fs.readFileSync(path.join(CERTIFICATES_PATH, 'signerKey.pem'))
    const wwdr = fs.readFileSync(path.join(CERTIFICATES_PATH, 'wwdr.pem'))
    const signerKeyPassphrase = process.env.APPLE_SIGNER_KEY_PASSPHRASE || ''

    // Create pass template
    const passJson = {
      formatVersion: 1 as const,
      passTypeIdentifier: PASS_TYPE_IDENTIFIER,
      teamIdentifier: TEAM_IDENTIFIER,
      serialNumber: `corbe-${data.odId}-${Date.now()}`,
      organizationName: APP_NAME,
      description: `${APP_NAME} Employee ID`,
      backgroundColor: 'rgb(37, 99, 235)',
      foregroundColor: 'rgb(255, 255, 255)',
      labelColor: 'rgb(219, 234, 254)',
      generic: {
        primaryFields: [
          {
            key: 'employee',
            label: 'EMPLOYEE',
            value: data.odName,
          },
        ],
        secondaryFields: [
          {
            key: 'company',
            label: 'COMPANY',
            value: data.companyName,
          },
        ],
        auxiliaryFields: [
          {
            key: 'status',
            label: 'STATUS',
            value: data.odStatus === 'verified' ? 'Verified' : 'Pending',
          },
        ],
        backFields: [
          {
            key: 'email',
            label: 'Email',
            value: data.email,
          },
          {
            key: 'info',
            label: 'How to use',
            value: 'Show this pass at partner restaurants to receive your corporate discount.',
          },
        ],
      },
      barcodes: [
        {
          format: 'PKBarcodeFormatQR',
          message: `${APP_URL}/show?id=${data.odId}`,
          messageEncoding: 'iso-8859-1',
        },
      ],
    }

    // Create the pass from JSON
    const pass = await PKPass.from(
      {
        model: './pass-template', // This would be a directory with pass assets
        certificates: {
          signerCert,
          signerKey,
          wwdr,
          signerKeyPassphrase,
        },
      },
      passJson
    )

    // Get buffer
    const buffer = pass.getAsBuffer()

    return {
      success: true,
      buffer,
    }
  } catch (error) {
    console.error('Apple Wallet pass generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate pass',
    }
  }
}

/**
 * Get pass template data for preview/demo
 */
export function getPassPreviewData(data: EmployeePassData) {
  return {
    type: 'generic',
    organizationName: APP_NAME,
    description: `${APP_NAME} Employee ID`,
    backgroundColor: '#2563eb',
    foregroundColor: '#ffffff',
    fields: {
      primary: { label: 'EMPLOYEE', value: data.odName },
      secondary: { label: 'COMPANY', value: data.companyName },
      auxiliary: { label: 'STATUS', value: data.odStatus === 'verified' ? 'Verified' : 'Pending' },
    },
    qrCodeUrl: `${APP_URL}/show?id=${data.odId}`,
  }
}
