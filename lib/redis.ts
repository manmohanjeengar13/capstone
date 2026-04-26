import Redis from 'ioredis';

declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined;
}

export const redis: Redis =
  global.__redis ??
  new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true,
  });

if (process.env.NODE_ENV !== 'production') global.__redis = redis;

/**
 * Set JSON value with optional TTL (seconds).
 */
export async function cacheSet(key: string, value: unknown, ttl?: number): Promise<void> {
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
  const raw = await redis.get(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

/**
 * Delete cache key.
 */
export async function cacheDel(key: string): Promise<void> {
  await redis.del(key);
}
