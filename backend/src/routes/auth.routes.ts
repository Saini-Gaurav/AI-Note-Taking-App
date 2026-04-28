import { Hono } from "hono";
import { z } from "zod";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";

const controller = new AuthController();
const authRoutes = new Hono();

const registerSchema = z.object({
  email: z.email(),
  name: z.string().min(2),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(20)
});

authRoutes.post("/register", validate("json", registerSchema), controller.register);
authRoutes.post("/login", validate("json", loginSchema), controller.login);
authRoutes.post("/refresh", validate("json", refreshSchema), controller.refresh);
authRoutes.post("/logout", validate("json", refreshSchema), controller.logout);
authRoutes.get("/me", authMiddleware, controller.me);

export { authRoutes };
