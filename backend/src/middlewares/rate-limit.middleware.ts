import { Context, Next } from "hono";
import { AppError } from "../utils/errors";
import { env } from "../config/env";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export const rateLimitMiddleware = async (c: Context, next: Next): Promise<void> => {
  const key = `${c.req.header("x-forwarded-for") || "local"}:${new URL(c.req.url).pathname}`;
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now > existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + env.RATE_LIMIT_WINDOW_MS });
    await next();
    return;
  }

  if (existing.count >= env.RATE_LIMIT_MAX) {
    throw new AppError("Too many requests", 429, "RATE_LIMIT_EXCEEDED");
  }

  existing.count += 1;
  buckets.set(key, existing);
  await next();
};
