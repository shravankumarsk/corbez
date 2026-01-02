import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  MERCHANT = 'MERCHANT',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
}

export interface IUser extends Document {
  // Unique portable identifier (e.g., CB-A1B2C3)
  userId: string

  // Primary work email (may change with employers)
  email: string
  password: string

  // Profile info
  firstName?: string
  lastName?: string
  profileImage?: string

  // Backup contact info (portable across employers)
  personalEmail?: string
  phoneNumber?: string

  // Referral system
  referralCode?: string
  referredBy?: string  // referralCode of the user who referred them
  accountCredits: number // Earned credits in cents (e.g., 1000 = $10)

  // Onboarding progress (for activation tracking)
  onboardingProgress?: {
    emailVerified: boolean
    companyLinked: boolean
    firstDiscountClaimed: boolean
    firstDiscountUsed: boolean
    walletPassAdded: boolean
    firstReferralSent: boolean
    completedAt?: Date
  }

  role: UserRole
  emailVerified: boolean
  personalEmailVerified?: boolean
  phoneVerified?: boolean
  verificationToken?: string
  verificationTokenExpiry?: Date
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  createdAt: Date
  updatedAt: Date
  comparePassword(password: string): Promise<boolean>
}

// Generate unique user ID (CB-XXXXXX format)
// 36^6 = 2.1 billion possible combinations
function generateUserId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed confusing chars: 0,O,1,I,L
  let id = ''
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `CB-${id}`
}

const userSchema = new Schema<IUser>(
  {
    userId: {
      type: String,
      unique: true,
      index: true,
      default: generateUserId,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
    },
    personalEmail: {
      type: String,
      lowercase: true,
      sparse: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phoneNumber: {
      type: String,
      trim: true,
      // Basic phone validation - allows various formats
      match: [/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/, 'Please provide a valid phone number'],
    },
    personalEmailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    referredBy: {
      type: String,  // referralCode of referrer
      index: true,
    },
    accountCredits: {
      type: Number,
      default: 0,
      min: [0, 'Credits cannot be negative'],
    },
    onboardingProgress: {
      emailVerified: {
        type: Boolean,
        default: false,
      },
      companyLinked: {
        type: Boolean,
        default: false,
      },
      firstDiscountClaimed: {
        type: Boolean,
        default: false,
      },
      firstDiscountUsed: {
        type: Boolean,
        default: false,
      },
      walletPassAdded: {
        type: Boolean,
        default: false,
      },
      firstReferralSent: {
        type: Boolean,
        default: false,
      },
      completedAt: {
        type: Date,
      },
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.EMPLOYEE,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      sparse: true,
      unique: true,
    },
    verificationTokenExpiry: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
      sparse: true,
      unique: true,
    },
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
)

// Ensure unique userId on new documents
userSchema.pre('save', async function (next) {
  // Generate userId if new document and no userId set
  if (this.isNew && !this.userId) {
    let attempts = 0
    const maxAttempts = 5

    while (attempts < maxAttempts) {
      const newId = generateUserId()
      const existing = await mongoose.models.User?.findOne({ userId: newId })
      if (!existing) {
        this.userId = newId
        break
      }
      attempts++
    }

    if (!this.userId) {
      return next(new Error('Failed to generate unique userId'))
    }
  }
  next()
})

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password)
}

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema)
