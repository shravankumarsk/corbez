/**
 * Merchant Security & Compliance Terms
 * Version 1.0 - Effective January 1, 2026
 *
 * These terms outline security, compliance, and operational requirements
 * for merchants partnering with Corbez platform.
 */

export const MERCHANT_SECURITY_TERMS_VERSION = '1.0'
export const MERCHANT_SECURITY_TERMS_EFFECTIVE_DATE = 'January 1, 2026'

export interface SecurityTermsSection {
  title: string
  content: string[]
}

export const MERCHANT_SECURITY_TERMS: SecurityTermsSection[] = [
  {
    title: '1. Data Security & Privacy',
    content: [
      'You agree to protect all customer data (names, emails, phone numbers, order history) with industry-standard security measures.',
      'You will not share, sell, or distribute customer data to third parties without explicit consent.',
      'You agree to comply with applicable data protection regulations including GDPR, CCPA, and other privacy laws.',
      'You will immediately report any data breaches or security incidents to Corbez within 24 hours of discovery.',
      'Employee verification data (company affiliations, employment status) must be kept confidential and used only for discount validation.',
    ],
  },
  {
    title: '2. Business Verification & Compliance',
    content: [
      'You certify that all business information provided (business name, location, license numbers) is accurate and up-to-date.',
      'You maintain all required business licenses, permits, health certifications, and insurance coverage as required by local, state, and federal law.',
      'You will update your business information within 7 days of any changes to licenses, locations, or ownership.',
      'You authorize Corbez to verify your business credentials with relevant authorities and third-party verification services.',
      'You understand that providing false information may result in immediate account suspension and legal action.',
    ],
  },
  {
    title: '3. Payment Processing & Fees',
    content: [
      'You agree to Corbez platform fees and payment terms as outlined in your subscription agreement.',
      'You comply with PCI-DSS standards for payment card data handling (if applicable to your operations).',
      'You understand that chargebacks, refunds, and disputes are your responsibility and may affect your merchant standing.',
      'You will maintain accurate financial records for all transactions processed through the platform.',
      'Platform fees are non-refundable except as explicitly stated in the subscription agreement.',
    ],
  },
  {
    title: '4. Discount & Coupon Management',
    content: [
      'You agree to honor all discounts and promotional offers configured in your merchant dashboard for verified employees.',
      'You will verify employee coupons by scanning QR codes or validating coupon codes at point-of-sale.',
      'You will not discriminate against customers using employee discounts or treat them differently than regular customers.',
      'You may set reasonable restrictions on discounts (e.g., "not valid with other offers", "dine-in only") but must clearly communicate these restrictions.',
      'Fraudulent coupon usage (e.g., accepting invalid coupons, creating fake validations) will result in account suspension.',
      'You will report suspected coupon fraud or abuse to Corbez immediately.',
      'Monthly usage limits and spending thresholds you configure must be honored for the full calendar month.',
    ],
  },
  {
    title: '5. Fraud Prevention & Reporting',
    content: [
      'You agree to cooperate with Corbez fraud prevention and detection efforts.',
      'You will report any suspicious activity, including but not limited to: fake employee accounts, coupon reselling, or coordinated abuse patterns.',
      'You authorize Corbez to suspend or terminate transactions suspected of fraud pending investigation.',
      'You will not collude with employees or third parties to manipulate discounts, generate fake usage, or abuse the platform.',
      'You understand that fraud detection systems may flag legitimate transactions for review, and you agree to provide documentation when requested.',
    ],
  },
  {
    title: '6. Liability & Indemnification',
    content: [
      'You maintain general liability insurance with minimum coverage amounts as specified by local regulations.',
      'You indemnify and hold harmless Corbez, its employees, and affiliates from any claims arising from your business operations, including food safety issues, customer injuries, or employment disputes.',
      'Corbez is not liable for lost revenue, customer disputes, or business interruptions related to platform usage.',
      'You are responsible for all taxes, fees, and regulatory compliance related to your business operations.',
      'Any disputes will be resolved through binding arbitration in accordance with the master services agreement.',
    ],
  },
  {
    title: '7. Account Suspension & Termination',
    content: [
      'Corbez reserves the right to suspend or terminate your merchant account for violations of these terms, including but not limited to: fraud, data breaches, failure to honor discounts, or providing false information.',
      'Upon suspension, you will lose access to the platform and all active coupons will be invalidated.',
      'You may appeal suspensions by contacting merchant support with documentation within 14 days.',
      'Termination for cause (fraud, legal violations) is immediate and permanent without refund of subscription fees.',
      'You may voluntarily terminate your account at any time, subject to the cancellation terms in your subscription agreement.',
      'Upon termination, you must delete all customer data obtained through the platform within 30 days.',
    ],
  },
]

/**
 * Get plain text version of security terms
 * Useful for email notifications, PDF generation, etc.
 */
export function getSecurityTermsText(): string {
  const header = `MERCHANT SECURITY & COMPLIANCE TERMS
Version ${MERCHANT_SECURITY_TERMS_VERSION}
Effective Date: ${MERCHANT_SECURITY_TERMS_EFFECTIVE_DATE}

These terms outline security, compliance, and operational requirements for merchants partnering with Corbez platform.

`

  const body = MERCHANT_SECURITY_TERMS.map((section) => {
    const bullets = section.content.map((item) => `  • ${item}`).join('\n')
    return `${section.title}\n${bullets}\n`
  }).join('\n')

  const footer = `
By accepting these terms, you acknowledge that you have read, understood, and agree to comply with all requirements outlined above. Failure to comply may result in account suspension or termination.

For questions or concerns, contact merchant-support@corbez.com`

  return header + body + footer
}

/**
 * Get security terms metadata
 */
export function getSecurityTermsMetadata() {
  return {
    version: MERCHANT_SECURITY_TERMS_VERSION,
    effectiveDate: MERCHANT_SECURITY_TERMS_EFFECTIVE_DATE,
    sectionsCount: MERCHANT_SECURITY_TERMS.length,
    totalRequirements: MERCHANT_SECURITY_TERMS.reduce(
      (sum, section) => sum + section.content.length,
      0
    ),
  }
}
