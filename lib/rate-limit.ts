// Simple in-memory sliding-window rate limiter (per instance).
// For multi-instance deployments swap the Map for Redis (ioredis) with the same interface.
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) return false;
  arr.push(now);
  hits.set(key, arr);
  return true;
}
