import path from "path";
import { getChutebotCommandsMap, parseCommand } from "./core/command-parser";
import { syncTriviaDatabase } from "./trivia";
import { logger } from "./core/log";
import { discordClient, dmMeError, sendBotspamMessage } from "./core/discord";
import { botToken } from "./core/env";

void (async () => {
  await syncTriviaDatabase();

  logger.info("starting bot");

  const chutebotCommandsMap = await getChutebotCommandsMap(
    path.join(__dirname, "./goal-feed/commands"),
    path.join(__dirname, "./trivia/commands")
  );

  discordClient.on("ready", async () => {
    await sendBotspamMessage("Bot iniciado.");
  });

  discordClient.on("message", async (message) => {
    try {
      const command = parseCommand(message.content);
      if (!command) {
        return;
      }

      const equivalentCommand = chutebotCommandsMap.get(command.name);

      if (!equivalentCommand || !equivalentCommand.permission(message)) {
        return;
      }

      await equivalentCommand.handler(message, command.args);
    } catch (err) {
      await message.react("⚠");
      logger.error("error when running a command", err);
      await dmMeError(err);
    }
  });

  discordClient.on("error", async (err) => {
    logger.error("discord error", { err });
  });

  await discordClient.login(botToken);
  logger.info("logged in");
})();
