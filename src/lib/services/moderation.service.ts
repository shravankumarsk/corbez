import { connectDB } from '@/lib/db/mongoose'
import { Employee, EmployeeStatus, IEmployee } from '@/lib/db/models/employee.model'
import { Merchant, MerchantStatus, IMerchant } from '@/lib/db/models/merchant.model'
import { Company, CompanyStatus } from '@/lib/db/models/company.model'
import { ClaimedCoupon, CouponStatus } from '@/lib/db/models/claimed-coupon.model'
import {
  ModerationAction,
  ModerationActionType,
  ModerationTargetType,
  ModerationReason,
  IModerationAction,
} from '@/lib/db/models/moderation-action.model'
import { eventBus, EventType } from '@/lib/events'
import { cache } from '@/lib/cache/redis'
import { audit, AuditAction, AuditSeverity } from '@/lib/audit/logger'
import { Types } from 'mongoose'

export interface SuspendOptions {
  reason: ModerationReason
  reasonDetails?: string
  duration?: {
    value: number
    unit: 'hours' | 'days' | 'weeks' | 'months' | 'permanent'
  }
  evidence?: {
    description: string
    attachments?: string[]
    metadata?: Record<string, unknown>
  }
  notifyUser?: boolean
}

export interface ModerationResult {
  success: boolean
  action?: IModerationAction
  error?: string
}

/**
 * Calculate expiration date from duration
 */
function calculateExpiresAt(duration?: SuspendOptions['duration']): Date | undefined {
  if (!duration || duration.unit === 'permanent') return undefined

  const now = new Date()
  switch (duration.unit) {
    case 'hours':
      return new Date(now.getTime() + duration.value * 60 * 60 * 1000)
    case 'days':
      return new Date(now.getTime() + duration.value * 24 * 60 * 60 * 1000)
    case 'weeks':
      return new Date(now.getTime() + duration.value * 7 * 24 * 60 * 60 * 1000)
    case 'months':
      return new Date(now.setMonth(now.getMonth() + duration.value))
    default:
      return undefined
  }
}

class ModerationService {
  /**
   * Check if an employee can access features (QR codes, wallet passes, coupons)
   * Only ACTIVE status employees have full access
   */
  async canAccessFeatures(employeeId: string): Promise<{
    canAccess: boolean
    reason?: string
    status: EmployeeStatus
  }> {
    await connectDB()
    const employee = await Employee.findById(employeeId).lean() as IEmployee | null

    if (!employee) {
      return { canAccess: false, reason: 'Employee not found', status: EmployeeStatus.INACTIVE }
    }

    switch (employee.status) {
      case EmployeeStatus.ACTIVE:
        return { canAccess: true, status: EmployeeStatus.ACTIVE }

      case EmployeeStatus.PENDING:
        return {
          canAccess: false,
          reason: 'Account pending activation',
          status: EmployeeStatus.PENDING,
        }

      case EmployeeStatus.SUSPENDED:
        const suspendedUntil = employee.suspendedUntil
          ? new Date(employee.suspendedUntil).toLocaleDateString()
          : 'indefinitely'
        return {
          canAccess: false,
          reason: `Account suspended until ${suspendedUntil}. Reason: ${employee.suspendedReason || 'Policy violation'}`,
          status: EmployeeStatus.SUSPENDED,
        }

      case EmployeeStatus.BANNED:
        return {
          canAccess: false,
          reason: 'Account permanently banned',
          status: EmployeeStatus.BANNED,
        }

      case EmployeeStatus.INACTIVE:
        return {
          canAccess: false,
          reason: 'Account inactive',
          status: EmployeeStatus.INACTIVE,
        }

      default:
        return { canAccess: false, reason: 'Unknown status', status: employee.status }
    }
  }

  /**
   * Check if a merchant can accept redemptions
   */
  async canMerchantOperate(merchantId: string): Promise<{
    canOperate: boolean
    reason?: string
    status: MerchantStatus
  }> {
    await connectDB()
    const merchant = await Merchant.findById(merchantId).lean() as IMerchant | null

    if (!merchant) {
      return { canOperate: false, reason: 'Merchant not found', status: MerchantStatus.SUSPENDED }
    }

    if (merchant.status === MerchantStatus.ACTIVE) {
      return { canOperate: true, status: MerchantStatus.ACTIVE }
    }

    return {
      canOperate: false,
      reason: `Merchant is ${merchant.status.toLowerCase()}`,
      status: merchant.status,
    }
  }

  // ==================== EMPLOYEE MODERATION ====================

