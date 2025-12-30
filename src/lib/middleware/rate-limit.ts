import { NextRequest, NextResponse } from 'next/server'
import { cache, cacheKeys } from '@/lib/cache/redis'
import { auditHelpers } from '@/lib/audit/logger'

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  message?: string
  skipFailedRequests?: boolean
  keyGenerator?: (req: NextRequest) => string
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
  limit: number
}

// Default configurations for different endpoint types
export const rateLimitConfigs = {
  // Standard API endpoints
  default: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many requests, please try again later',
  },

  // Authentication endpoints (login, register)
  auth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many authentication attempts, please try again later',
  },

  // Strict rate limit (sensitive operations)
  strict: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Rate limit exceeded for this operation',
  },

  // Relaxed for read-heavy endpoints
  relaxed: {
    maxRequests: 300,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many requests, please slow down',
  },

  // Upload/heavy operations
  upload: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many upload requests',
  },
}

/**
 * Get client identifier (IP address or user ID)
 */
function getClientIdentifier(req: NextRequest): string {
  // Try to get user ID from session/token
  const authHeader = req.headers.get('authorization')
  if (authHeader) {
    // Hash the token for privacy
    return `user:${hashCode(authHeader)}`
  }

  // Fall back to IP address
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  return `ip:${ip}`
}

/**
 * Simple string hash for privacy
 */
function hashCode(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

/**
 * Check rate limit for a request
 */
export async function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig = rateLimitConfigs.default
): Promise<RateLimitResult> {
  const identifier = config.keyGenerator?.(req) || getClientIdentifier(req)
  const route = new URL(req.url).pathname
  const key = cacheKeys.rateLimit(identifier, route)
  const windowSeconds = Math.ceil(config.windowMs / 1000)

  const count = await cache.incr(key, windowSeconds)
  const remaining = Math.max(0, config.maxRequests - count)
  const reset = Date.now() + config.windowMs

  return {
    success: count <= config.maxRequests,
    remaining,
    reset,
    limit: config.maxRequests,
  }
}

/**
 * Rate limit middleware wrapper for API routes
 */
export function withRateLimit(config: RateLimitConfig = rateLimitConfigs.default) {
  return async function rateLimit(req: NextRequest): Promise<NextResponse | null> {
    const result = await checkRateLimit(req, config)

    if (!result.success) {
      // Log rate limit event
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
      const route = new URL(req.url).pathname
      auditHelpers.rateLimited(ip, route)

      return NextResponse.json(
        {
          error: config.message || 'Too many requests',
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(result.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(result.reset),
            'Retry-After': String(Math.ceil((result.reset - Date.now()) / 1000)),
          },
        }
      )
    }

    return null // Continue to handler
  }
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', String(result.limit))
  response.headers.set('X-RateLimit-Remaining', String(result.remaining))
  response.headers.set('X-RateLimit-Reset', String(result.reset))
  return response
}

/**
 * Higher-order function to wrap API handlers with rate limiting
 */
export function rateLimitedHandler(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig = rateLimitConfigs.default
) {
  return async function (req: NextRequest): Promise<NextResponse> {
    const rateLimitResult = await checkRateLimit(req, config)

    if (!rateLimitResult.success) {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
      const route = new URL(req.url).pathname
      auditHelpers.rateLimited(ip, route)

      return NextResponse.json(
        {
          error: config.message || 'Too many requests',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimitResult.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitResult.reset),
            'Retry-After': String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
          },
        }
      )
    }

    const response = await handler(req)
    return addRateLimitHeaders(response, rateLimitResult)
  }
}
