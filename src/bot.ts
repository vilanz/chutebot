import { parseCommand } from "./core/command-parser";
import { initTriviaDatabase, handleTriviaCommand } from "./trivia";
import { logger } from "./core/log";
import { discordClient, dmMeError, sendBotspamMessage } from "./core/discord";
import { botToken } from "./core/env";
import { handleGoalFeedCommand } from "./goal-feed";

void (async () => {
  await initTriviaDatabase();

  logger.info("starting bot");

  discordClient.on("ready", async () => {
    await sendBotspamMessage("Bot iniciado.");
  });

  discordClient.on("message", async (message) => {
    const command = parseCommand(message.content);
    if (!command) {
      return;
    }

    try {
      await handleTriviaCommand(command, message);
      await handleGoalFeedCommand(command, message);
    } catch (err) {
      logger.error("error when running a command", err);
      await dmMeError(err);
      await message.react("⚠");
    }
  });

  discordClient.on("rateLimit", (rateLimitData) => {
    logger.warn("discord rate limit", {
      rateLimitData,
    });
  });

  await discordClient.login(botToken);
  logger.info("logged in");
})();
