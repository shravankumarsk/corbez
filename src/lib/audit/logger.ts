import { connectDB } from '@/lib/db/mongoose'
import { AuditLog, AuditAction, AuditSeverity, IAuditLog } from '@/lib/db/models/audit-log.model'
import { v4 as uuidv4 } from 'uuid'

export { AuditAction, AuditSeverity }

export interface AuditContext {
  userId?: string
  userEmail?: string
  userRole?: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  requestId?: string
}

export interface AuditEntry {
  action: AuditAction
  severity?: AuditSeverity
  resource?: string
  resourceId?: string
  description: string
  metadata?: Record<string, unknown>
  changes?: {
    before?: Record<string, unknown>
    after?: Record<string, unknown>
  }
  success?: boolean
  errorMessage?: string
}

class AuditLogger {
  private context: AuditContext = {}
  private queue: Partial<IAuditLog>[] = []
  private flushInterval: ReturnType<typeof setInterval> | null = null
  private isProcessing = false

  constructor() {
    // Batch flush every 5 seconds
    if (typeof setInterval !== 'undefined') {
      this.flushInterval = setInterval(() => this.flush(), 5000)
    }
  }

  /**
   * Set the context for subsequent audit logs
   */
  setContext(context: AuditContext): this {
    this.context = { ...this.context, ...context }
    return this
  }

  /**
   * Create a new context for a request
   */
  withRequest(req: {
    headers?: { get?: (key: string) => string | null; [key: string]: unknown }
    ip?: string
  }): AuditLogger {
    const logger = new AuditLogger()
    logger.context = {
      ...this.context,
      requestId: uuidv4(),
      ipAddress: req.ip || (req.headers?.get?.('x-forwarded-for') as string) || 'unknown',
      userAgent: (req.headers?.get?.('user-agent') as string) || 'unknown',
    }
    return logger
  }

  /**
   * Create a logger with user context
   */
  withUser(user: { id?: string; email?: string; role?: string }): AuditLogger {
    const logger = new AuditLogger()
    logger.context = {
      ...this.context,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
    }
    return logger
  }

  /**
   * Log an audit entry (non-blocking, queued)
   */
  log(entry: AuditEntry): void {
    const logEntry: Partial<IAuditLog> = {
      ...entry,
      userId: this.context.userId as unknown as IAuditLog['userId'],
      userEmail: this.context.userEmail,
      userRole: this.context.userRole,
      ipAddress: this.context.ipAddress,
      userAgent: this.context.userAgent,
      requestId: this.context.requestId,
      sessionId: this.context.sessionId,
      severity: entry.severity || AuditSeverity.INFO,
      success: entry.success !== false,
      timestamp: new Date(),
    }

    this.queue.push(logEntry)

    // Immediate flush for critical events
    if (entry.severity === AuditSeverity.CRITICAL) {
      this.flush()
    }
  }

  /**
   * Log info level event
   */
  info(action: AuditAction, description: string, metadata?: Record<string, unknown>): void {
    this.log({ action, description, metadata, severity: AuditSeverity.INFO })
  }

  /**
   * Log warning level event
   */
  warn(action: AuditAction, description: string, metadata?: Record<string, unknown>): void {
    this.log({ action, description, metadata, severity: AuditSeverity.WARNING })
  }

  /**
   * Log error level event
   */
  error(action: AuditAction, description: string, error?: Error, metadata?: Record<string, unknown>): void {
    this.log({
      action,
      description,
      metadata: { ...metadata, errorStack: error?.stack },
      severity: AuditSeverity.ERROR,
      success: false,
      errorMessage: error?.message,
    })
  }

  /**
   * Log critical level event
   */
  critical(action: AuditAction, description: string, error?: Error, metadata?: Record<string, unknown>): void {
    this.log({
      action,
      description,
      metadata: { ...metadata, errorStack: error?.stack },
      severity: AuditSeverity.CRITICAL,
      success: false,
      errorMessage: error?.message,
    })
  }

