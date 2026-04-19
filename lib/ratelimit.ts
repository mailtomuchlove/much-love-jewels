import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
};

const ALLOW_ALL: RateLimitResult = { allowed: true, remaining: 99 };

// Lazy init — avoids crashing the module if env vars are missing at build time
let redis: Redis | null = null;
function getRedis(): Redis | null {
  if (redis) return redis;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  redis = Redis.fromEnv();
  return redis;
}

function makeLimiter(tokens: number, window: Parameters<typeof Ratelimit.slidingWindow>[1], prefix: string) {
  return {
    async limit(key: string): Promise<RateLimitResult> {
      const r = getRedis();
      if (!r) return ALLOW_ALL;
      try {
        const limiter = new Ratelimit({ redis: r, limiter: Ratelimit.slidingWindow(tokens, window), prefix });
        const { success, remaining, reset } = await limiter.limit(key);
        return {
          allowed: success,
          remaining,
          retryAfterSeconds: success ? undefined : Math.ceil((reset - Date.now()) / 1000),
        };
      } catch {
        // Redis unavailable — fail open so the store keeps working
        return ALLOW_ALL;
      }
    },
  };
}

// 5 login attempts per 15 min per IP
const authLimiter      = makeLimiter(5,  "15 m", "rl:auth");
// 10 orders per hour per user
const orderLimiter     = makeLimiter(10, "1 h",  "rl:order");
// 20 order attempts per hour per IP (blocks multi-account bots)
const orderIPLimiter   = makeLimiter(20, "1 h",  "rl:order:ip");
// 30 cart actions per 10 min per user (blocks cart-flooding bots)
const cartLimiter      = makeLimiter(30, "10 m", "rl:cart");
// 3 order cancellations per day per user
const cancelLimiter    = makeLimiter(3,  "24 h", "rl:cancel");

export const checkAuthRateLimit       = (ip: string)     => authLimiter.limit(ip);
export const checkOrderRateLimit      = (userId: string) => orderLimiter.limit(userId);
export const checkOrderIPRateLimit    = (ip: string)     => orderIPLimiter.limit(ip);
export const checkCartRateLimit       = (userId: string) => cartLimiter.limit(userId);
export const checkCancelRateLimit     = (userId: string) => cancelLimiter.limit(userId);
