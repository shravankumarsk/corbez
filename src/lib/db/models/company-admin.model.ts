import mongoose, { Document, Schema, Types } from 'mongoose'

export enum AdminRole {
  OWNER = 'OWNER', // Full access, can add/remove other admins
  HR = 'HR', // Can manage employees and invites
  CONTACT = 'CONTACT', // Main point of contact, view-only + communications
}

export enum AdminStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING', // Invited but hasn't accepted
}

export interface ICompanyAdmin extends Document {
  userId: Types.ObjectId
  companyId: Types.ObjectId
  role: AdminRole
  title?: string // Custom title like "HR Director", "Benefits Coordinator"
  status: AdminStatus
  invitedBy?: Types.ObjectId
  invitedAt?: Date
  acceptedAt?: Date
  permissions: {
    manageEmployees: boolean
    manageInvites: boolean
    manageAdmins: boolean
    viewReports: boolean
  }
  createdAt: Date
  updatedAt: Date
}

const companyAdminSchema = new Schema<ICompanyAdmin>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(AdminRole),
      required: true,
    },
    title: String,
    status: {
      type: String,
      enum: Object.values(AdminStatus),
      default: AdminStatus.ACTIVE,
      index: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    invitedAt: Date,
    acceptedAt: Date,
    permissions: {
      manageEmployees: {
        type: Boolean,
        default: false,
      },
      manageInvites: {
        type: Boolean,
        default: false,
      },
      manageAdmins: {
        type: Boolean,
        default: false,
      },
      viewReports: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
)

// Compound unique index - one admin role per user per company
companyAdminSchema.index({ userId: 1, companyId: 1 }, { unique: true })
companyAdminSchema.index({ companyId: 1, status: 1, role: 1 })

/**
 * Get default permissions based on role
 */
export function getDefaultPermissions(role: AdminRole) {
  switch (role) {
    case AdminRole.OWNER:
      return {
        manageEmployees: true,
        manageInvites: true,
        manageAdmins: true,
        viewReports: true,
      }
    case AdminRole.HR:
      return {
        manageEmployees: true,
        manageInvites: true,
        manageAdmins: false,
        viewReports: true,
      }
    case AdminRole.CONTACT:
      return {
        manageEmployees: false,
        manageInvites: false,
        manageAdmins: false,
        viewReports: true,
      }
    default:
      return {
        manageEmployees: false,
        manageInvites: false,
        manageAdmins: false,
        viewReports: false,
      }
  }
}

export const CompanyAdmin =
  mongoose.models.CompanyAdmin || mongoose.model<ICompanyAdmin>('CompanyAdmin', companyAdminSchema)
