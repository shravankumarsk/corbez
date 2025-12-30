import mongoose, { Document, Schema, Types } from 'mongoose'

export enum ReferralStatus {
  PENDING = 'PENDING',       // Link shared but not used
  REGISTERED = 'REGISTERED', // Referred user registered
  COMPLETED = 'COMPLETED',   // Referred user completed onboarding
}

export interface IReferral extends Document {
  referrerId: Types.ObjectId      // User who referred
  referrerCompanyId?: Types.ObjectId  // Referrer's company at time of referral
  referredEmail?: string          // Email if sent via email invite
  referredUserId?: Types.ObjectId // User who was referred (after registration)
  referredCompanyId?: Types.ObjectId // Company the referred user joined
  status: ReferralStatus
  referralCode: string            // The code used for this referral
  sameCompany: boolean            // Did they join the same company?
  registeredAt?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const referralSchema = new Schema<IReferral>(
  {
    referrerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    referrerCompanyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
    },
    referredEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    referredUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    referredCompanyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
    },
    status: {
      type: String,
      enum: Object.values(ReferralStatus),
      default: ReferralStatus.PENDING,
    },
    referralCode: {
      type: String,
      required: true,
      index: true,
    },
    sameCompany: {
      type: Boolean,
      default: false,
    },
    registeredAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
)

// Index for finding referrals by email
referralSchema.index({ referredEmail: 1, status: 1 })

export const Referral = mongoose.models.Referral || mongoose.model<IReferral>('Referral', referralSchema)
