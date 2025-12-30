import mongoose, { Document, Schema, Types } from 'mongoose'

export enum DiscountType {
  BASE = 'BASE', // Default discount for all verified employees
  COMPANY = 'COMPANY', // Discount for specific company
  SPEND_THRESHOLD = 'SPEND_THRESHOLD', // Discount based on order amount
}

export interface IDiscount extends Document {
  merchantId: Types.ObjectId
  type: DiscountType
  name: string
  percentage: number
  // For COMPANY type
  companyId?: Types.ObjectId
  companyName?: string
  // For SPEND_THRESHOLD type
  minSpend?: number
  // Usage limits
  monthlyUsageLimit?: number | null // null = unlimited
  // General settings
  isActive: boolean
  priority: number // Higher priority discounts are applied first
  createdAt: Date
  updatedAt: Date
}

const discountSchema = new Schema<IDiscount>(
  {
    merchantId: {
      type: Schema.Types.ObjectId,
      ref: 'Merchant',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(DiscountType),
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a discount name'],
    },
    percentage: {
      type: Number,
      required: [true, 'Please provide a discount percentage'],
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
    },
    companyName: {
      type: String,
    },
    minSpend: {
      type: Number,
      min: 0,
    },
    monthlyUsageLimit: {
      type: Number,
      default: null, // null = unlimited
      min: [1, 'Monthly limit must be at least 1'],
      max: [100, 'Monthly limit cannot exceed 100'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for efficient lookups
discountSchema.index({ merchantId: 1, type: 1, isActive: 1 })
discountSchema.index({ merchantId: 1, companyId: 1 })

export const Discount =
  mongoose.models.Discount || mongoose.model<IDiscount>('Discount', discountSchema)