  /**
   * Log a resource change with before/after diff
   */
  logChange(
    action: AuditAction,
    resource: string,
    resourceId: string,
    description: string,
    before: Record<string, unknown>,
    after: Record<string, unknown>
  ): void {
    this.log({
      action,
      resource,
      resourceId,
      description,
      changes: { before, after },
    })
  }

  /**
   * Flush queued logs to database
   */
  async flush(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return

    this.isProcessing = true
    const batch = this.queue.splice(0, 100) // Process up to 100 at a time

    try {
      await connectDB()
      await AuditLog.insertMany(batch, { ordered: false })
    } catch (error) {
      console.error('[Audit] Failed to flush logs:', error)
      // Re-queue failed logs
      this.queue.unshift(...batch)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Query audit logs
   */
  async query(filters: {
    userId?: string
    action?: AuditAction
    resource?: string
    resourceId?: string
    severity?: AuditSeverity
    startDate?: Date
    endDate?: Date
    limit?: number
    offset?: number
  }): Promise<IAuditLog[]> {
    await connectDB()

    const query: Record<string, unknown> = {}

    if (filters.userId) query.userId = filters.userId
    if (filters.action) query.action = filters.action
    if (filters.resource) query.resource = filters.resource
    if (filters.resourceId) query.resourceId = filters.resourceId
    if (filters.severity) query.severity = filters.severity

    if (filters.startDate || filters.endDate) {
      query.timestamp = {}
      if (filters.startDate) (query.timestamp as Record<string, Date>).$gte = filters.startDate
      if (filters.endDate) (query.timestamp as Record<string, Date>).$lte = filters.endDate
    }

    return AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip(filters.offset || 0)
      .limit(filters.limit || 50)
      .lean() as unknown as IAuditLog[]
  }

  /**
   * Clean up interval on shutdown
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    }
    this.flush()
  }
}

// Singleton instance
export const audit = new AuditLogger()

// Convenience functions for common audit events
export const auditHelpers = {
  userLogin: (userId: string, email: string, ip: string, success: boolean, errorMessage?: string) => {
    audit.withUser({ id: userId, email }).log({
      action: AuditAction.LOGIN,
      description: success ? `User logged in` : `Failed login attempt`,
      metadata: { ip },
      success,
      errorMessage,
    })
  },

  userRegister: (userId: string, email: string, role: string) => {
    audit.withUser({ id: userId, email, role }).info(
      AuditAction.REGISTER,
      `New ${role.toLowerCase()} account created`,
      { role }
    )
  },

  profileUpdated: (userId: string, email: string, changes: Record<string, unknown>) => {
    audit.withUser({ id: userId, email }).log({
      action: AuditAction.PROFILE_UPDATED,
      description: 'User profile updated',
      resource: 'User',
      resourceId: userId,
      changes: { after: changes },
    })
  },

  discountCreated: (userId: string, merchantId: string, discountId: string, details: Record<string, unknown>) => {
    audit.withUser({ id: userId }).log({
      action: AuditAction.DISCOUNT_CREATED,
      description: 'New discount created',
      resource: 'Discount',
      resourceId: discountId,
      metadata: { merchantId, ...details },
    })
  },

  couponRedeemed: (employeeId: string, merchantId: string, couponId: string, amount: number) => {
    audit.log({
      action: AuditAction.COUPON_REDEEMED,
      description: 'Coupon redeemed',
      resource: 'Coupon',
      resourceId: couponId,
      metadata: { employeeId, merchantId, amount },
    })
  },

  apiError: (route: string, error: Error, userId?: string) => {
    audit.withUser({ id: userId }).error(
      AuditAction.API_ERROR,
      `API error on ${route}`,
      error,
      { route }
    )
  },

  rateLimited: (ip: string, route: string, userId?: string) => {
    audit.withUser({ id: userId }).warn(
      AuditAction.RATE_LIMITED,
      `Rate limit exceeded on ${route}`,
      { ip, route }
    )
  },
}

export default audit
