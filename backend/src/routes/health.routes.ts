import { Hono } from "hono";
import { HealthController } from "../controllers/health.controller";

const healthRoutes = new Hono();
const controller = new HealthController();

healthRoutes.get("/", controller.health);

export { healthRoutes };
