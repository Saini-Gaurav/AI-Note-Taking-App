import { Hono } from "hono";
import { z } from "zod";
import { AiController } from "../controllers/ai.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";

const controller = new AiController();
const aiRoutes = new Hono();

const textSchema = z.object({ text: z.string().min(10) });

aiRoutes.use("*", authMiddleware);
aiRoutes.post("/summarize", validate("json", textSchema), controller.summarize);
aiRoutes.post("/improve", validate("json", textSchema), controller.improve);
aiRoutes.post("/tags", validate("json", textSchema), controller.tags);

export { aiRoutes };
