import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-utils";
import { checkRateLimit, type RateLimitConfig } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

/**
 * Higher-order function that wraps an API handler with rate limiting
 * @param handler - The original API route handler
 * @param config - Rate limit configuration (optional, uses defaults if not provided)
 * @returns A new handler with rate limiting applied
 */
export function withRateLimit(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (request: Request, ...args: any[]) => Promise<Response>,
  config?: Partial<RateLimitConfig>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (request: Request, ...args: any[]): Promise<Response> => {
    try {
      // Extract user information from request
      const userInfo = await getUserFromRequest(request);
      const userId = userInfo?.userId || null;

      // Get endpoint from URL
      const url = new URL(request.url);
      const endpoint = url.pathname;

      // Check rate limit with timing
      const rateLimitStartTime = Date.now();
      const rateLimitResult = await checkRateLimit(userId, endpoint, config);
      const rateLimitDuration = Date.now() - rateLimitStartTime;

      logger.debug("Rate limit check completed", {
        endpoint,
        userId: userId || "anonymous",
        duration: `${rateLimitDuration}ms`,
        allowed: rateLimitResult.allowed,
        remaining: rateLimitResult.remaining,
      });

      if (!rateLimitResult.allowed) {
        // Rate limit exceeded or authentication required
        const statusCode = userId === null && config?.requireAuth !== false ? 401 : 429;

        return NextResponse.json(
          {
            error: rateLimitResult.message || "Request denied",
            ...(rateLimitResult.retryAfter && {
              retryAfter: rateLimitResult.retryAfter,
            }),
            ...(rateLimitResult.limit && {
              limit: rateLimitResult.limit,
              remaining: rateLimitResult.remaining || 0,
            }),
          },
          {
            status: statusCode,
            headers: {
              ...(rateLimitResult.retryAfter && {
                "Retry-After": rateLimitResult.retryAfter.toString(),
              }),
              ...(rateLimitResult.limit && {
                "X-RateLimit-Limit": rateLimitResult.limit.toString(),
                "X-RateLimit-Remaining": (rateLimitResult.remaining || 0).toString(),
              }),
            },
          }
        );
      }

      // Rate limit check passed, call the original handler
      return await handler(request, ...args);
    } catch (error) {
      console.error("Error in rate limit middleware:", error);
      // On error, allow the request to proceed (fail open)
      return await handler(request, ...args);
    }
  };
}
