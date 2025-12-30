import mongoose, { Document, Schema, Types } from 'mongoose'

export enum EmployeeStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',  // Suspended for policy violation
  BANNED = 'BANNED',        // Permanently banned
}

export interface IEmployee extends Document {
  userId: Types.ObjectId
  companyId: Types.ObjectId
  firstName: string
  lastName: string
  department?: string
  jobTitle?: string
  employeeId?: string
  status: EmployeeStatus
  invitedBy?: Types.ObjectId
  invitedAt?: Date
  joinedAt?: Date
  // Moderation fields
  suspendedAt?: Date
  suspendedBy?: Types.ObjectId
  suspendedReason?: string
  suspendedUntil?: Date  // null = indefinite
  bannedAt?: Date
  bannedBy?: Types.ObjectId
  bannedReason?: string
  // Activity tracking for fraud detection
  lastActivityAt?: Date
  warningCount: number
  preferences: {
    emailNotifications: boolean
    favoriteCategories: Types.ObjectId[]
    favoriteMerchants: Types.ObjectId[]
  }
  createdAt: Date
  updatedAt: Date
}

const employeeSchema = new Schema<IEmployee>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      index: true,
    },
    firstName: {
      type: String,
      required: [true, 'Please provide first name'],
    },
    lastName: {
      type: String,
      required: [true, 'Please provide last name'],
    },
    department: String,
    jobTitle: String,
    employeeId: String,
    status: {
      type: String,
      enum: Object.values(EmployeeStatus),
      default: EmployeeStatus.PENDING,
      index: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    invitedAt: Date,
    joinedAt: Date,
    // Moderation fields
    suspendedAt: Date,
    suspendedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    suspendedReason: String,
    suspendedUntil: Date,
    bannedAt: Date,
    bannedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    bannedReason: String,
    lastActivityAt: Date,
    warningCount: {
      type: Number,
      default: 0,
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      favoriteCategories: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Category',
        },
      ],
      favoriteMerchants: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Merchant',
        },
      ],
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for filtering employees by company and status
employeeSchema.index({ companyId: 1, status: 1 })

// Compound unique index to prevent duplicate employees
employeeSchema.index({ userId: 1, companyId: 1 }, { unique: true })

export const Employee =
  mongoose.models.Employee || mongoose.model<IEmployee>('Employee', employeeSchema)