  /**
   * Issue a warning to an employee
   */
  async warnEmployee(
    employeeId: string,
    performedBy: string,
    performedByRole: string,
    options: Omit<SuspendOptions, 'duration'>
  ): Promise<ModerationResult> {
    await connectDB()

    const employee = await Employee.findById(employeeId)
    if (!employee) {
      return { success: false, error: 'Employee not found' }
    }

    // Increment warning count
    const previousState = { warningCount: employee.warningCount, status: employee.status }
    employee.warningCount = (employee.warningCount || 0) + 1
    await employee.save()

    // Create moderation action
    const action = await ModerationAction.create({
      performedBy: new Types.ObjectId(performedBy),
      performedByRole,
      actionType: ModerationActionType.WARNING_ISSUED,
      reason: options.reason,
      reasonDetails: options.reasonDetails,
      targetType: ModerationTargetType.EMPLOYEE,
      targetId: employee._id,
      evidence: options.evidence,
      previousState,
      newState: { warningCount: employee.warningCount, status: employee.status },
      appealable: false,
      notificationSent: options.notifyUser ?? true,
    })

    // Auto-suspend after 3 warnings
    if (employee.warningCount >= 3) {
      await this.suspendEmployee(employeeId, performedBy, performedByRole, {
        reason: ModerationReason.TERMS_VIOLATION,
        reasonDetails: 'Automatic suspension after 3 warnings',
        duration: { value: 7, unit: 'days' },
      })
    }

    // Log audit
    audit.withUser({ id: performedBy }).warn(
      AuditAction.SETTINGS_CHANGED,
      `Warning issued to employee ${employee.firstName} ${employee.lastName}`,
      { employeeId, reason: options.reason, warningCount: employee.warningCount }
    )

    return { success: true, action }
  }

  /**
   * Suspend an employee
   */
  async suspendEmployee(
    employeeId: string,
    performedBy: string,
    performedByRole: string,
    options: SuspendOptions
  ): Promise<ModerationResult> {
    await connectDB()

    const employee = await Employee.findById(employeeId)
    if (!employee) {
      return { success: false, error: 'Employee not found' }
    }

    if (employee.status === EmployeeStatus.BANNED) {
      return { success: false, error: 'Cannot suspend a banned employee' }
    }

    const previousState = {
      status: employee.status,
      suspendedAt: employee.suspendedAt,
      suspendedReason: employee.suspendedReason,
    }

    const expiresAt = calculateExpiresAt(options.duration)

    // Update employee status
    employee.status = EmployeeStatus.SUSPENDED
    employee.suspendedAt = new Date()
    employee.suspendedBy = new Types.ObjectId(performedBy)
    employee.suspendedReason = options.reasonDetails || options.reason
    employee.suspendedUntil = expiresAt
    await employee.save()

    // Cancel all active coupons
    await ClaimedCoupon.updateMany(
      { employeeId: employee._id, status: CouponStatus.ACTIVE },
      { $set: { status: CouponStatus.CANCELLED } }
    )

    // Create moderation action
    const action = await ModerationAction.create({
      performedBy: new Types.ObjectId(performedBy),
      performedByRole,
      actionType: ModerationActionType.SUSPENDED,
      reason: options.reason,
      reasonDetails: options.reasonDetails,
      targetType: ModerationTargetType.EMPLOYEE,
      targetId: employee._id,
      duration: options.duration,
      expiresAt,
      evidence: options.evidence,
      previousState,
      newState: { status: EmployeeStatus.SUSPENDED, suspendedUntil: expiresAt },
      appealable: true,
      appealDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days to appeal
      notificationSent: options.notifyUser ?? true,
    })

    // Invalidate caches
    await cache.del(`employee:${employeeId}`)
    await cache.del(`user:${employee.userId}`)

    // Log audit
    audit.withUser({ id: performedBy }).log({
      action: AuditAction.EMPLOYEE_REMOVED,
      severity: AuditSeverity.WARNING,
      description: `Employee suspended: ${employee.firstName} ${employee.lastName}`,
      resource: 'Employee',
      resourceId: employeeId,
      metadata: { reason: options.reason, duration: options.duration },
    })

    return { success: true, action }
  }

