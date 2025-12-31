import mongoose, { Document, Schema, Types } from 'mongoose'

export enum MerchantReferralStatus {
  PENDING = 'PENDING',
  CONTACTED = 'CONTACTED',
  REGISTERED = 'REGISTERED',
  TRIAL_ACTIVE = 'TRIAL_ACTIVE',
  CONVERTED = 'CONVERTED',
  CHURNED = 'CHURNED',
  REJECTED = 'REJECTED',
}

export interface IMerchantReferral extends Document {
  referrerId: Types.ObjectId
  referrerMerchantId: Types.ObjectId
  referredBusinessName: string
  referredContactName?: string
  referredEmail: string
  referredPhone?: string
  referredAddress?: string
  referredCity?: string
  referredState?: string
  referredZipCode?: string
  whyGoodFit?: string
  referredMerchantId?: Types.ObjectId
  referredUserId?: Types.ObjectId
  status: MerchantReferralStatus
  contactedAt?: Date
  registeredAt?: Date
  trialStartedAt?: Date
  convertedAt?: Date
  churnedAt?: Date
  referrerRewardMonths: number
  referrerRewardClaimed: boolean
  referrerRewardClaimedAt?: Date
  refereeRewardMonths: number
  internalNotes?: string
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
}

const merchantReferralSchema = new Schema<IMerchantReferral>(
  {
    referrerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    referrerMerchantId: {
      type: Schema.Types.ObjectId,
      ref: 'Merchant',
      required: true,
      index: true,
    },
    referredBusinessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    referredContactName: {
      type: String,
      trim: true,
    },
    referredEmail: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      index: true,
    },
    referredPhone: String,
    referredAddress: String,
    referredCity: String,
    referredState: { type: String, uppercase: true },
    referredZipCode: String,
    whyGoodFit: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    referredMerchantId: {
      type: Schema.Types.ObjectId,
      ref: 'Merchant',
    },
    referredUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: Object.values(MerchantReferralStatus),
      default: MerchantReferralStatus.PENDING,
      index: true,
    },
    contactedAt: Date,
    registeredAt: Date,
    trialStartedAt: Date,
    convertedAt: Date,
    churnedAt: Date,
    referrerRewardMonths: {
      type: Number,
      default: 3,
      min: 0,
      max: 12,
    },
    referrerRewardClaimed: {
      type: Boolean,
      default: false,
    },
    referrerRewardClaimedAt: Date,
    refereeRewardMonths: {
      type: Number,
      default: 9,
      min: 0,
      max: 12,
    },
    internalNotes: String,
    assignedTo: String,
  },
  { timestamps: true }
)

merchantReferralSchema.index({ referrerId: 1, status: 1 })
merchantReferralSchema.index({ referredEmail: 1 })
merchantReferralSchema.index({ status: 1, createdAt: -1 })
merchantReferralSchema.index({ referrerMerchantId: 1, referredEmail: 1 })

// Static methods
merchantReferralSchema.statics.checkDuplicate = async function (
  referrerMerchantId: Types.ObjectId,
  referredEmail: string
): Promise<boolean> {
  const existing = await this.findOne({
    referrerMerchantId,
    referredEmail: referredEmail.toLowerCase(),
  })
  return !!existing
}

merchantReferralSchema.statics.getReferralStats = async function (
  referrerMerchantId: Types.ObjectId
) {
  const referrals = await this.find({ referrerMerchantId })

  const totalReferred = referrals.length
  const totalRegistered = referrals.filter(
    (r) =>
      r.status === MerchantReferralStatus.REGISTERED ||
      r.status === MerchantReferralStatus.TRIAL_ACTIVE ||
      r.status === MerchantReferralStatus.CONVERTED
  ).length
  const totalConverted = referrals.filter(
    (r) => r.status === MerchantReferralStatus.CONVERTED
  ).length
  const totalRewardsClaimed = referrals.filter((r) => r.referrerRewardClaimed).length
  const monthsEarned = referrals
    .filter((r) => r.referrerRewardClaimed)
    .reduce((sum, r) => sum + r.referrerRewardMonths, 0)
  const availableMonths = referrals
    .filter(
      (r) =>
        r.status === MerchantReferralStatus.CONVERTED && !r.referrerRewardClaimed
    )
    .reduce((sum, r) => sum + r.referrerRewardMonths, 0)

  const conversionRate = totalReferred > 0 ? (totalConverted / totalReferred) * 100 : 0

  return {
    totalReferred,
    totalRegistered,
    totalConverted,
    totalRewardsClaimed,
    monthsEarned,
    availableMonths,
    conversionRate,
  }
}

// Instance methods
merchantReferralSchema.methods.updateStatus = async function (
  newStatus: MerchantReferralStatus
) {
  this.status = newStatus

  switch (newStatus) {
    case MerchantReferralStatus.CONTACTED:
      this.contactedAt = new Date()
      break
    case MerchantReferralStatus.REGISTERED:
      this.registeredAt = new Date()
      break
    case MerchantReferralStatus.TRIAL_ACTIVE:
      this.trialStartedAt = new Date()
      break
    case MerchantReferralStatus.CONVERTED:
      this.convertedAt = new Date()
      break
    case MerchantReferralStatus.CHURNED:
      this.churnedAt = new Date()
      break
  }

  await this.save()
}

merchantReferralSchema.methods.claimReferrerReward = async function () {
  if (this.status !== MerchantReferralStatus.CONVERTED) {
    throw new Error('Referral must be converted to claim reward')
  }

  if (this.referrerRewardClaimed) {
    throw new Error('Reward has already been claimed')
  }

  this.referrerRewardClaimed = true
  this.referrerRewardClaimedAt = new Date()

  await this.save()
}

export const MerchantReferral =
  mongoose.models.MerchantReferral ||
  mongoose.model<IMerchantReferral>('MerchantReferral', merchantReferralSchema)
