import { parseCommand } from "./core/command-parser";
import { initTriviaDatabase, handleTriviaCommand } from "./trivia";
import { logger } from "./core/log";
import { streamGoalsFeed } from "./goals-feed";
import { discordClient, sendBotspamMessage } from "./core/discord";
import { argv, env } from "./core/env";

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

  const botToken = argv.staging
    ? env.DISCORD_STAGING_BOT_TOKEN
    : env.DISCORD_PROD_BOT_TOKEN;

  await discordClient.login(botToken);
  logger.info("logged in");
});
