import { Context } from "hono";
import { AiService } from "../services/ai.service";

const aiService = new AiService();

export class AiController {
  summarize = async (c: Context) => {
    const body = c.get("validated:json") as { text: string };
    const result = await aiService.summarize(body.text);
    return c.json({ result });
  };

  improve = async (c: Context) => {
    const body = c.get("validated:json") as { text: string };
    const result = await aiService.improveText(body.text);
    return c.json({ result });
  };

  tags = async (c: Context) => {
    const body = c.get("validated:json") as { text: string };
    const result = await aiService.generateTags(body.text);
    return c.json({ result: result.split(",").map((tag) => tag.trim()).filter(Boolean) });
  };
}
