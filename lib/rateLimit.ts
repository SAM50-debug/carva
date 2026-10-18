/**
 * High-performance in-memory sliding window rate limiter
 * Used to protect CPU-intensive auth routes (bcrypt) and scanning endpoints from flooding
 */

interface RateLimitRecord {
  timestamps: number[];
}

class SlidingWindowRateLimiter {
  private cache = new Map<string, RateLimitRecord>();
  private lastCleanup = Date.now();
  private readonly cleanupIntervalMs = 60_000; // Cleanup stale entries every 60s

  /**
   * Check if a key has exceeded maximum allowed requests in the time window
   * @param key Unique identifier (e.g., client IP or composite user ID)
   * @param limit Max allowed requests within windowMs
   * @param windowMs Time window in milliseconds
   * @returns { success: boolean; remaining: number; resetMs: number }
   */
  check(key: string, limit: number, windowMs: number): { success: boolean; remaining: number; resetMs: number } {
    const now = Date.now();

    // Routine memory cleanup
    if (now - this.lastCleanup > this.cleanupIntervalMs) {
      this.cleanup(now, windowMs);
    }

    const record = this.cache.get(key) || { timestamps: [] };

    // Filter out timestamps outside the active sliding window
    const windowStart = now - windowMs;
    const validTimestamps = record.timestamps.filter(ts => ts > windowStart);

    if (validTimestamps.length >= limit) {
      const oldestInWindow = validTimestamps[0];
      const resetMs = Math.max(0, oldestInWindow + windowMs - now);
      return {
        success: false,
        remaining: 0,
        resetMs,
      };
    }

    // Record this hit
    validTimestamps.push(now);
    this.cache.set(key, { timestamps: validTimestamps });

    return {
      success: true,
      remaining: limit - validTimestamps.length,
      resetMs: windowMs,
    };
  }

  private cleanup(now: number, windowMs: number) {
    this.lastCleanup = now;
    const threshold = now - windowMs * 2;
    for (const [key, record] of this.cache.entries()) {
      const active = record.timestamps.filter(ts => ts > threshold);
      if (active.length === 0) {
        this.cache.delete(key);
      } else {
        this.cache.set(key, { timestamps: active });
      }
    }
  }
}

// Global instance to survive hot-reloads
const globalForRateLimit = global as unknown as { _rateLimiter?: SlidingWindowRateLimiter };
export const rateLimiter = globalForRateLimit._rateLimiter || new SlidingWindowRateLimiter();

if (process.env.NODE_ENV !== "production") {
  globalForRateLimit._rateLimiter = rateLimiter;
}
