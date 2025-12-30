import { User, IUser, UserRole } from '@/lib/db/models/user.model'
import { BaseService } from './base.service'
import { eventBus, createEvent } from '@/lib/events'
import { cache, cacheKeys } from '@/lib/cache/redis'
import crypto from 'crypto'

export interface CreateUserInput {
  email: string
  password: string
  firstName?: string
  lastName?: string
  role?: UserRole
  referredBy?: string
  companyId?: string
  merchantId?: string
}

export interface UpdateUserInput {
  firstName?: string
  lastName?: string
  profileImage?: string
  personalEmail?: string
  phoneNumber?: string
}

class UserService extends BaseService<IUser> {
  constructor() {
    super(User, 'user', 600) // 10 min cache
  }

  /**
   * Create a new user
   */
  async createUser(input: CreateUserInput): Promise<IUser> {
    await this.ensureConnection()

    // Generate referral code
    const referralCode = this.generateReferralCode()

    const user = await this.create({
      ...input,
      referralCode,
      role: input.role || UserRole.EMPLOYEE,
    })

    // Emit event
    eventBus.emitAsync(
      createEvent.userRegistered({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        companyId: input.companyId,
        merchantId: input.merchantId,
      })
    )

    return user
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return this.findOne({ email: email.toLowerCase() })
  }

  /**
   * Find user by email with password (for auth)
   */
  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    await this.ensureConnection()
    return User.findOne({ email: email.toLowerCase() }).select('+password')
  }

  /**
   * Find user by userId (CB-XXXXXX)
   */
  async findByUserId(userId: string): Promise<IUser | null> {
    const cacheKey = `user:by-userid:${userId}`
    const cached = await cache.get<IUser>(cacheKey)
    if (cached) return cached

    const user = await this.findOne({ userId })
    if (user) {
      await cache.set(cacheKey, user, this.cacheTTL)
    }
    return user
  }

  /**
   * Find user by referral code
   */
  async findByReferralCode(code: string): Promise<IUser | null> {
    const cacheKey = cacheKeys.referral(code)
    return cache.getOrSet(
      cacheKey,
      () => this.findOne({ referralCode: code }),
      3600 // 1 hour
    )
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, input: UpdateUserInput): Promise<IUser | null> {
    const user = await this.updateById(userId, { $set: input })

    if (user) {
      // Emit event
      eventBus.emitAsync(
        createEvent.userProfileUpdated({
          userId,
          changes: input as unknown as Record<string, unknown>,
        })
      )

      // Invalidate related caches
      await cache.del(cacheKeys.userProfile(userId))
    }

    return user
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<IUser | null> {
    const user = await this.updateOne(
      { verificationToken: token },
      {
        $set: { emailVerified: true },
        $unset: { verificationToken: 1 },
      }
    )

    return user
  }

  /**
   * Generate password reset token
   */
  async generatePasswordResetToken(email: string): Promise<string | null> {
    const user = await this.findByEmail(email)
    if (!user) return null

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600000) // 1 hour

    await this.updateById(user._id.toString(), {
      $set: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    })

    return token
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    await this.ensureConnection()

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+password')

    if (!user) return false

    user.password = newPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    return true
  }

  /**
   * Get user profile with computed fields
   */
  async getProfile(userId: string): Promise<{
    user: IUser
    stats?: {
      totalSavings: number
      couponsUsed: number
      referralsCompleted: number
    }
  } | null> {
    const cacheKey = cacheKeys.userProfile(userId)

    return cache.getOrSet(
      cacheKey,
      async () => {
        const user = await this.findById(userId)
        if (!user) return null

        // Get user stats (simplified - would query other collections)
        const stats = {
          totalSavings: 0,
          couponsUsed: 0,
          referralsCompleted: 0,
        }

        return { user, stats }
      },
      300 // 5 min
    )
  }

  /**
   * Generate unique referral code
   */
  private generateReferralCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  /**
   * Verify backup contact (personal email or phone)
   */
  async verifyBackupContact(
    userId: string,
    type: 'personalEmail' | 'phone',
    token: string
  ): Promise<boolean> {
    // Verify token from cache/database
    const cacheKey = `verify:${type}:${userId}`
    const storedToken = await cache.get<string>(cacheKey)

    if (storedToken !== token) return false

    const update =
      type === 'personalEmail'
        ? { personalEmailVerified: true }
        : { phoneVerified: true }

    await this.updateById(userId, { $set: update })
    await cache.del(cacheKey)

    return true
  }
}

export const userService = new UserService()
export default userService
