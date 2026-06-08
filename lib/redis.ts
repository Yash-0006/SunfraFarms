import { Redis } from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Global instance to prevent multiple connections in dev mode during hot-reloads
const globalForRedis = global as unknown as { redis: Redis };

export const redis = globalForRedis.redis || new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    // Only retry once, then give up so we can quickly fall back to the DB
    if (times > 1) return null;
    return 100;
  }
});

// Prevent Node.js from screaming "Unhandled error event" in the console
redis.on('error', (err) => {
  // We silently swallow the connection error here because our dashboard route
  // already logs a clean "falling back to DB" warning.
});

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;
