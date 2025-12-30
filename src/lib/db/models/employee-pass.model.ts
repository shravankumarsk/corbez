import mongoose, { Document, Schema, Types } from 'mongoose'

export enum PassStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

export enum PassType {
  EMPLOYEE_CARD = 'EMPLOYEE_CARD',  // General employee verification
  EVENT_PASS = 'EVENT_PASS',        // Special event access
  VIP_PASS = 'VIP_PASS',            // VIP tier access
}

export interface IEmployeePass extends Document {
  userId: Types.ObjectId
  employeeId: Types.ObjectId
  companyId: Types.ObjectId

  passType: PassType
  passId: string  // Unique pass identifier (e.g., PASS-XXXXXXXX)
  status: PassStatus

  // QR code data
  qrCodeDataUrl?: string
  qrCodeSvg?: string
  verificationUrl: string
  signature: string

  // Metadata
  issuedAt: Date
  expiresAt?: Date
  lastUsedAt?: Date
  usageCount: number

  // Apple/Google wallet
  applePassUrl?: string
  googlePassUrl?: string

  createdAt: Date
  updatedAt: Date
}

// Generate unique pass ID
function generatePassId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = ''
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `PASS-${id}`
}

const employeePassSchema = new Schema<IEmployeePass>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },

    passType: {
      type: String,
      enum: Object.values(PassType),
      default: PassType.EMPLOYEE_CARD,
    },
    passId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: generatePassId,
    },
    status: {
      type: String,
      enum: Object.values(PassStatus),
      default: PassStatus.ACTIVE,
      index: true,
    },

    qrCodeDataUrl: String,
    qrCodeSvg: String,
    verificationUrl: {
      type: String,
      required: true,
    },
    signature: {
      type: String,
      required: true,
    },

    issuedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: Date,
    lastUsedAt: Date,
    usageCount: {
      type: Number,
      default: 0,
    },

    applePassUrl: String,
    googlePassUrl: String,
  },
  {
    timestamps: true,
  }
)

// Compound indexes
employeePassSchema.index({ userId: 1, passType: 1 })
employeePassSchema.index({ employeeId: 1, status: 1 })
employeePassSchema.index({ passId: 1, status: 1 })

export const EmployeePass =
  mongoose.models.EmployeePass ||
  mongoose.model<IEmployeePass>('EmployeePass', employeePassSchema)
