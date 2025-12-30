import { connectDB } from '@/lib/db/mongoose'
import { User } from '@/lib/db/models/user.model'
import { Employee } from '@/lib/db/models/employee.model'
import { Company } from '@/lib/db/models/company.model'
import { validateVerificationToken } from './token-generator'

export interface VerificationResult {
  valid: boolean
  employeeName?: string
  companyName?: string
  email?: string
  discountPercentage?: number
  message?: string
}

/**
 * Validates a verification token and returns employee/company information
 */
export async function verifyEmployee(token: string): Promise<VerificationResult> {
  // Validate the JWT token
  const decoded = validateVerificationToken(token)

  if (!decoded) {
    return {
      valid: false,
      message: 'Invalid or expired verification code',
    }
  }

  try {
    await connectDB()

    // Find the user
    const user = await User.findById(decoded.employeeId)

    if (!user) {
      return {
        valid: false,
        message: 'Employee not found',
      }
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return {
        valid: false,
        message: 'Employee email not verified',
      }
    }

    // Get employee details if exists
    const employee = await Employee.findOne({ userId: decoded.employeeId })

    // Get company details if exists
    let companyName = 'Unknown Company'
    if (decoded.companyId) {
      const company = await Company.findById(decoded.companyId)
      if (company) {
        companyName = company.name
      }
    } else if (employee?.companyId) {
      const company = await Company.findById(employee.companyId)
      if (company) {
        companyName = company.name
      }
    }

    // Extract company from email domain as fallback
    if (companyName === 'Unknown Company' && user.email) {
      const domain = user.email.split('@')[1]
      if (domain) {
        companyName = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)
      }
    }

    return {
      valid: true,
      employeeName: employee?.firstName
        ? `${employee.firstName} ${employee.lastName}`
        : user.email.split('@')[0],
      companyName,
      email: user.email,
      discountPercentage: 1, // Base discount - can be enhanced based on company tiers
    }
  } catch (error) {
    console.error('Verification error:', error)
    return {
      valid: false,
      message: 'Verification failed. Please try again.',
    }
  }
}
