'use server'

import { signIn } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { User, UserRole } from '@/lib/db/models/user.model'
import { Employee } from '@/lib/db/models/employee.model'
import { Company } from '@/lib/db/models/company.model'
import { Merchant } from '@/lib/db/models/merchant.model'
import { loginSchema, registerSchema } from '@/lib/validations/auth.schema'
import { AuthError } from 'next-auth'
import crypto from 'crypto'

export async function login(email: string, password: string) {
  try {
    const validated = loginSchema.parse({ email, password })

    await signIn('credentials', {
      email: validated.email,
      password: validated.password,
      redirect: false,
    })

    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, error: 'Invalid email or password' }
        default:
          return { success: false, error: 'Something went wrong' }
      }
    }
    throw error
  }
}

export async function register(
  email: string,
  password: string,
  confirmPassword: string,
  firstName: string,
  lastName: string,
  role: UserRole
) {
  try {
    const validated = registerSchema.parse({
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      role,
    })

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({
      email: validated.email.toLowerCase(),
    })
    if (existingUser) {
      return { success: false, error: 'Email already in use' }
    }

    // Create user
    const user = await User.create({
      email: validated.email.toLowerCase(),
      password: validated.password,
      role: validated.role,
      emailVerified: false,
      verificationToken: crypto.randomBytes(32).toString('hex'),
    })

    // Create role-specific records
    if (validated.role === UserRole.EMPLOYEE) {
      // Employees need to be invited by a company
      // Will be linked to company on invitation acceptance
    } else if (validated.role === UserRole.MERCHANT) {
      // Create merchant profile
      await Merchant.create({
        userId: user._id,
        businessName: '',
        slug: '',
        status: 'PENDING',
      })
    } else if (validated.role === UserRole.COMPANY_ADMIN) {
      // Company admin will create their company
    }

    // TODO: Send verification email

    return {
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
    }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An error occurred during registration' }
  }
}

export async function logout() {
  // Implementation in next-auth
  return { success: true }
}

export async function verifyEmail(token: string) {
  try {
    await connectDB()

    const user = await User.findOne({
      verificationToken: token,
    })

    if (!user) {
      return { success: false, error: 'Invalid or expired verification link' }
    }

    user.emailVerified = true
    user.verificationToken = undefined
    await user.save()

    return { success: true, message: 'Email verified successfully' }
  } catch (error) {
    return { success: false, error: 'An error occurred during verification' }
  }
}

export async function requestPasswordReset(email: string) {
  try {
    await connectDB()

    const user = await User.findOne({
      email: email.toLowerCase(),
    })

    if (!user) {
      // Don't reveal if email exists
      return { success: true, message: 'If an account exists, a reset link will be sent' }
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    await user.save()

    return {
      success: true,
      message: 'If an account exists, a reset link will be sent',
      token: resetToken,
    }
  } catch (error) {
    return { success: false, error: 'An error occurred' }
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    if (newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' }
    }

    await connectDB()

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    })

    if (!user) {
      return { success: false, error: 'Invalid or expired reset link' }
    }

    user.password = newPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    return { success: true, message: 'Password reset successfully' }
  } catch (error) {
    return { success: false, error: 'An error occurred during password reset' }
  }
}
