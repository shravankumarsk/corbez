import mongoose, { Document, Schema, Types } from 'mongoose'

export enum ModerationActionType {
  // Warnings
  WARNING_ISSUED = 'WARNING_ISSUED',
  WARNING_CLEARED = 'WARNING_CLEARED',

  // Suspensions
  SUSPENDED = 'SUSPENDED',
  SUSPENSION_EXTENDED = 'SUSPENSION_EXTENDED',
  UNSUSPENDED = 'UNSUSPENDED',

  // Bans
  BANNED = 'BANNED',
  UNBANNED = 'UNBANNED',

  // Status changes
  ACTIVATED = 'ACTIVATED',
  DEACTIVATED = 'DEACTIVATED',
  VERIFIED = 'VERIFIED',
  UNVERIFIED = 'UNVERIFIED',

  // Content moderation
  CONTENT_REMOVED = 'CONTENT_REMOVED',
  CONTENT_RESTORED = 'CONTENT_RESTORED',

  // Appeal handling
  APPEAL_SUBMITTED = 'APPEAL_SUBMITTED',
  APPEAL_APPROVED = 'APPEAL_APPROVED',
  APPEAL_REJECTED = 'APPEAL_REJECTED',
}

export enum ModerationTargetType {
  USER = 'USER',
  EMPLOYEE = 'EMPLOYEE',
  MERCHANT = 'MERCHANT',
  COMPANY = 'COMPANY',
  DISCOUNT = 'DISCOUNT',
  COUPON = 'COUPON',
}

export enum ModerationReason {
  // Employee violations
  COUPON_ABUSE = 'COUPON_ABUSE',
  MULTIPLE_ACCOUNTS = 'MULTIPLE_ACCOUNTS',
  SHARING_COUPONS = 'SHARING_COUPONS',
  FRAUDULENT_REDEMPTION = 'FRAUDULENT_REDEMPTION',
  TERMS_VIOLATION = 'TERMS_VIOLATION',

  // Merchant violations
  FALSE_ADVERTISING = 'FALSE_ADVERTISING',
  REFUSING_VALID_COUPONS = 'REFUSING_VALID_COUPONS',
  PAYMENT_ISSUES = 'PAYMENT_ISSUES',
  INACTIVE_BUSINESS = 'INACTIVE_BUSINESS',
  QUALITY_COMPLAINTS = 'QUALITY_COMPLAINTS',

  // Company violations
  NON_PAYMENT = 'NON_PAYMENT',
  UNAUTHORIZED_USE = 'UNAUTHORIZED_USE',

  // General
  SPAM = 'SPAM',
  HARASSMENT = 'HARASSMENT',
  INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
  SECURITY_CONCERN = 'SECURITY_CONCERN',
  USER_REQUEST = 'USER_REQUEST',
  ADMIN_DECISION = 'ADMIN_DECISION',
  OTHER = 'OTHER',
}

export interface IModerationAction extends Document {
  // Who performed the action
  performedBy: Types.ObjectId
  performedByRole: string

  // What action was taken
  actionType: ModerationActionType
  reason: ModerationReason
  reasonDetails?: string

  // Who/what was affected
  targetType: ModerationTargetType
  targetId: Types.ObjectId
  targetEmail?: string

  // Duration (for suspensions)
  duration?: {
    value: number
    unit: 'hours' | 'days' | 'weeks' | 'months' | 'permanent'
  }
  expiresAt?: Date

  // Related data
  relatedActionId?: Types.ObjectId  // For reversals, appeals
  evidence?: {
    description: string
    attachments?: string[]
    metadata?: Record<string, unknown>
  }

  // Appeal info
  appealable: boolean
  appealDeadline?: Date
  appealStatus?: 'none' | 'pending' | 'approved' | 'rejected'
  appealNotes?: string

  // State snapshots
  previousState?: Record<string, unknown>
  newState?: Record<string, unknown>

  // Notifications
  notificationSent: boolean
  notificationSentAt?: Date

  createdAt: Date
  updatedAt: Date
}

const moderationActionSchema = new Schema<IModerationAction>(
  {
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    performedByRole: {
      type: String,
      required: true,
    },

    actionType: {
      type: String,
      enum: Object.values(ModerationActionType),
      required: true,
      index: true,
    },
    reason: {
      type: String,
      enum: Object.values(ModerationReason),
      required: true,
      index: true,
    },
    reasonDetails: String,

    targetType: {
      type: String,
      enum: Object.values(ModerationTargetType),
      required: true,
      index: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    targetEmail: String,

    duration: {
      value: Number,
      unit: {
        type: String,
        enum: ['hours', 'days', 'weeks', 'months', 'permanent'],
      },
    },
    expiresAt: {
      type: Date,
      index: true,
    },

    relatedActionId: {
      type: Schema.Types.ObjectId,
      ref: 'ModerationAction',
    },
    evidence: {
      description: String,
      attachments: [String],
      metadata: Schema.Types.Mixed,
    },

    appealable: {
      type: Boolean,
      default: true,
    },
    appealDeadline: Date,
    appealStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none',
    },
    appealNotes: String,

    previousState: Schema.Types.Mixed,
    newState: Schema.Types.Mixed,

    notificationSent: {
      type: Boolean,
      default: false,
    },
    notificationSentAt: Date,
  },
  {
    timestamps: true,
  }
)

// Indexes for common queries
moderationActionSchema.index({ targetType: 1, targetId: 1, createdAt: -1 })
moderationActionSchema.index({ performedBy: 1, createdAt: -1 })
moderationActionSchema.index({ actionType: 1, createdAt: -1 })
moderationActionSchema.index({ expiresAt: 1 }, { sparse: true })
moderationActionSchema.index({ appealStatus: 1 }, { sparse: true })

export const ModerationAction =
  mongoose.models.ModerationAction ||
  mongoose.model<IModerationAction>('ModerationAction', moderationActionSchema)
