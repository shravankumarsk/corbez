import { connectDB } from '@/lib/db/mongoose'
import { ClaimedCoupon } from '@/lib/db/models/claimed-coupon.model'
import { Employee } from '@/lib/db/models/employee.model'
import { Merchant } from '@/lib/db/models/merchant.model'
import { audit, AuditAction, AuditSeverity } from '@/lib/audit/logger'

export interface FraudAlert {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  type: string
  description: string
  targetId: string
  targetType: 'Employee' | 'Merchant' | 'Company'
  evidence: Record<string, unknown>
  recommendedAction: string
}

class FraudDetectionService {
  /**
   * Check if employee behavior is suspicious
   */
  async detectEmployeeFraud(employeeId: string): Promise<FraudAlert[]> {
    const alerts: FraudAlert[] = []
    await connectDB()

    // Check 1: Excessive coupon claiming (>10 in last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentClaims = await ClaimedCoupon.countDocuments({
      employeeId,
      createdAt: { $gte: last24Hours },
    })

    if (recentClaims > 10) {
      alerts.push({
        severity: 'HIGH',
        type: 'EXCESSIVE_CLAIMING',
        description: `Employee claimed ${recentClaims} coupons in last 24 hours`,
        targetId: employeeId,
        targetType: 'Employee',
        evidence: { claimCount: recentClaims, timeWindow: '24h' },
        recommendedAction: 'Review and potentially suspend account',
      })
    }

    // Check 2: Rapid claiming (>3 claims in last 5 minutes)
    const last5Minutes = new Date(Date.now() - 5 * 60 * 1000)
    const rapidClaims = await ClaimedCoupon.countDocuments({
      employeeId,
      createdAt: { $gte: last5Minutes },
    })

    if (rapidClaims > 3) {
      alerts.push({
        severity: 'MEDIUM',
        type: 'RAPID_CLAIMING',
        description: `Employee claimed ${rapidClaims} coupons in last 5 minutes`,
        targetId: employeeId,
        targetType: 'Employee',
        evidence: { claimCount: rapidClaims, timeWindow: '5min' },
        recommendedAction: 'Monitor closely, may be legitimate bulk claiming',
      })
    }

    // Check 3: Redemption without claiming (potential sharing)
    // This would require tracking redemptions separately
    // TODO: Implement when redemption tracking is added

    // Check 4: Multiple devices/IPs (potential account sharing)
    // TODO: Implement IP/device tracking

    return alerts
  }

  /**
   * Check if merchant behavior is suspicious
   */
  async detectMerchantFraud(merchantId: string): Promise<FraudAlert[]> {
    const alerts: FraudAlert[] = []
    await connectDB()

    const merchant = await Merchant.findById(merchantId)
    if (!merchant) return alerts

    // Check 1: New merchant with no website
    const daysSinceCreation = (Date.now() - merchant.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceCreation < 7 && !merchant.website) {
      alerts.push({
        severity: 'MEDIUM',
        type: 'NEW_NO_WEBSITE',
        description: 'New merchant without verified website',
        targetId: merchantId,
        targetType: 'Merchant',
        evidence: { daysSinceCreation, hasWebsite: false },
        recommendedAction: 'Request additional verification (business license, etc.)',
      })
    }

    // Check 2: Suspicious email domain
    if (merchant.contactEmail?.includes('temp') || merchant.contactEmail?.includes('disposable')) {
      alerts.push({
        severity: 'HIGH',
        type: 'SUSPICIOUS_EMAIL',
        description: 'Merchant using temporary/disposable email',
        targetId: merchantId,
        targetType: 'Merchant',
        evidence: { email: merchant.contactEmail },
        recommendedAction: 'Require business email verification',
      })
    }

    // Check 3: Excessive discount percentage (>75%)
    // TODO: Check discounts when discount model is available

    // Check 4: Zero redemptions (inactive merchant)
    const redemptionCount = await ClaimedCoupon.countDocuments({
      merchantId,
      status: 'REDEEMED',
    })
    if (merchant.status === 'ACTIVE' && redemptionCount === 0 && daysSinceCreation > 30) {
      alerts.push({
        severity: 'LOW',
        type: 'NO_REDEMPTIONS',
        description: 'Active merchant with zero redemptions in 30+ days',
        targetId: merchantId,
        targetType: 'Merchant',
        evidence: { daysSinceCreation, redemptionCount: 0 },
        recommendedAction: 'Contact merchant to verify they are honoring discounts',
      })
    }

    return alerts
  }

  /**
   * Validate coupon claim to prevent abuse
   */
  async validateCouponClaim(employeeId: string, merchantId: string): Promise<{
    allowed: boolean
    reason?: string
    severity?: 'INFO' | 'WARNING' | 'BLOCK'
  }> {
    await connectDB()

    // Check 1: Employee already has active coupon for this merchant
    const existingCoupon = await ClaimedCoupon.findOne({
      employeeId,
      merchantId,
      status: 'ACTIVE',
    })

    if (existingCoupon) {
      return {
        allowed: false,
        reason: 'You already have an active coupon for this merchant',
        severity: 'BLOCK',
      }
    }

    // Check 2: Check for suspicious claiming patterns
    const fraudAlerts = await this.detectEmployeeFraud(employeeId)
    const highSeverityAlerts = fraudAlerts.filter(a => a.severity === 'HIGH' || a.severity === 'CRITICAL')

    if (highSeverityAlerts.length > 0) {
      // Log to audit
      await audit(AuditAction.FRAUD_DETECTED, {
        performedBy: employeeId,
        targetId: employeeId,
        targetType: 'Employee',
        severity: AuditSeverity.CRITICAL,
        metadata: {
          alerts: highSeverityAlerts,
          action: 'coupon_claim_blocked',
        },
      })

      return {
        allowed: false,
        reason: 'Your account has been flagged for suspicious activity. Please contact support.',
        severity: 'BLOCK',
      }
    }

    // Check 3: Employee status
    const employee = await Employee.findById(employeeId)
    if (!employee) {
      return { allowed: false, reason: 'Employee not found', severity: 'BLOCK' }
    }

    if (employee.status !== 'ACTIVE') {
      return {
        allowed: false,
        reason: 'Your account is not active. Please contact your company admin.',
        severity: 'BLOCK',
      }
    }

    // All checks passed
    return { allowed: true }
  }

  /**
   * Monitor and alert on system-wide anomalies
   */
  async detectSystemAnomalies(): Promise<FraudAlert[]> {
    const alerts: FraudAlert[] = []
    await connectDB()

    // Check 1: Spike in coupon claims (>100 in last hour)
    const lastHour = new Date(Date.now() - 60 * 60 * 1000)
    const recentClaims = await ClaimedCoupon.countDocuments({
      createdAt: { $gte: lastHour },
    })

    if (recentClaims > 100) {
      alerts.push({
        severity: 'MEDIUM',
        type: 'CLAIM_SPIKE',
        description: `Unusual spike in coupon claims: ${recentClaims} in last hour`,
        targetId: 'system',
        targetType: 'Company',
        evidence: { claimCount: recentClaims, timeWindow: '1h' },
        recommendedAction: 'Monitor for coordinated abuse',
      })
    }

    // Check 2: High failure rate (>50 failed claims in last hour)
    // TODO: Implement failed claim tracking

    // Check 3: Unusual geographic patterns
    // TODO: Implement when IP geolocation is added

    return alerts
  }

  /**
   * Get fraud risk score for an employee (0-100)
   */
  async getEmployeeRiskScore(employeeId: string): Promise<number> {
    const alerts = await this.detectEmployeeFraud(employeeId)

    let score = 0
    alerts.forEach(alert => {
      switch (alert.severity) {
        case 'CRITICAL':
          score += 40
          break
        case 'HIGH':
          score += 25
          break
        case 'MEDIUM':
          score += 15
          break
        case 'LOW':
          score += 5
          break
      }
    })

    return Math.min(score, 100)
  }

  /**
   * Get fraud risk score for a merchant (0-100)
   */
  async getMerchantRiskScore(merchantId: string): Promise<number> {
    const alerts = await this.detectMerchantFraud(merchantId)

    let score = 0
    alerts.forEach(alert => {
      switch (alert.severity) {
        case 'CRITICAL':
          score += 40
          break
        case 'HIGH':
          score += 25
          break
        case 'MEDIUM':
          score += 15
          break
        case 'LOW':
          score += 5
          break
      }
    })

    return Math.min(score, 100)
  }
}

export const fraudDetection = new FraudDetectionService()
