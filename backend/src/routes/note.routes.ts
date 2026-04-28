import { Hono } from "hono";
import { z } from "zod";
import { NoteController } from "../controllers/note.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";

const controller = new NoteController();
const noteRoutes = new Hono();

const noteCreateSchema = z.object({
  title: z.string().min(1).max(200),
  /** Empty body is allowed for new “Untitled” notes until the user writes something */
  content: z.string().max(100_000).default(""),
  tags: z.array(z.string().min(1)).optional(),
});

const noteUpdateSchema = noteCreateSchema.partial().refine((v) => Object.keys(v).length > 0, {
  message: "At least one field is required"
});

const idParamSchema = z.object({ id: z.string().min(1) });
const noteAiParamSchema = z.object({
  id: z.string().min(1),
  action: z.enum(["summarize", "improve", "tags"]),
});
const listQuerySchema = z.object({ q: z.string().optional() });

noteRoutes.use("*", authMiddleware);
noteRoutes.get("/", validate("query", listQuerySchema), controller.list);
noteRoutes.post("/", validate("json", noteCreateSchema), controller.create);
noteRoutes.post("/:id/ai/:action", validate("param", noteAiParamSchema), controller.aiAction);
noteRoutes.get("/:id", validate("param", idParamSchema), controller.getById);
noteRoutes.patch(
  "/:id",
  validate("param", idParamSchema),
  validate("json", noteUpdateSchema),
  controller.update
);
/** Alias for PATCH — REST clients often use PUT for full replacement */
noteRoutes.put(
  "/:id",
  validate("param", idParamSchema),
  validate("json", noteUpdateSchema),
  controller.update
);
noteRoutes.delete("/:id", validate("param", idParamSchema), controller.remove);

export { noteRoutes };
