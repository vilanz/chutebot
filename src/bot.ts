import path from "path";
import { syncTriviaDatabase } from "./trivia";
import { getChutebotCommandsMap, parseCommand } from "./core/command-parser";
import { logger } from "./core/log";
import { discordClient, dmMeError, sendBotspamMessage } from "./core/discord";
import { botToken } from "./core/env";

void (async () => {
  process.on("message", async (msg) => {
    if (msg !== "shutdown") {
      return;
    }
    if (discordClient.readyTimestamp) {
      await sendBotspamMessage("Bot irá parar.");
    }
    process.exit(0);
  });

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

      const commandHandler = chutebotCommandsMap.get(command.name);

      if (!commandHandler || !commandHandler.permission(message)) {
        return;
      }

      logger.info('running command %s with command %s', commandHandler.commandName, command)
      await commandHandler.handler(message, command.args);
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
