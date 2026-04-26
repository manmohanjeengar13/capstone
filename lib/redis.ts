import Redis from 'ioredis';

declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined;
}

function createRedisClient(): Redis | null {
  if (!process.env.REDIS_URL) return null;

  return new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true,
  });
}

export const redis: Redis | null =
  global.__redis ??
  createRedisClient();

if (process.env.NODE_ENV !== 'production') {
  global.__redis = redis ?? undefined;
}

/**
 * Set JSON value with optional TTL (seconds).
 */
export async function cacheSet(key: string, value: unknown, ttl?: number): Promise<void> {
  if (!redis) return;
  const s = JSON.stringify(value);
  if (ttl) {
    await redis.set(key, s, 'EX', ttl);
  } else {
    await redis.set(key, s);
  }
}

/**
 * Get and parse cached JSON. Returns null on miss.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  const raw = await redis.get(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

/**
 * Delete cache key.
 */
export async function cacheDel(key: string): Promise<void> {
  if (!redis) return;
  await redis.del(key);
}