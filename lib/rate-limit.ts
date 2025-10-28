import { rateLimitRedis } from "@/lib/redis";
import { logger } from "@/lib/logger";

export interface RateLimitConfig {
  maxRequests: number;      // Maximum requests allowed in the time window
  windowMs: number;          // Time window in milliseconds
  requireAuth: boolean;      // Whether to require authentication
  blockMessage?: string;     // Custom message when rate limit exceeded
}

export interface RateLimitResult {
  allowed: boolean;
  message?: string;
  remaining?: number;
  retryAfter?: number;       // Seconds until window resets
  limit?: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 50,
  windowMs: 36000000,        // 10 hours
  requireAuth: true,
  blockMessage: "Rate limit exceeded. Please try again later.",
};

/**
 * Generate Redis key for rate limiting
 */
function getRateLimitKey(userId: number, endpoint: string): string {
  return `ratelimit:${userId}:${endpoint}`;
}

/**
 * Check if a request should be allowed based on rate limiting rules
 * @param userId - The user's ID (null if unauthenticated)
 * @param endpoint - The API endpoint being accessed
 * @param config - Rate limit configuration
 * @returns RateLimitResult indicating if request is allowed
 */
export async function checkRateLimit(
  userId: number | null,
  endpoint: string,
  config: Partial<RateLimitConfig> = {}
): Promise<RateLimitResult> {
  const finalConfig: RateLimitConfig = { ...DEFAULT_CONFIG, ...config };

  // Check authentication requirement
  if (finalConfig.requireAuth && !userId) {
    return {
      allowed: false,
      message: "Authentication required. Please authenticate to use this API.",
    };
  }

  // If no user ID and auth not required, allow (or implement IP-based limiting later)
  if (!userId) {
    return {
      allowed: true,
      remaining: finalConfig.maxRequests,
      limit: finalConfig.maxRequests,
    };
  }

  try {
    const key = getRateLimitKey(userId, endpoint);

    // Increment counter and get current count (atomic operation)
    const redisStartTime = Date.now();
    const currentCount = await rateLimitRedis.increment(key, finalConfig.windowMs);
    const redisDuration = Date.now() - redisStartTime;

    logger.debug("Rate limit Redis increment", {
      userId,
      endpoint,
      duration: `${redisDuration}ms`,
      currentCount,
      limit: finalConfig.maxRequests,
    });

    // Check if limit exceeded
    if (currentCount > finalConfig.maxRequests) {
      // Get TTL to calculate retry-after
      const ttlStartTime = Date.now();
      const ttlSeconds = await rateLimitRedis.getTTL(key);
      const ttlDuration = Date.now() - ttlStartTime;

      logger.debug("Rate limit exceeded", {
        userId,
        endpoint,
        currentCount,
        limit: finalConfig.maxRequests,
        retryAfterSeconds: ttlSeconds,
        ttlCheckDuration: `${ttlDuration}ms`,
      });

      return {
        allowed: false,
        message: finalConfig.blockMessage,
        remaining: 0,
        retryAfter: ttlSeconds > 0 ? ttlSeconds : Math.ceil(finalConfig.windowMs / 1000),
        limit: finalConfig.maxRequests,
      };
    }

    // Request allowed
    const remaining = finalConfig.maxRequests - currentCount;

    logger.debug("Rate limit check passed", {
      userId,
      endpoint,
      currentCount,
      remaining,
      limit: finalConfig.maxRequests,
    });

    return {
      allowed: true,
      remaining: remaining < 0 ? 0 : remaining,
      limit: finalConfig.maxRequests,
    };
  } catch (error) {
    logger.error("Error checking rate limit", error, { userId, endpoint });
    // On error, allow the request (fail open)
    return {
      allowed: true,
      message: "Rate limit check failed, allowing request",
    };
  }
}

/**
 * Reset rate limit for a specific user and endpoint
 * @param userId - The user's ID
 * @param endpoint - The API endpoint
 */
export async function resetUserRateLimit(
  userId: number,
  endpoint: string
): Promise<void> {
  try {
    const key = getRateLimitKey(userId, endpoint);
    await rateLimitRedis.reset(key);
    logger.debug("Rate limit reset", { userId, endpoint });
  } catch (error) {
    logger.error("Error resetting rate limit", error, { userId, endpoint });
    throw new Error("Failed to reset rate limit");
  }
}
