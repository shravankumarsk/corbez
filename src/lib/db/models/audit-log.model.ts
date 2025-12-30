import mongoose, { Document, Schema, Types } from 'mongoose'

export enum AuditAction {
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  REGISTER = 'REGISTER',
  PASSWORD_RESET = 'PASSWORD_RESET',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',

  // User actions
  PROFILE_UPDATED = 'PROFILE_UPDATED',
  SETTINGS_CHANGED = 'SETTINGS_CHANGED',

  // Company actions
  COMPANY_CREATED = 'COMPANY_CREATED',
  COMPANY_UPDATED = 'COMPANY_UPDATED',
  EMPLOYEE_INVITED = 'EMPLOYEE_INVITED',
  EMPLOYEE_REMOVED = 'EMPLOYEE_REMOVED',
  ADMIN_ADDED = 'ADMIN_ADDED',
  ADMIN_REMOVED = 'ADMIN_REMOVED',

  // Merchant actions
  MERCHANT_CREATED = 'MERCHANT_CREATED',
  MERCHANT_UPDATED = 'MERCHANT_UPDATED',
  DISCOUNT_CREATED = 'DISCOUNT_CREATED',
  DISCOUNT_UPDATED = 'DISCOUNT_UPDATED',
  DISCOUNT_DELETED = 'DISCOUNT_DELETED',

  // Transaction actions
  COUPON_CLAIMED = 'COUPON_CLAIMED',
  COUPON_REDEEMED = 'COUPON_REDEEMED',
  VERIFICATION_SCANNED = 'VERIFICATION_SCANNED',

  // Referral actions
  REFERRAL_SENT = 'REFERRAL_SENT',
  REFERRAL_COMPLETED = 'REFERRAL_COMPLETED',

  // Billing actions
  SUBSCRIPTION_CREATED = 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_UPDATED = 'SUBSCRIPTION_UPDATED',
  SUBSCRIPTION_CANCELLED = 'SUBSCRIPTION_CANCELLED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',

  // System actions
  API_ERROR = 'API_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface IAuditLog extends Document {
  // Who
  userId?: Types.ObjectId
  userEmail?: string
  userRole?: string

  // What
  action: AuditAction
  severity: AuditSeverity
  resource?: string
  resourceId?: string

  // Details
  description: string
  metadata?: Record<string, unknown>
  changes?: {
    before?: Record<string, unknown>
    after?: Record<string, unknown>
  }

  // Context
  ipAddress?: string
  userAgent?: string
  requestId?: string
  sessionId?: string

  // Outcome
  success: boolean
  errorMessage?: string

  // Timestamps
  timestamp: Date
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    userEmail: {
      type: String,
      index: true,
    },
    userRole: String,

    action: {
      type: String,
      enum: Object.values(AuditAction),
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: Object.values(AuditSeverity),
      default: AuditSeverity.INFO,
      index: true,
    },
    resource: {
      type: String,
      index: true,
    },
    resourceId: {
      type: String,
      index: true,
    },

    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    changes: {
      before: Schema.Types.Mixed,
      after: Schema.Types.Mixed,
    },

    ipAddress: String,
    userAgent: String,
    requestId: String,
    sessionId: String,

    success: {
      type: Boolean,
      default: true,
    },
    errorMessage: String,

    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false, // We use our own timestamp field
    collection: 'audit_logs',
  }
)

// Compound indexes for common queries
auditLogSchema.index({ userId: 1, timestamp: -1 })
auditLogSchema.index({ action: 1, timestamp: -1 })
auditLogSchema.index({ resource: 1, resourceId: 1, timestamp: -1 })
auditLogSchema.index({ severity: 1, timestamp: -1 })

// TTL index: auto-delete logs older than 90 days (adjust as needed)
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', auditLogSchema)
