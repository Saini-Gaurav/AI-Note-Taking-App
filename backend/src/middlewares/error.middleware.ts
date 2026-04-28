import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { AppError } from "../utils/errors";
import { logger } from "../utils/logger";

export const errorHandler = (err: Error, c: Context) => {
  if (err instanceof AppError) {
    return c.json(
      { error: err.code, message: err.message },
      err.statusCode as 400 | 401 | 403 | 404 | 409 | 429 | 500 | 502 | 503
    );
  }

  if (err instanceof HTTPException) {
    return c.json({ error: "HTTP_ERROR", message: err.message }, err.status as 400 | 401 | 403 | 404 | 409 | 429 | 500);
  }

  if (err instanceof ZodError) {
    return c.json({ error: "VALIDATION_ERROR", details: err.issues }, 400);
  }

  logger.error({ err }, "Unhandled error");
  return c.json({ error: "INTERNAL_ERROR", message: "Something went wrong" }, 500);
};

export const requestErrorBoundary = async (_c: Context, next: Next): Promise<void> => {
  await next();
};
