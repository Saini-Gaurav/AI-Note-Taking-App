import { Hono } from "hono";
import { routes } from "./routes";
import { corsMiddleware } from "./middlewares/cors.middleware";
import { loggerMiddleware } from "./middlewares/logger.middleware";
import { rateLimitMiddleware } from "./middlewares/rate-limit.middleware";
import { errorHandler } from "./middlewares/error.middleware";

const app = new Hono();

app.use("*", corsMiddleware);
app.use("*", loggerMiddleware);
app.use("*", rateLimitMiddleware);

app.get("/", (c) => c.json({ service: "ai-notes-pro-backend", status: "running" }));
app.route("/api", routes);

app.notFound((c) => c.json({ error: "NOT_FOUND", message: "Route not found" }, 404));
app.onError(errorHandler);

export { app };
