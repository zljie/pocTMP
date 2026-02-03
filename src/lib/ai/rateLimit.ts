export type RateLimitResult =
  | { ok: true; remaining: number; resetMs: number }
  | { ok: false; remaining: 0; resetMs: number };

type Bucket = { hits: number[] };

const globalBuckets = (() => {
  const g = globalThis as unknown as { __aiRateLimitBuckets?: Map<string, Bucket> };
  if (!g.__aiRateLimitBuckets) g.__aiRateLimitBuckets = new Map<string, Bucket>();
  return g.__aiRateLimitBuckets;
})();

export const rateLimit = (key: string, limit: number, windowMs: number): RateLimitResult => {
  const now = Date.now();
  const bucket = globalBuckets.get(key) ?? { hits: [] };
  const cutoff = now - windowMs;
  bucket.hits = bucket.hits.filter((t) => t > cutoff);

  if (bucket.hits.length >= limit) {
    const resetMs = bucket.hits[0] ? bucket.hits[0] + windowMs - now : windowMs;
    globalBuckets.set(key, bucket);
    return { ok: false, remaining: 0, resetMs: Math.max(0, resetMs) };
  }

  bucket.hits.push(now);
  globalBuckets.set(key, bucket);
  const remaining = Math.max(0, limit - bucket.hits.length);
  const resetMs = bucket.hits[0] ? bucket.hits[0] + windowMs - now : windowMs;
  return { ok: true, remaining, resetMs: Math.max(0, resetMs) };
};
