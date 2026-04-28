import { Context } from "hono";
import { AiService } from "../services/ai.service";
import { NoteService } from "../services/note.service";
import { AppError } from "../utils/errors";

const noteService = new NoteService();
const aiService = new AiService();

export class NoteController {
  create = async (c: Context) => {
    const user = c.get("currentUser") as { id: string };
    const body = c.get("validated:json") as { title: string; content: string; tags?: string[] };
    const note = await noteService.create(user.id, body);
    return c.json(note, 201);
  };

  list = async (c: Context) => {
    const user = c.get("currentUser") as { id: string };
    const query = c.get("validated:query") as { q?: string };
    const notes = await noteService.list(user.id, query.q);
    return c.json(notes);
  };

  getById = async (c: Context) => {
    const user = c.get("currentUser") as { id: string };
    const params = c.get("validated:param") as { id: string };
    const note = await noteService.getById(user.id, params.id);
    return c.json(note);
  };

  update = async (c: Context) => {
    const user = c.get("currentUser") as { id: string };
    const params = c.get("validated:param") as { id: string };
    const body = c.get("validated:json") as { title?: string; content?: string; tags?: string[] };
    const note = await noteService.update(user.id, params.id, body);
    return c.json(note);
  };

  remove = async (c: Context) => {
    const user = c.get("currentUser") as { id: string };
    const params = c.get("validated:param") as { id: string };
    const result = await noteService.remove(user.id, params.id);
    return c.json(result);
  };

  /** AI runs on stored note content (same paths the frontend originally used). */
  aiAction = async (c: Context) => {
    const user = c.get("currentUser") as { id: string };
    const params = c.get("validated:param") as { id: string; action: "summarize" | "improve" | "tags" };
    const note = await noteService.getById(user.id, params.id);
    const text = [note.title?.trim(), note.content?.trim()].filter(Boolean).join("\n\n").trim();
    if (text.length < 10) {
      throw new AppError("Note needs at least 10 characters for AI.", 400, "NOTE_TOO_SHORT");
    }
    switch (params.action) {
      case "summarize": {
        const result = await aiService.summarize(text);
        return c.json({ result });
      }
      case "improve": {
        const result = await aiService.improveText(text);
        return c.json({ result });
      }
      case "tags": {
        const raw = await aiService.generateTags(text);
        const tags = raw.split(",").map((t) => t.trim()).filter(Boolean);
        return c.json({ result: tags });
      }
    }
  };
}
