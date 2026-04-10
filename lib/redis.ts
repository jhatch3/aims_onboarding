import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    enableOfflineQueue: false,
  });

// Prevent unhandled error events from crashing the process when Redis is unavailable
redis.on("error", () => {});

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached) as T;
  } catch {
    // Redis unavailable — fall through to fetcher
  }

  const data = await fetcher();

  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
  } catch {
    // Redis unavailable — ignore
  }

  return data;
}
