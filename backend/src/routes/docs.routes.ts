import { Hono } from "hono";

const docsRoutes = new Hono();

docsRoutes.get("/", (c) =>
  c.json({
    name: "AI Notes Pro API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: ["/auth/register", "/auth/login", "/auth/refresh", "/auth/logout", "/auth/me"],
      notes: ["/notes", "/notes/:id"],
      ai: ["/ai/summarize", "/ai/improve", "/ai/tags"]
    }
  })
);

export { docsRoutes };
