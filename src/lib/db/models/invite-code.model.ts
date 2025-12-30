import mongoose, { Document, Schema, Types } from 'mongoose'
import crypto from 'crypto'

export enum InviteCodeStatus {
  ACTIVE = 'ACTIVE',
  USED = 'USED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

export interface IInviteCode extends Document {
  code: string
  companyId: Types.ObjectId
  createdBy: Types.ObjectId
  usedBy?: Types.ObjectId
  email?: string // Optional: pre-assigned to specific email
  status: InviteCodeStatus
  expiresAt: Date
  usedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const inviteCodeSchema = new Schema<IInviteCode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    usedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(InviteCodeStatus),
      default: InviteCodeStatus.ACTIVE,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    usedAt: Date,
  },
  {
    timestamps: true,
  }
)

// Compound indexes
inviteCodeSchema.index({ companyId: 1, status: 1 })
inviteCodeSchema.index({ email: 1, companyId: 1 })

/**
 * Generate a unique invite code
 */
export function generateInviteCode(): string {
  // Format: XXXX-XXXX (8 chars, easy to type)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude confusing chars (0, O, 1, I)
  let code = ''
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-'
    code += chars.charAt(crypto.randomInt(chars.length))
  }
  return code
}

export const InviteCode =
  mongoose.models.InviteCode || mongoose.model<IInviteCode>('InviteCode', inviteCodeSchema)
