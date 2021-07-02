import { parseCommand } from "./core/command-parser";
import { initTriviaDatabase, handleTriviaCommand } from "./trivia";
import { logger } from "./core/log";
import { streamGoalsFeed } from "./goals-feed";
import { discordClient, sendBotspamMessage } from "./core/discord";
import { botToken } from "./core/env";

void initTriviaDatabase().then(async () => {
  logger.info("starting bot");

  discordClient.on("ready", async () => {
    await sendBotspamMessage("Bot iniciado.");
    try {
      await streamGoalsFeed();
    } catch (err) {
      logger.error("twitter stream", err);
    }
  });

  discordClient.on("message", async (message) => {
    const command = parseCommand(message.content);
    if (!command) {
      return;
    }

    await handleTriviaCommand(command, message);
  });

  discordClient.on("rateLimit", (rateLimitData) => {
    logger.warn("discord rate limit", {
      rateLimitData,
    });
  });

  await discordClient.login(botToken);
  logger.info("logged in");
});
