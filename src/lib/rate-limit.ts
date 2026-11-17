import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory token store mapped by IP (for local dev fallback)
const ipStore = new Map<string, RateLimitRecord>();

// Clean up stale IP records every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipStore.entries()) {
      if (now > record.resetTime) {
        ipStore.delete(ip);
      }
    }
  }, 10 * 60 * 1000);
}

let upstashRatelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    upstashRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 h'),
      analytics: true,
      prefix: 'resumegap_ratelimit',
    });
  } catch (err) {
    console.warn('[RateLimit] Failed to initialize Upstash Redis, using in-memory fallback:', err);
  }
}

/**
 * Checks IP rate limit using Upstash Redis on Vercel serverless,
 * or an in-memory token bucket fallback during local development.
 */
export async function checkRateLimit(
  ip: string,
  limit: number = 20,
  windowMs: number = 60 * 60 * 1000
): Promise<{ allowed: boolean; remaining: number; resetInSeconds: number; provider: 'upstash' | 'memory' }> {
  const clientKey = ip || 'unknown-client';

  // 1. Try Upstash Redis if configured
  if (upstashRatelimit) {
    try {
      const res = await upstashRatelimit.limit(clientKey);
      return {
        allowed: res.success,
        remaining: res.remaining,
        resetInSeconds: Math.ceil((res.reset - Date.now()) / 1000),
        provider: 'upstash',
      };
    } catch (err) {
      console.warn('[RateLimit] Upstash Redis call failed, falling back to in-memory store:', err);
    }
  }

  // 2. In-memory local fallback
  const now = Date.now();
  const existing = ipStore.get(clientKey);

  if (!existing || now > existing.resetTime) {
    ipStore.set(clientKey, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
      provider: 'memory',
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil((existing.resetTime - now) / 1000),
      provider: 'memory',
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
    resetInSeconds: Math.ceil((existing.resetTime - now) / 1000),
    provider: 'memory',
  };
}
