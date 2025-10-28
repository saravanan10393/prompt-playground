import { Redis } from "@upstash/redis";

/**
 * Upstash Redis client for rate limiting and caching
 * Uses REST API for serverless compatibility
 */

let redis: Redis | null = null;

/**
 * Get or create the Redis client singleton
 */
export function getRedisClient(): Redis {
  if (!redis) {
    const url = process.env.prompt_playground_KV_REST_API_URL;
    const token = process.env.prompt_playground_KV_REST_API_TOKEN;

    if (!url || !token) {
      throw new Error(
        "Redis configuration error: KV_REST_API_URL and KV_REST_API_TOKEN environment variables must be set"
      );
    }

    redis = new Redis({
      url,
      token,
    });
  }

  return redis;
}

/**
 * Rate limiting specific Redis operations
 */
export const rateLimitRedis = {
  /**
   * Increment rate limit counter for a user+endpoint
   * Returns the new count
   */
  async increment(key: string, windowMs: number): Promise<number> {
    const client = getRedisClient();

    // Increment the counter
    const count = await client.incr(key);

    // If this is the first request, set the expiration
    if (count === 1) {
      await client.pexpire(key, windowMs);
    }

    return count;
  },

  /**
   * Get current count for a rate limit key
   */
  async getCount(key: string): Promise<number> {
    const client = getRedisClient();
    const count = await client.get<number>(key);
    return count ?? 0;
  },

  /**
   * Get TTL (time to live) for a rate limit key in seconds
   */
  async getTTL(key: string): Promise<number> {
    const client = getRedisClient();
    const ttl = await client.ttl(key);
    return ttl;
  },

  /**
   * Reset rate limit for a specific key
   */
  async reset(key: string): Promise<void> {
    const client = getRedisClient();
    await client.del(key);
  },
};
