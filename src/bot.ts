import { parseCommand } from "./core/command-parser";
import { handleTriviaCommand, syncTriviaDatabase } from "./trivia";
import { logger } from "./core/log";
import { discordClient, dmMeError, sendBotspamMessage } from "./core/discord";
import { botToken } from "./core/env";
import { handleGoalFeedCommand } from "./goal-feed";

void (async () => {
  await syncTriviaDatabase();

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

  await discordClient.login(botToken);
  logger.info("logged in");
})();
