import { Hono } from "hono";
import { authRoutes } from "./auth.routes";
import { noteRoutes } from "./note.routes";
import { aiRoutes } from "./ai.routes";
import { healthRoutes } from "./health.routes";
import { docsRoutes } from "./docs.routes";

const routes = new Hono();

routes.route("/health", healthRoutes);
routes.route("/docs", docsRoutes);
routes.route("/auth", authRoutes);
routes.route("/notes", noteRoutes);
routes.route("/ai", aiRoutes);

export { routes };
