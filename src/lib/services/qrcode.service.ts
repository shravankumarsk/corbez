import QRCode from 'qrcode'
import crypto from 'crypto'
import { cache } from '@/lib/cache/redis'

export interface QRCodeOptions {
  width?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
}

export interface CouponQRData {
  type: 'coupon'
  couponId: string
  code: string
  employeeId: string
  merchantId: string
  discountId: string
  expiresAt?: string // Optional - null = never expires
  signature: string
}

export interface EmployeePassQRData {
  type: 'employee_pass'
  passId: string
  userId: string
  employeeId: string
  companyId: string
  issuedAt: string
  signature: string
}

const DEFAULT_OPTIONS: QRCodeOptions = {
  width: 300,
  margin: 2,
  color: {
    dark: '#1a1a2e',
    light: '#ffffff',
  },
  errorCorrectionLevel: 'M',
}

// Secret for signing QR codes (should be in env)
const QR_SECRET = process.env.QR_SECRET || 'corbe-qr-secret-key-change-in-production'

class QRCodeService {
  /**
   * Generate a cryptographic signature for QR data
   */
  private generateSignature(data: Record<string, unknown>): string {
    const payload = JSON.stringify(data)
    return crypto
      .createHmac('sha256', QR_SECRET)
      .update(payload)
      .digest('hex')
      .substring(0, 16) // Shorter signature for QR efficiency
  }

  /**
   * Verify a QR code signature
   */
  verifySignature(data: Record<string, unknown>, signature: string): boolean {
    const expectedSignature = this.generateSignature(data)
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  }

  /**
   * Generate unique coupon code
   */
  generateCouponCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  /**
   * Generate QR code as Data URL (base64)
   */
  async generateDataURL(data: string, options?: QRCodeOptions): Promise<string> {
    const opts = { ...DEFAULT_OPTIONS, ...options }
    return QRCode.toDataURL(data, {
      width: opts.width,
      margin: opts.margin,
      color: opts.color,
      errorCorrectionLevel: opts.errorCorrectionLevel,
    })
  }

  /**
   * Generate QR code as SVG string
   */
  async generateSVG(data: string, options?: QRCodeOptions): Promise<string> {
    const opts = { ...DEFAULT_OPTIONS, ...options }
    return QRCode.toString(data, {
      type: 'svg',
      width: opts.width,
      margin: opts.margin,
      color: opts.color,
      errorCorrectionLevel: opts.errorCorrectionLevel,
    })
  }

  /**
   * Generate QR code as PNG buffer
   */
  async generatePNG(data: string, options?: QRCodeOptions): Promise<Buffer> {
    const opts = { ...DEFAULT_OPTIONS, ...options }
    return QRCode.toBuffer(data, {
      type: 'png',
      width: opts.width,
      margin: opts.margin,
      color: opts.color,
      errorCorrectionLevel: opts.errorCorrectionLevel,
    })
  }

  /**
   * Create a coupon QR code
   */
  async createCouponQR(params: {
    couponId: string
    employeeId: string
    merchantId: string
    discountId: string
    expiresAt: Date | null
  }): Promise<{
    code: string
    qrDataUrl: string
    qrSvg: string
    verificationUrl: string
    data: CouponQRData
  }> {
    const code = this.generateCouponCode()

    const qrData: Omit<CouponQRData, 'signature'> = {
      type: 'coupon',
      couponId: params.couponId,
      code,
      employeeId: params.employeeId,
      merchantId: params.merchantId,
      discountId: params.discountId,
      expiresAt: params.expiresAt?.toISOString(), // undefined if null (no expiry)
    }

    const signature = this.generateSignature(qrData)
    const fullData: CouponQRData = { ...qrData, signature }

    // Create verification URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://corbez.com'
    const verificationUrl = `${baseUrl}/verify/coupon/${code}?s=${signature}`

    // Generate QR codes
    const [qrDataUrl, qrSvg] = await Promise.all([
      this.generateDataURL(verificationUrl, { width: 300 }),
      this.generateSVG(verificationUrl, { width: 300 }),
    ])

    // Cache the coupon data for quick verification
    await cache.set(`coupon:code:${code}`, fullData, 86400 * 7) // 7 days

    return {
      code,
      qrDataUrl,
      qrSvg,
      verificationUrl,
      data: fullData,
    }
  }

  /**
   * Create an employee pass QR code (for general verification)
   */
  async createEmployeePassQR(params: {
    passId: string
    userId: string
    employeeId: string
    companyId: string
  }): Promise<{
    qrDataUrl: string
    qrSvg: string
    verificationUrl: string
    data: EmployeePassQRData
  }> {
    const qrData: Omit<EmployeePassQRData, 'signature'> = {
      type: 'employee_pass',
      passId: params.passId,
      userId: params.userId,
      employeeId: params.employeeId,
      companyId: params.companyId,
      issuedAt: new Date().toISOString(),
    }

    const signature = this.generateSignature(qrData)
    const fullData: EmployeePassQRData = { ...qrData, signature }

    // Create verification URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://corbez.com'
    const verificationUrl = `${baseUrl}/verify/employee/${params.passId}?s=${signature}`

    // Generate QR codes
    const [qrDataUrl, qrSvg] = await Promise.all([
      this.generateDataURL(verificationUrl, { width: 300 }),
      this.generateSVG(verificationUrl, { width: 300 }),
    ])

    // Cache the pass data
    await cache.set(`pass:${params.passId}`, fullData, 86400 * 30) // 30 days

    return {
      qrDataUrl,
      qrSvg,
      verificationUrl,
      data: fullData,
    }
  }

  /**
   * Verify a coupon code
   */
  async verifyCouponCode(code: string, signature: string): Promise<{
    valid: boolean
    data?: CouponQRData
    error?: string
  }> {
    // Get from cache
    const cached = await cache.get<CouponQRData>(`coupon:code:${code}`)

    if (!cached) {
      return { valid: false, error: 'Coupon not found or expired' }
    }

    // Verify signature
    const { signature: storedSig, ...dataWithoutSig } = cached
    if (!this.verifySignature(dataWithoutSig, signature)) {
      return { valid: false, error: 'Invalid signature' }
    }

    // Check expiration (only if expiresAt is set)
    if (cached.expiresAt && new Date(cached.expiresAt) < new Date()) {
      return { valid: false, error: 'Coupon has expired' }
    }

    return { valid: true, data: cached }
  }

  /**
   * Generate a simple QR code for any URL
   */
  async generateSimpleQR(
    url: string,
    options?: QRCodeOptions
  ): Promise<{ dataUrl: string; svg: string }> {
    const [dataUrl, svg] = await Promise.all([
      this.generateDataURL(url, options),
      this.generateSVG(url, options),
    ])
    return { dataUrl, svg }
  }

  /**
   * Generate QR code with branded styling
   */
  async generateBrandedQR(
    url: string,
    style: 'primary' | 'dark' | 'light' = 'primary'
  ): Promise<string> {
    const colors = {
      primary: { dark: '#f97316', light: '#ffffff' }, // Orange
      dark: { dark: '#1a1a2e', light: '#ffffff' },
      light: { dark: '#374151', light: '#f9fafb' },
    }

    return this.generateDataURL(url, {
      width: 300,
      margin: 2,
      color: colors[style],
      errorCorrectionLevel: 'H', // Higher error correction for logos
    })
  }
}

export const qrcodeService = new QRCodeService()
export default qrcodeService
