import { Context, Next } from "hono";
import { z, ZodTypeAny } from "zod";
import { AppError } from "../utils/errors";

type Target = "json" | "query" | "param";

export const validate = <T extends ZodTypeAny>(target: Target, schema: T) => {
  return async (c: Context, next: Next): Promise<void> => {
    const payload =
      target === "json" ? await c.req.json() : target === "query" ? c.req.query() : c.req.param();
    const parsed = schema.safeParse(payload);
    if (!parsed.success) throw new AppError(parsed.error.message, 400, "VALIDATION_ERROR");
    c.set(`validated:${target}`, parsed.data as z.infer<T>);
    await next();
  };
};
