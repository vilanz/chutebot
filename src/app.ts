import { parseCommand } from "./core/command-parser";
import { initTriviaDatabase, handleTriviaCommand } from "./trivia";
import { logger } from "./core/log";
import { env } from "./core/env";
import { streamGoalsFeed } from "./goals-feed";
import { discordClient } from "./core/discord";

initTriviaDatabase().then(() => {
  logger.info("starting bot");

  discordClient.on("ready", async () => {
    logger.info("started bot");
    await streamGoalsFeed();
  });

  discordClient.on("message", async (message) => {
    const command = parseCommand(message.content);
    if (!command) {
      return;
    }

    handleTriviaCommand(command, message);
  });

  discordClient.login(env.DISCORD_BOT_TOKEN);
});
