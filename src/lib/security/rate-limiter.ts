import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  message?: string
}

// In-memory store (for production, use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

/**
 * Rate limiter middleware
 * Prevents brute force attacks and API abuse
 */
export function createRateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests, message = 'Too many requests, please try again later' } = config

  return async (request: NextRequest): Promise<NextResponse | null> => {
    // Get client identifier (IP + User-Agent for better uniqueness)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const identifier = `${ip}:${userAgent.slice(0, 50)}`

    const now = Date.now()
    const clientData = requestCounts.get(identifier)

    if (!clientData || now > clientData.resetTime) {
      // First request or window expired - reset counter
      requestCounts.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      })
      return null // Allow request
    }

    if (clientData.count >= maxRequests) {
      // Rate limit exceeded
      const resetIn = Math.ceil((clientData.resetTime - now) / 1000)
      return NextResponse.json(
        {
          error: message,
          retryAfter: resetIn,
        },
        {
          status: 429,
          headers: {
            'Retry-After': resetIn.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(clientData.resetTime).toISOString(),
          },
        }
      )
    }

    // Increment counter
    clientData.count++
    requestCounts.set(identifier, clientData)

    return null // Allow request
  }
}

/**
 * Predefined rate limiters for different endpoints
 */
export const rateLimiters = {
  // Strict: Login/Auth endpoints (prevent brute force)
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'Too many login attempts. Please try again in 15 minutes.',
  }),

  // Medium: API endpoints
  api: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
    message: 'Too many API requests. Please slow down.',
  }),

  // Relaxed: Public endpoints
  public: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  }),

  // Very strict: Password reset
  passwordReset: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 attempts per hour
    message: 'Too many password reset attempts. Please try again in 1 hour.',
  }),

  // Coupon claims (prevent spam)
  couponClaim: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 claims per minute
    message: 'Too many coupon claims. Please wait a moment.',
  }),
}

/**
 * Cleanup old entries (run periodically)
 */
export function cleanupRateLimitStore() {
  const now = Date.now()
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.resetTime) {
      requestCounts.delete(key)
    }
  }
}

// Cleanup every 10 minutes
setInterval(cleanupRateLimitStore, 10 * 60 * 1000)
