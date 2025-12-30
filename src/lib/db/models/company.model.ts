import mongoose, { Document, Schema, Types } from 'mongoose'

export enum CompanyStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface ICompany extends Document {
  name: string
  slug: string
  logo?: string
  description?: string
  industry?: string
  size?: string
  website?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country: string
  }
  adminUserId: Types.ObjectId
  status: CompanyStatus
  settings: {
    allowPublicDeals: boolean
    autoApproveEmployees: boolean
    emailDomain?: string
    notificationPreferences: {
      weeklyDigest: boolean
      newMerchants: boolean
    }
  }
  createdAt: Date
  updatedAt: Date
}

const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a company name'],
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    logo: String,
    description: String,
    industry: String,
    size: String,
    website: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'US',
      },
    },
    adminUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(CompanyStatus),
      default: CompanyStatus.PENDING,
      index: true,
    },
    settings: {
      allowPublicDeals: {
        type: Boolean,
        default: true,
      },
      autoApproveEmployees: {
        type: Boolean,
        default: false,
      },
      emailDomain: String,
      notificationPreferences: {
        weeklyDigest: {
          type: Boolean,
          default: true,
        },
        newMerchants: {
          type: Boolean,
          default: true,
        },
      },
    },
  },
  {
    timestamps: true,
  }
)

export const Company =
  mongoose.models.Company || mongoose.model<ICompany>('Company', companySchema)
