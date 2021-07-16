import path from "path";
import { getChutebotCommandsMap, parseCommand } from "./core/command-parser";
import { logger } from "./core/log";
import {
  discordClient,
  dmMeError,
  GUILD,
  sendBotspamMessage,
} from "./core/discord";
import { botToken } from "./core/env";
import { syncDatabase } from "./core/db";

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

  await syncDatabase();

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

      if (message.guild?.id !== GUILD) {
        return;
      }

      const commandHandler = chutebotCommandsMap.get(command.name);

      if (!commandHandler || !commandHandler.permission(message)) {
        return;
      }

      logger.info("running command %s from message %s", command, message);
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
