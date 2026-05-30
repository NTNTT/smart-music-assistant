/**
 * Rate Limiter – In-Memory Sliding Window Algorithm
 * Prevents API abuse without requiring external Redis infra.
 * Usage: Call checkRateLimit(ip) at the top of any API route.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

interface RateLimitOptions {
  maxRequests?: number;  // Max allowed requests per window
  windowMs?: number;     // Window duration in milliseconds
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const { maxRequests = 30, windowMs = 60_000 } = options;
  const now = Date.now();

  let record = rateLimitStore.get(identifier);

  // Reset window if expired
  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + windowMs };
    rateLimitStore.set(identifier, record);
  }

  record.count++;

  const allowed = record.count <= maxRequests;
  const remaining = Math.max(0, maxRequests - record.count);

  return { allowed, remaining, resetAt: record.resetAt };
}

// Extract client IP from Next.js request (works with proxies)
export function getClientIP(request: Request): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}
