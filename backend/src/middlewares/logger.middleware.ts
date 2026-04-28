import { Context, Next } from "hono";
import { logger } from "../utils/logger";

export const loggerMiddleware = async (c: Context, next: Next): Promise<void> => {
  const startedAt = Date.now();
  await next();
  logger.info(
    {
      method: c.req.method,
      path: new URL(c.req.url).pathname,
      status: c.res.status,
      durationMs: Date.now() - startedAt
    },
    "request"
  );
};
