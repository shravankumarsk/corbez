import { GoogleAuth } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import path from 'path'
import fs from 'fs'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Corbe'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Google Wallet configuration
const CREDENTIALS_PATH = process.env.GOOGLE_WALLET_CREDENTIALS_PATH || path.join(process.cwd(), 'credentials', 'google-wallet-key.json')
const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID || ''
const CLASS_ID = `${ISSUER_ID}.corbe_employee_pass`

export interface EmployeePassData {
  odId: string
  odName: string
  email: string
  companyName: string
  odStatus: 'verified' | 'pending'
}

interface GoogleWalletResult {
  success: boolean
  saveUrl?: string
  error?: string
  configured?: boolean
}

interface ServiceAccountCredentials {
  client_email: string
  private_key: string
}

/**
 * Check if Google Wallet is configured
 */
export function isGoogleWalletConfigured(): boolean {
  try {
    if (!ISSUER_ID) return false
    return fs.existsSync(CREDENTIALS_PATH)
  } catch {
    return false
  }
}

/**
 * Load service account credentials
 */
function loadCredentials(): ServiceAccountCredentials | null {
  try {
    const credentialsJson = fs.readFileSync(CREDENTIALS_PATH, 'utf8')
    return JSON.parse(credentialsJson)
  } catch {
    return null
  }
}

/**
 * Create the pass class (template) - should be done once during setup
 */
export async function createPassClass(): Promise<{ success: boolean; error?: string }> {
  if (!isGoogleWalletConfigured()) {
    return { success: false, error: 'Google Wallet not configured' }
  }

  const credentials = loadCredentials()
  if (!credentials) {
    return { success: false, error: 'Failed to load credentials' }
  }

  const classDefinition = {
    id: CLASS_ID,
    issuerName: APP_NAME,
    reviewStatus: 'UNDER_REVIEW',
    textModulesData: [
      {
        header: 'How to use',
        body: 'Show this pass at partner restaurants to receive your corporate discount. Staff will scan the QR code to verify.',
      },
    ],
    linksModuleData: {
      uris: [
        {
          uri: APP_URL,
          description: 'Visit Corbe',
        },
      ],
    },
    imageModulesData: [],
    hexBackgroundColor: '#2563eb',
    heroImage: {
      sourceUri: {
        uri: `${APP_URL}/wallet/hero.png`,
      },
    },
    classTemplateInfo: {
      cardTemplateOverride: {
        cardRowTemplateInfos: [
          {
            twoItems: {
              startItem: {
                firstValue: {
                  fields: [{ fieldPath: "object.textModulesData['company']" }],
                },
              },
              endItem: {
                firstValue: {
                  fields: [{ fieldPath: "object.textModulesData['status']" }],
                },
              },
            },
          },
        ],
      },
    },
  }

  try {
    const auth = new GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
    })

    const client = await auth.getClient()
    const response = await client.request({
      url: 'https://walletobjects.googleapis.com/walletobjects/v1/genericClass',
      method: 'POST',
      data: classDefinition,
    })

    return { success: true }
  } catch (error: any) {
    // Class might already exist
    if (error?.response?.status === 409) {
      return { success: true }
    }
    console.error('Failed to create pass class:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Generate a "Save to Google Wallet" URL for an employee
 */
export async function generateGoogleWalletUrl(data: EmployeePassData): Promise<GoogleWalletResult> {
  if (!isGoogleWalletConfigured()) {
    return {
      success: false,
      configured: false,
      error: 'Google Wallet not configured. Please set up your Google Cloud credentials.',
    }
  }

  const credentials = loadCredentials()
  if (!credentials) {
    return { success: false, error: 'Failed to load credentials' }
  }

  try {
    // Create the pass object
    const objectId = `${ISSUER_ID}.${data.odId.replace(/[^a-zA-Z0-9_.-]/g, '_')}`

    const passObject = {
      id: objectId,
      classId: CLASS_ID,
      state: 'ACTIVE',
      heroImage: {
        sourceUri: {
          uri: `${APP_URL}/wallet/hero.png`,
        },
      },
      textModulesData: [
        {
          id: 'employee',
          header: 'EMPLOYEE',
          body: data.odName,
        },
        {
          id: 'company',
          header: 'COMPANY',
          body: data.companyName,
        },
        {
          id: 'status',
          header: 'STATUS',
          body: data.odStatus === 'verified' ? 'Verified' : 'Pending',
        },
        {
          id: 'email',
          header: 'Email',
          body: data.email,
        },
      ],
      barcode: {
        type: 'QR_CODE',
        value: `${APP_URL}/show?id=${data.odId}`,
        alternateText: 'Scan to verify',
      },
      cardTitle: {
        defaultValue: {
          language: 'en',
          value: APP_NAME,
        },
      },
      subheader: {
        defaultValue: {
          language: 'en',
          value: 'Employee ID',
        },
      },
      header: {
        defaultValue: {
          language: 'en',
          value: data.odName,
        },
      },
      hexBackgroundColor: '#2563eb',
    }

    // Create the JWT claims
    const claims = {
      iss: credentials.client_email,
      aud: 'google',
      origins: [APP_URL],
      typ: 'savetowallet',
      payload: {
        genericObjects: [passObject],
      },
    }

    // Sign the JWT
    const token = jwt.sign(claims, credentials.private_key, { algorithm: 'RS256' })

    // Generate the save URL
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`

    return {
      success: true,
      saveUrl,
      configured: true,
    }
  } catch (error) {
    console.error('Google Wallet URL generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate wallet URL',
    }
  }
}

/**
 * Get preview data when Google Wallet is not configured
 */
export function getGoogleWalletPreviewData(data: EmployeePassData) {
  return {
    type: 'generic',
    issuerName: APP_NAME,
    backgroundColor: '#2563eb',
    fields: {
      header: data.odName,
      subheader: 'Employee ID',
      company: data.companyName,
      status: data.odStatus === 'verified' ? 'Verified' : 'Pending',
    },
    qrCodeUrl: `${APP_URL}/show?id=${data.odId}`,
  }
}
