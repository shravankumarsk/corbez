import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Define route access rules
const routeAccess: Record<string, string[]> = {
  '/dashboard/employee': ['EMPLOYEE'],
  '/dashboard/merchant': ['MERCHANT'],
  '/dashboard/company': ['COMPANY_ADMIN'],
  '/dashboard/admin': ['PLATFORM_ADMIN'],
}

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/verify-email',
  '/reset-password',
  '/about',
  '/pricing',
  '/for-employees',
  '/for-restaurants',
  '/how-it-works',
  '/contact',
]

// Auth routes - redirect to dashboard if already logged in
const authRoutes = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const isAuthenticated = !!token
  const userRole = token?.role as string | undefined

  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )

  // Check if current path is an auth route (login/register)
  const isAuthRoute = authRoutes.some((route) => pathname === route)

  // If authenticated user tries to access auth routes, redirect to appropriate dashboard
  if (isAuthenticated && isAuthRoute) {
    const dashboardPath = getDashboardPath(userRole)
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }

  // If not authenticated and trying to access protected route
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check role-based access for dashboard routes
  if (isAuthenticated && pathname.startsWith('/dashboard')) {
    const hasAccess = checkRouteAccess(pathname, userRole)
    if (!hasAccess) {
      // Redirect to user's own dashboard
      const dashboardPath = getDashboardPath(userRole)
      return NextResponse.redirect(new URL(dashboardPath, request.url))
    }
  }

  return NextResponse.next()
}

function getDashboardPath(role: string | undefined): string {
  switch (role) {
    case 'EMPLOYEE':
      return '/dashboard/employee'
    case 'MERCHANT':
      return '/dashboard/merchant'
    case 'COMPANY_ADMIN':
      return '/dashboard/company'
    case 'PLATFORM_ADMIN':
      return '/dashboard/admin'
    default:
      return '/'
  }
}

function checkRouteAccess(pathname: string, userRole: string | undefined): boolean {
  if (!userRole) return false

  // Check each route pattern
  for (const [route, allowedRoles] of Object.entries(routeAccess)) {
    if (pathname.startsWith(route)) {
      return allowedRoles.includes(userRole)
    }
  }

  // PLATFORM_ADMIN has access to all dashboard routes
  if (userRole === 'PLATFORM_ADMIN') {
    return true
  }

  return false
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$).*)'],
}
