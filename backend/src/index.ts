import { serve } from "@hono/node-server";
import { app } from "./app";
import { env } from "./config/env";
import { connectDb } from "./config/db";
import { logger } from "./utils/logger";

const bootstrap = async () => {
  await connectDb();
  serve({ fetch: app.fetch, port: env.PORT }, (info) => {
    logger.info(`Server listening on http://localhost:${info.port}`);
  });
};

bootstrap().catch((error: unknown) => {
  logger.error({ error }, "Failed to start server");
  process.exit(1);
});
