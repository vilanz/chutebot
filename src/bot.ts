import "reflect-metadata";
import { getChutebotCommandsMap, handleMessageCommand } from "./commands";
import { logger } from "./log";
import { discordClient, prefetchAllUsers, sendBotspamMessage } from "./discord";
import { botToken } from "./env";
import { createTypeORMConnection } from "./db";
import { removeOutdatedPlayersEveryMonth } from "./cron";

void (async () => {
  await createTypeORMConnection();

  const chutebotCommandsMap = await getChutebotCommandsMap();

  process.on("message", async (msg) => {
    if (msg !== "shutdown") {
      return;
    }
    if (discordClient.readyTimestamp) {
      await sendBotspamMessage("Bot irá parar.");
    }
    process.exit(0);
  });

  logger.info("starting bot");

  discordClient.once("ready", async () => {
    removeOutdatedPlayersEveryMonth();
    await prefetchAllUsers();
    await sendBotspamMessage("Bot iniciado.");
  });

  discordClient.on("message", async (m) => {
    await handleMessageCommand(m, chutebotCommandsMap);
  });

  discordClient.on("error", async (err) => {
    logger.error("discord error", { err });
  });

  discordClient.on("rateLimit", (rateLimitData) => {
    // reactions are heavily rate-limited anyway
    if (rateLimitData.route.endsWith("/messages/:id/reactions")) {
      return;
    }
    logger.info("discord rate limit", rateLimitData);
  });

  await discordClient.login(botToken);
  logger.info("logged in");
})();
