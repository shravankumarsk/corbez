import mongoose, { Document, Schema, Types } from 'mongoose'

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  BOGO = 'BOGO',
  FREE_ITEM = 'FREE_ITEM',
}

export enum TargetType {
  ALL_EMPLOYEES = 'ALL_EMPLOYEES',
  SPECIFIC_COMPANIES = 'SPECIFIC_COMPANIES',
  PUBLIC = 'PUBLIC',
}

export enum RedemptionType {
  COUPON_CODE = 'COUPON_CODE',
  QR_CODE = 'QR_CODE',
  IN_STORE = 'IN_STORE',
  ONLINE = 'ONLINE',
}

export enum DealStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  EXPIRED = 'EXPIRED',
  DELETED = 'DELETED',
}

export interface IDeal extends Document {
  merchantId: Types.ObjectId
  title: string
  slug: string
  description: string
  shortDescription?: string
  images: string[]
  categories: Types.ObjectId[]

  discountType: DiscountType
  discountValue: number
  originalPrice?: number
  finalPrice?: number

  targetType: TargetType
  targetCompanies?: Types.ObjectId[]
  targetDepartments?: string[]

  validFrom: Date
  validUntil: Date

  maxTotalRedemptions?: number
  maxRedemptionsPerUser?: number
  currentClaims: number
  currentRedemptions: number

  redemptionType: RedemptionType
  couponCode?: string
  redemptionInstructions?: string
  termsAndConditions?: string

  status: DealStatus
  isFeatured: boolean
  priority: number

  views: number
  claims: number
  redemptions: number

  createdAt: Date
  updatedAt: Date
}

const dealSchema = new Schema<IDeal>(
  {
    merchantId: {
      type: Schema.Types.ObjectId,
      ref: 'Merchant',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      index: true,
      text: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      text: true,
    },
    shortDescription: String,
    images: [String],
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        index: true,
      },
    ],

    // Discount structure
    discountType: {
      type: String,
      enum: Object.values(DiscountType),
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    originalPrice: Number,
    finalPrice: Number,

    // Targeting
    targetType: {
      type: String,
      enum: Object.values(TargetType),
      default: TargetType.ALL_EMPLOYEES,
    },
    targetCompanies: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        index: true,
      },
    ],
    targetDepartments: [String],

    // Validity
    validFrom: {
      type: Date,
      default: () => new Date(),
      index: true,
    },
    validUntil: {
      type: Date,
      required: true,
      index: true,
    },

    // Usage limits
    maxTotalRedemptions: Number,
    maxRedemptionsPerUser: {
      type: Number,
      default: 1,
    },
    currentClaims: {
      type: Number,
      default: 0,
    },
    currentRedemptions: {
      type: Number,
      default: 0,
    },

    // Redemption details
    redemptionType: {
      type: String,
      enum: Object.values(RedemptionType),
      required: true,
    },
    couponCode: String,
    redemptionInstructions: String,
    termsAndConditions: String,

    // Status
    status: {
      type: String,
      enum: Object.values(DealStatus),
      default: DealStatus.DRAFT,
    },

    // Promotion
    isFeatured: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: Number,
      default: 0,
    },

    // Analytics (denormalized for performance)
    views: {
      type: Number,
      default: 0,
    },
    claims: {
      type: Number,
      default: 0,
    },
    redemptions: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Compound indexes
dealSchema.index({ merchantId: 1, status: 1 })
dealSchema.index({ status: 1, validFrom: 1, validUntil: 1 })

// Text index for search
dealSchema.index({ title: 'text', description: 'text' })

export const Deal = mongoose.models.Deal || mongoose.model<IDeal>('Deal', dealSchema)
