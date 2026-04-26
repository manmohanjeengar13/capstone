import { redis } from '@/lib/redis';

/**
 * Redis sliding-window rate limiter.
 * Falls back to "allow all" if Redis is unavailable (REDIS_URL not set or
 * connection fails) so the app keeps working without Redis on Vercel.
 *
 * @param key       Unique key per user/action
 * @param limit     Max requests allowed in window
 * @param windowSec Window size in seconds
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<{ allowed: boolean; retryAfter: number }> {
  // Redis not configured — skip rate limiting entirely
  if (!redis) {
    return { allowed: true, retryAfter: 0 };
  }

  try {
    const now = Date.now();
    const windowMs = windowSec * 1000;

    // Remove old entries outside the window
    await redis.zremrangebyscore(key, 0, now - windowMs);

    const count = await redis.zcard(key);

    if (count >= limit) {
      const oldest = await redis.zrange(key, 0, 0, 'WITHSCORES');
      const oldestScore = oldest[1] ? parseInt(oldest[1]) : now;
      const retryAfter = Math.ceil((oldestScore + windowMs - now) / 1000);
      return { allowed: false, retryAfter };
    }

    // Add current request timestamp
    await redis.zadd(key, now, `${now}-${Math.random()}`);
    await redis.expire(key, windowSec);

    return { allowed: true, retryAfter: 0 };
  } catch (err) {
    // Redis unreachable — fail open so the app keeps working
    console.warn('[rateLimit] Redis error, skipping rate limit:', err);
    return { allowed: true, retryAfter: 0 };
  }
}