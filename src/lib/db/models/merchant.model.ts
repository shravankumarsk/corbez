import mongoose, { Document, Schema, Types } from 'mongoose'

export enum MerchantStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum SubscriptionStatus {
  NONE = 'NONE',
  TRIALING = 'TRIALING',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  UNPAID = 'UNPAID',
}

export enum PriceTier {
  BUDGET = '$',
  MODERATE = '$$',
  UPSCALE = '$$$',
  FINE_DINING = '$$$$',
}

export enum SeatingCapacity {
  SMALL = 'SMALL',       // 1-30 seats
  MEDIUM = 'MEDIUM',     // 31-75 seats
  LARGE = 'LARGE',       // 76+ seats
}

export enum PeakHours {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
  LATE_NIGHT = 'LATE_NIGHT',
}

export interface IBusinessMetrics {
  avgOrderValue?: number
  priceTier?: PriceTier
  seatingCapacity?: SeatingCapacity
  seatingCapacityNumeric?: number
  peakHours?: PeakHours[]
  cateringAvailable?: boolean
  offersDelivery?: boolean  // Restaurant provides own delivery
}

export interface ILocation {
  _id?: Types.ObjectId
  name?: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface IMerchant extends Document {
  userId: Types.ObjectId
  businessName: string
  slug: string
  description?: string
  logo?: string
  coverImage?: string
  categories: Types.ObjectId[]
  locations: ILocation[]
  contactEmail?: string
  contactPhone?: string
  website?: string
  status: MerchantStatus
  verifiedAt?: Date
  rating?: number
  totalReviews?: number
  // Stripe subscription fields
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  subscriptionStatus: SubscriptionStatus
  subscriptionCurrentPeriodEnd?: Date
  subscriptionTrialEnd?: Date
  subscriptionCancelAtPeriodEnd?: boolean
  // Business metrics for savings calculation
  businessMetrics?: IBusinessMetrics
  // Onboarding tracking
  onboardingCompleted: boolean
  onboardingCompletedAt?: Date
  // Security & Compliance
  securityTermsAccepted: boolean
  securityTermsAcceptedAt?: Date
  securityTermsVersion: string
  createdAt: Date
  updatedAt: Date
}

const locationSchema = new Schema<ILocation>(
  {
    name: String,
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      default: 'US',
    },
    phone: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  { _id: true }
)

const merchantSchema = new Schema<IMerchant>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    businessName: {
      type: String,
      required: [true, 'Please provide a business name'],
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    description: String,
    logo: String,
    coverImage: String,
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        index: true,
      },
    ],
    locations: [locationSchema],
    contactEmail: String,
    contactPhone: String,
    website: String,
    status: {
      type: String,
      enum: Object.values(MerchantStatus),
      default: MerchantStatus.PENDING,
      index: true,
    },
    verifiedAt: Date,
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    // Stripe subscription fields
    stripeCustomerId: {
      type: String,
      index: true,
    },
    stripeSubscriptionId: {
      type: String,
      index: true,
    },
    subscriptionStatus: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.NONE,
      index: true,
    },
    subscriptionCurrentPeriodEnd: Date,
    subscriptionTrialEnd: Date,
    subscriptionCancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    // Business metrics for savings calculation
    businessMetrics: {
      avgOrderValue: {
        type: Number,
        min: 0,
      },
      priceTier: {
        type: String,
        enum: Object.values(PriceTier),
      },
      seatingCapacity: {
        type: String,
        enum: Object.values(SeatingCapacity),
      },
      seatingCapacityNumeric: Number,
      peakHours: [{
        type: String,
        enum: Object.values(PeakHours),
      }],
      cateringAvailable: {
        type: Boolean,
        default: false,
      },
      offersDelivery: {
        type: Boolean,
        default: false,
      },
    },
    // Onboarding tracking
    onboardingCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    onboardingCompletedAt: Date,
    // Security & Compliance
    securityTermsAccepted: {
      type: Boolean,
      default: false,
      required: true,
    },
    securityTermsAcceptedAt: Date,
    securityTermsVersion: {
      type: String,
      default: '1.0',
    },
  },
  {
    timestamps: true,
  }
)

export const Merchant =
  mongoose.models.Merchant || mongoose.model<IMerchant>('Merchant', merchantSchema)
