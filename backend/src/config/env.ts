import path from "node:path";
import { config as loadDotenv } from "dotenv";
import { z } from "zod";

// Load `.env` from the backend package root (npm scripts cwd)
loadDotenv({ path: path.resolve(process.cwd(), ".env") });

const isProduction = process.env.NODE_ENV === "production";

/** Development-only defaults so `npm run dev` works without copying `.env` first. */
const DEV_MONGODB_URI = "mongodb://127.0.0.1:27017/ai-notes-pro";
const DEV_JWT_ACCESS_SECRET =
  "dev-only-access-secret-min-16-chars-change-me!!";
const DEV_JWT_REFRESH_SECRET =
  "dev-only-refresh-secret-min-16-chars-change-me!";

function buildEnvInput(): Record<string, string | undefined> {
  const input: Record<string, string | undefined> = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
  };

  if (!isProduction) {
    if (!input.MONGODB_URI?.trim()) {
      input.MONGODB_URI = DEV_MONGODB_URI;
      console.warn(
        `[env] MONGODB_URI not set; using default ${DEV_MONGODB_URI} (create backend/.env to override)`
      );
    }
    if (!input.JWT_ACCESS_SECRET || input.JWT_ACCESS_SECRET.length < 16) {
      input.JWT_ACCESS_SECRET = DEV_JWT_ACCESS_SECRET;
      console.warn(
        "[env] JWT_ACCESS_SECRET missing or short; using a dev-only default (set JWT_ACCESS_SECRET in backend/.env for production)"
      );
    }
    if (!input.JWT_REFRESH_SECRET || input.JWT_REFRESH_SECRET.length < 16) {
      input.JWT_REFRESH_SECRET = DEV_JWT_REFRESH_SECRET;
      console.warn(
        "[env] JWT_REFRESH_SECRET missing or short; using a dev-only default (set JWT_REFRESH_SECRET in backend/.env for production)"
      );
    }
  }

  return input;
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 chars"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET must be at least 16 chars"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  /** Comma-separated list, e.g. `http://localhost:3000,https://myapp.vercel.app` */
  CORS_ORIGIN: z.string().optional(),
});

const parsed = envSchema.safeParse(buildEnvInput());

if (!parsed.success) {
  throw new Error(
    `Invalid environment configuration.\n${parsed.error.message}\n\n` +
      `Fix: copy backend/.env.example to backend/.env and set MONGODB_URI, JWT_ACCESS_SECRET (16+ chars), JWT_REFRESH_SECRET (16+ chars).\n` +
      `Run the API from the backend folder: npm run dev`
  );
}

export const env = parsed.data;