  /**
   * Unsuspend an employee
   */
  async unsuspendEmployee(
    employeeId: string,
    performedBy: string,
    performedByRole: string,
    notes?: string
  ): Promise<ModerationResult> {
    await connectDB()

    const employee = await Employee.findById(employeeId)
    if (!employee) {
      return { success: false, error: 'Employee not found' }
    }

    if (employee.status !== EmployeeStatus.SUSPENDED) {
      return { success: false, error: 'Employee is not suspended' }
    }

    const previousState = { status: employee.status }

    employee.status = EmployeeStatus.ACTIVE
    employee.suspendedAt = undefined
    employee.suspendedBy = undefined
    employee.suspendedReason = undefined
    employee.suspendedUntil = undefined
    await employee.save()

    const action = await ModerationAction.create({
      performedBy: new Types.ObjectId(performedBy),
      performedByRole,
      actionType: ModerationActionType.UNSUSPENDED,
      reason: ModerationReason.ADMIN_DECISION,
      reasonDetails: notes,
      targetType: ModerationTargetType.EMPLOYEE,
      targetId: employee._id,
      previousState,
      newState: { status: EmployeeStatus.ACTIVE },
      appealable: false,
      notificationSent: true,
    })

    await cache.del(`employee:${employeeId}`)

    return { success: true, action }
  }

  /**
   * Ban an employee permanently
   */
  async banEmployee(
    employeeId: string,
    performedBy: string,
    performedByRole: string,
    options: Omit<SuspendOptions, 'duration'>
  ): Promise<ModerationResult> {
    await connectDB()

    const employee = await Employee.findById(employeeId)
    if (!employee) {
      return { success: false, error: 'Employee not found' }
    }

    const previousState = { status: employee.status }

    employee.status = EmployeeStatus.BANNED
    employee.bannedAt = new Date()
    employee.bannedBy = new Types.ObjectId(performedBy)
    employee.bannedReason = options.reasonDetails || options.reason
    await employee.save()

    // Cancel all coupons
    await ClaimedCoupon.updateMany(
      { employeeId: employee._id },
      { $set: { status: CouponStatus.CANCELLED } }
    )

    const action = await ModerationAction.create({
      performedBy: new Types.ObjectId(performedBy),
      performedByRole,
      actionType: ModerationActionType.BANNED,
      reason: options.reason,
      reasonDetails: options.reasonDetails,
      targetType: ModerationTargetType.EMPLOYEE,
      targetId: employee._id,
      duration: { value: 0, unit: 'permanent' },
      evidence: options.evidence,
      previousState,
      newState: { status: EmployeeStatus.BANNED },
      appealable: true,
      appealDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days to appeal
      notificationSent: options.notifyUser ?? true,
    })

    await cache.del(`employee:${employeeId}`)

    audit.withUser({ id: performedBy }).log({
      action: AuditAction.EMPLOYEE_REMOVED,
      severity: AuditSeverity.CRITICAL,
      description: `Employee banned: ${employee.firstName} ${employee.lastName}`,
      resource: 'Employee',
      resourceId: employeeId,
      metadata: { reason: options.reason },
    })

    return { success: true, action }
  }

  // ==================== MERCHANT MODERATION ====================

  /**
   * Suspend a merchant
   */
  async suspendMerchant(
    merchantId: string,
    performedBy: string,
    performedByRole: string,
    options: SuspendOptions
  ): Promise<ModerationResult> {
    await connectDB()

    const merchant = await Merchant.findById(merchantId)
    if (!merchant) {
      return { success: false, error: 'Merchant not found' }
    }

    const previousState = { status: merchant.status }
    const expiresAt = calculateExpiresAt(options.duration)

    merchant.status = MerchantStatus.SUSPENDED
    await merchant.save()

    const action = await ModerationAction.create({
      performedBy: new Types.ObjectId(performedBy),
      performedByRole,
      actionType: ModerationActionType.SUSPENDED,
      reason: options.reason,
      reasonDetails: options.reasonDetails,
      targetType: ModerationTargetType.MERCHANT,
      targetId: merchant._id,
      duration: options.duration,
      expiresAt,
      evidence: options.evidence,
      previousState,
      newState: { status: MerchantStatus.SUSPENDED },
      appealable: true,
      appealDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      notificationSent: options.notifyUser ?? true,
    })

    await cache.invalidate(`merchant:${merchantId}:*`)

    audit.withUser({ id: performedBy }).log({
      action: AuditAction.MERCHANT_UPDATED,
      severity: AuditSeverity.WARNING,
      description: `Merchant suspended: ${merchant.businessName}`,
      resource: 'Merchant',
      resourceId: merchantId,
      metadata: { reason: options.reason },
    })

    return { success: true, action }
  }

