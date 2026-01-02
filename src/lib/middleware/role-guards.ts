import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { UserRole } from '@/lib/db/models/user.model'

/**
 * Role-Based Access Control (RBAC) Middleware
 * Centralized role verification for API endpoints
 *
 * CRITICAL SECURITY: Prevents unauthorized access to privileged endpoints
 */

export interface RoleGuardResult {
  session?: {
    user: {
      id: string
      email?: string
      role: string
    }
  } | null
  error?: NextResponse
}

/**
 * Require Platform Admin role
 * For admin-only endpoints (user management, merchant approval, platform settings)
 */
export async function requirePlatformAdmin(
  _request: NextRequest
): Promise<RoleGuardResult> {
  const session = await auth()

  // Check authentication
  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      ),
    }
  }

  // Check role
  if (session.user.role !== UserRole.PLATFORM_ADMIN) {
    return {
      error: NextResponse.json(
        {
          error: 'Forbidden - Platform admin access only',
          requiredRole: UserRole.PLATFORM_ADMIN,
          currentRole: session.user.role,
        },
        { status: 403 }
      ),
    }
  }

  return { session }
}

/**
 * Require Company Admin role
 * For company management endpoints (employee verification, company settings)
 */
export async function requireCompanyAdmin(
  _request: NextRequest
): Promise<RoleGuardResult> {
  const session = await auth()

  // Check authentication
  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      ),
    }
  }

  // Check role
  if (session.user.role !== UserRole.COMPANY_ADMIN) {
    return {
      error: NextResponse.json(
        {
          error: 'Forbidden - Company admin access only',
          requiredRole: UserRole.COMPANY_ADMIN,
          currentRole: session.user.role,
        },
        { status: 403 }
      ),
    }
  }

  return { session }
}

/**
 * Require Merchant role
 * For merchant-only endpoints (discount management, merchant settings)
 *
 * NOTE: For subscription-protected endpoints, use requireActiveSubscription()
 * which includes role verification + subscription checks
 */
export async function requireMerchant(
  _request: NextRequest
): Promise<RoleGuardResult> {
  const session = await auth()

  // Check authentication
  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      ),
    }
  }

  // Check role
  if (session.user.role !== UserRole.MERCHANT) {
    return {
      error: NextResponse.json(
        {
          error: 'Forbidden - Merchant access only',
          requiredRole: UserRole.MERCHANT,
          currentRole: session.user.role,
        },
        { status: 403 }
      ),
    }
  }

  return { session }
}

/**
 * Require Employee role
 * For employee-only endpoints (coupon claiming, employee profile)
 */
export async function requireEmployee(
  _request: NextRequest
): Promise<RoleGuardResult> {
  const session = await auth()

  // Check authentication
  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      ),
    }
  }

  // Check role
  if (session.user.role !== UserRole.EMPLOYEE) {
    return {
      error: NextResponse.json(
        {
          error: 'Forbidden - Employee access only',
          requiredRole: UserRole.EMPLOYEE,
          currentRole: session.user.role,
        },
        { status: 403 }
      ),
    }
  }

  return { session }
}

/**
 * Require any of the specified roles
 * For endpoints that allow multiple role types
 *
 * @param request - NextRequest object
 * @param allowedRoles - Array of allowed UserRole values
 * @param errorMessage - Optional custom error message
 */
export async function requireAnyRole(
  request: NextRequest,
  allowedRoles: UserRole[],
  errorMessage?: string
): Promise<RoleGuardResult> {
  const session = await auth()

  // Check authentication
  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      ),
    }
  }

  // Check if user has any of the allowed roles
  if (!allowedRoles.includes(session.user.role as UserRole)) {
    return {
      error: NextResponse.json(
        {
          error: errorMessage || 'Forbidden - Insufficient permissions',
          allowedRoles,
          currentRole: session.user.role,
        },
        { status: 403 }
      ),
    }
  }

  return { session }
}

/**
 * Require authentication only (no role check)
 * For endpoints that just need a logged-in user
 */
export async function requireAuth(
  _request: NextRequest
): Promise<RoleGuardResult> {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      ),
    }
  }

  return { session }
}
