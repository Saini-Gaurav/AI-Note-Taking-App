import { cors } from "hono/cors";
import type { MiddlewareHandler } from "hono";
import { env } from "../config/env";

const defaultOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

function allowedOrigins(): string[] {
  if (env.CORS_ORIGIN?.trim()) {
    return env.CORS_ORIGIN.split(",")
      .map((o) => o.trim())
      .filter(Boolean);
  }
  return defaultOrigins;
}

/**
 * Handles browser CORS preflight (`OPTIONS`) and sets `Access-Control-*` on responses.
 * Without this, cross-origin requests from the Next.js app fail (POST is "non-simple").
 */
export const corsMiddleware: MiddlewareHandler = cors({
  origin: allowedOrigins(),
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  /** Bearer tokens in `Authorization` — not cookie-based; keeps CORS simple */
  credentials: false,
  maxAge: 86400,
});