  /**
   * Reactivate a merchant
   */
  async reactivateMerchant(
    merchantId: string,
    performedBy: string,
    performedByRole: string,
    notes?: string
  ): Promise<ModerationResult> {
    await connectDB()

    const merchant = await Merchant.findById(merchantId)
    if (!merchant) {
      return { success: false, error: 'Merchant not found' }
    }

    if (merchant.status === MerchantStatus.ACTIVE) {
      return { success: false, error: 'Merchant is already active' }
    }

    const previousState = { status: merchant.status }
    merchant.status = MerchantStatus.ACTIVE
    await merchant.save()

    const action = await ModerationAction.create({
      performedBy: new Types.ObjectId(performedBy),
      performedByRole,
      actionType: ModerationActionType.ACTIVATED,
      reason: ModerationReason.ADMIN_DECISION,
      reasonDetails: notes,
      targetType: ModerationTargetType.MERCHANT,
      targetId: merchant._id,
      previousState,
      newState: { status: MerchantStatus.ACTIVE },
      appealable: false,
      notificationSent: true,
    })

    await cache.invalidate(`merchant:${merchantId}:*`)

    return { success: true, action }
  }

  // ==================== COMPANY MODERATION ====================

  /**
   * Suspend a company (affects all employees)
   */
  async suspendCompany(
    companyId: string,
    performedBy: string,
    performedByRole: string,
    options: SuspendOptions
  ): Promise<ModerationResult> {
    await connectDB()

    const company = await Company.findById(companyId)
    if (!company) {
      return { success: false, error: 'Company not found' }
    }

    const previousState = { status: company.status }
    company.status = CompanyStatus.SUSPENDED
    await company.save()

    // Deactivate all employees
    await Employee.updateMany(
      { companyId: company._id, status: EmployeeStatus.ACTIVE },
      { $set: { status: EmployeeStatus.INACTIVE } }
    )

    const action = await ModerationAction.create({
      performedBy: new Types.ObjectId(performedBy),
      performedByRole,
      actionType: ModerationActionType.SUSPENDED,
      reason: options.reason,
      reasonDetails: options.reasonDetails,
      targetType: ModerationTargetType.COMPANY,
      targetId: company._id,
      evidence: options.evidence,
      previousState,
      newState: { status: CompanyStatus.SUSPENDED },
      appealable: true,
      notificationSent: options.notifyUser ?? true,
    })

    await cache.invalidate(`company:${companyId}:*`)

    return { success: true, action }
  }

  // ==================== QUERIES ====================

  /**
   * Get moderation history for a target
   */
  async getModerationHistory(
    targetType: ModerationTargetType,
    targetId: string,
    limit = 50
  ): Promise<IModerationAction[]> {
    await connectDB()
    return ModerationAction.find({ targetType, targetId: new Types.ObjectId(targetId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('performedBy', 'firstName lastName email')
      .lean() as unknown as IModerationAction[]
  }

  /**
   * Get pending appeals
   */
  async getPendingAppeals(limit = 50): Promise<IModerationAction[]> {
    await connectDB()
    return ModerationAction.find({ appealStatus: 'pending' })
      .sort({ createdAt: 1 })
      .limit(limit)
      .populate('performedBy', 'firstName lastName email')
      .lean() as unknown as IModerationAction[]
  }

  /**
   * Process expired suspensions (run via scheduled job)
   */
  async processExpiredSuspensions(): Promise<number> {
    await connectDB()
    const now = new Date()

    // Find expired employee suspensions
    const expiredEmployees = await Employee.find({
      status: EmployeeStatus.SUSPENDED,
      suspendedUntil: { $lte: now },
    })

    for (const employee of expiredEmployees) {
      employee.status = EmployeeStatus.ACTIVE
      employee.suspendedAt = undefined
      employee.suspendedBy = undefined
      employee.suspendedReason = undefined
      employee.suspendedUntil = undefined
      await employee.save()

      await ModerationAction.create({
        performedBy: employee.suspendedBy || employee.userId,
        performedByRole: 'SYSTEM',
        actionType: ModerationActionType.UNSUSPENDED,
        reason: ModerationReason.ADMIN_DECISION,
        reasonDetails: 'Suspension period expired',
        targetType: ModerationTargetType.EMPLOYEE,
        targetId: employee._id,
        previousState: { status: EmployeeStatus.SUSPENDED },
        newState: { status: EmployeeStatus.ACTIVE },
        appealable: false,
        notificationSent: true,
      })
    }

    return expiredEmployees.length
  }
}

export const moderationService = new ModerationService()
export default moderationService
