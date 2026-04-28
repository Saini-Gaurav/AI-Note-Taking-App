import { Context } from "hono";

export class HealthController {
  health = (c: Context) => c.json({ status: "ok", timestamp: new Date().toISOString() });
}
