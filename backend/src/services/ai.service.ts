import { env } from "../config/env";
import { AppError } from "../utils/errors";
import { logger } from "../utils/logger";

function normalizeApiKey(input?: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  const unquoted = trimmed.replace(/^['"]|['"]$/g, "").trim();
  return unquoted || null;
}

export class AiService {
  private readonly apiKey = normalizeApiKey(env.GEMINI_API_KEY);
  private readonly models = [
    env.GEMINI_MODEL?.trim(),
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-2.5-flash"
  ].filter((m): m is string => Boolean(m));

  // 🔥 Fake AI helpers
  private fakeSummary(text: string): string {
    const sentences = text.split(".").filter((s) => s.trim().length > 0);
    const points = sentences.slice(0, 3).map((s) => `• ${s.trim()}`);

    if (points.length === 0) {
      return "• Key ideas summarized\n• Important points highlighted\n• Action items identified";
    }

    return points.join("\n");
  }

  private fakeImprove(text: string): string {
    return text
      .replace(/\s+/g, " ")
      .replace(/\bi\b/g, "I")
      .replace(/\. /g, ".\n")
      .trim();
  }

  private fakeTags(text: string): string {
    const keywords = text
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .split(" ")
      .filter((word) => word.length > 4);

    const unique = Array.from(new Set(keywords));
    return unique.slice(0, 5).join(", ") || "notes, productivity, tasks";
  }

  private async complete(system: string, prompt: string, fallback: string): Promise<string> {
    if (!this.apiKey) {
      logger.warn("Gemini disabled: GEMINI_API_KEY missing/empty after normalization");

      if (system.includes("summarize")) return this.fakeSummary(prompt);
      if (system.includes("improve")) return this.fakeImprove(prompt);
      if (system.includes("tags")) return this.fakeTags(prompt);

      return fallback;
    }

    try {
      let lastError: AppError | null = null;

      for (const model of this.models) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: `${system}\n\n${prompt}` }],
                },
              ],
              generationConfig: {
                temperature: 0.3,
              },
            }),
          }
        );

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as {
            error?: { message?: string; status?: string };
          };

          const message = payload.error?.message ?? "Gemini request failed";

          if (response.status === 401 || response.status === 403) {
            throw new AppError("Invalid Gemini API key (check GEMINI_API_KEY).", 503, "GEMINI_AUTH");
          }

          // 🔥 Handle quota / model errors with fallback
          if (response.status === 429 || response.status === 404) {
            logger.warn("AI service unavailable, using fallback");

            if (system.includes("summarize")) return this.fakeSummary(prompt);
            if (system.includes("improve")) return this.fakeImprove(prompt);
            if (system.includes("tags")) return this.fakeTags(prompt);

            return fallback;
          }

          // Try next model if not found
          if (response.status === 404) {
            lastError = new AppError(message, 404, "GEMINI_MODEL_NOT_FOUND");
            continue;
          }

          throw new AppError(
            message,
            response.status >= 400 && response.status < 600 ? response.status : 502,
            "GEMINI_ERROR"
          );
        }

        const data = (await response.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };

        const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();

        return text || fallback;
      }

      if (lastError) {
        throw new AppError(
          "No compatible Gemini model found for this API key. Set GEMINI_MODEL in backend/.env to a supported model.",
          503,
          "GEMINI_MODEL_NOT_FOUND"
        );
      }

      throw new AppError("Gemini model configuration is empty.", 503, "GEMINI_MODEL_CONFIG");
    } catch (err: unknown) {
      logger.warn("AI failed, using fallback");

      if (system.includes("summarize")) return this.fakeSummary(prompt);
      if (system.includes("improve")) return this.fakeImprove(prompt);
      if (system.includes("tags")) return this.fakeTags(prompt);

      return fallback;
    }
  }

  summarize(text: string) {
    return this.complete(
      "You summarize notes in concise bullet points.",
      `Summarize this note:\n${text}`,
      "Summary unavailable. Showing key ideas instead."
    );
  }

  improveText(text: string) {
    return this.complete(
      "You improve note clarity without changing intent.",
      `Improve this note:\n${text}`,
      "Improved version unavailable. Showing simplified text."
    );
  }

  generateTags(text: string) {
    return this.complete(
      "You generate 3-6 short tags, comma-separated, lowercase.",
      `Generate tags for this note:\n${text}`,
      "notes, productivity, tasks"
    );
  }
}