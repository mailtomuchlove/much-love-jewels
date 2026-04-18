/**
 * Rate limiting utility — requires Upstash Redis for production.
 *
 * Setup:
 *   1. Create a free Redis database at https://console.upstash.com
 *   2. Add to .env.local (and Vercel env vars):
 *        UPSTASH_REDIS_REST_URL=https://...upstash.io
 *        UPSTASH_REDIS_REST_TOKEN=AX...
 *   3. Install packages:
 *        npm install @upstash/ratelimit @upstash/redis
 *   4. Uncomment the Upstash block below and remove the stub.
 *
 * Until Upstash is configured, this module returns { allowed: true }
 * for all requests so the app works without external dependencies.
 */

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
};

// ── Stub (active when Upstash env vars are not set) ──────────────────────────
// Replace this entire block with the Upstash implementation below once ready.

// export async function checkAuthRateLimit(
//   _ip: string
// ): Promise<RateLimitResult> {
//   return { allowed: true, remaining: 9 };
// }

// export async function checkOrderRateLimit(
//   _userId: string
// ): Promise<RateLimitResult> {
//   return { allowed: true, remaining: 9 };
// }

// ── Upstash implementation (uncomment after setup) ────────────────────────────

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 login attempts per 15 min per IP
  prefix: "rl:auth",
});

const orderLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 orders per hour per user
  prefix: "rl:order",
});

export async function checkAuthRateLimit(ip: string): Promise<RateLimitResult> {
  const { success, remaining, reset } = await authLimiter.limit(ip);
  return {
    allowed: success,
    remaining,
    retryAfterSeconds: success ? undefined : Math.ceil((reset - Date.now()) / 1000),
  };
}

export async function checkOrderRateLimit(userId: string): Promise<RateLimitResult> {
  const { success, remaining, reset } = await orderLimiter.limit(userId);
  return {
    allowed: success,
    remaining,
    retryAfterSeconds: success ? undefined : Math.ceil((reset - Date.now()) / 1000),
  };
}

