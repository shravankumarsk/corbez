import mongoose, { Document, Schema, Types } from 'mongoose'

export enum CouponStatus {
  ACTIVE = 'ACTIVE',
  REDEEMED = 'REDEEMED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export interface IUsageRecord {
  redeemedAt: Date
  month: string // Format: "2025-01" for monthly grouping
  notes?: string
}

export interface IClaimedCoupon extends Document {
  employeeId: Types.ObjectId
  dealId: Types.ObjectId
  merchantId: Types.ObjectId

  claimedAt: Date
  expiresAt?: Date | null // null = never expires (default)
  status: CouponStatus

  // Usage tracking
  usageHistory: IUsageRecord[]
  usageThisMonth: number
  lastResetMonth?: string // Format: "2025-01"

  // Legacy single-redemption fields (kept for backwards compatibility)
  redeemedAt?: Date
  redemptionLocation?: string
  redemptionNotes?: string
  redemptionVerificationCode?: string

  uniqueCode: string
  qrCodeUrl?: string

  createdAt: Date
  updatedAt: Date
}

const claimedCouponSchema = new Schema<IClaimedCoupon>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    dealId: {
      type: Schema.Types.ObjectId,
      ref: 'Deal',
      required: true,
      index: true,
    },
    merchantId: {
      type: Schema.Types.ObjectId,
      ref: 'Merchant',
      required: true,
      index: true,
    },

    claimedAt: {
      type: Date,
      default: () => new Date(),
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null, // null = never expires
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(CouponStatus),
      default: CouponStatus.ACTIVE,
      index: true,
    },

    // Usage tracking for reusable coupons
    usageHistory: [{
      redeemedAt: { type: Date, required: true },
      month: { type: String, required: true }, // Format: "2025-01"
      notes: String,
    }],
    usageThisMonth: {
      type: Number,
      default: 0,
    },
    lastResetMonth: {
      type: String, // Format: "2025-01"
    },

    // Legacy single-redemption fields
    redeemedAt: Date,
    redemptionLocation: String,
    redemptionNotes: String,
    redemptionVerificationCode: String,

    uniqueCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      sparse: true,
    },
    qrCodeUrl: String,
  },
  {
    timestamps: true,
  }
)

// Compound index for unique employee-deal combination
claimedCouponSchema.index({ employeeId: 1, dealId: 1 }, { unique: true })

// Status index for filtering
claimedCouponSchema.index({ status: 1 })

// TTL index: auto-delete expired coupons when expiresAt is set
// Note: TTL only triggers when expiresAt has a Date value (not null)
claimedCouponSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0, // Delete at the exact expiresAt time
    partialFilterExpression: { expiresAt: { $type: 'date' } }, // Only apply to docs with Date value
  }
)

// Index for employee-merchant coupon lookup
claimedCouponSchema.index({ employeeId: 1, merchantId: 1, status: 1 })

export const ClaimedCoupon =
  mongoose.models.ClaimedCoupon ||
  mongoose.model<IClaimedCoupon>('ClaimedCoupon', claimedCouponSchema)
