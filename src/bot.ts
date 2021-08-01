import "reflect-metadata";
import path from "path";
import { getChutebotCommandsMap, parseUserInput } from "./core/command-parser";
import { logger } from "./core/log";
import {
  discordClient,
  dmMeError,
  GUILD,
  prefetchAllUsers,
  sendBotspamMessage,
} from "./core/discord";
import { botToken } from "./core/env";
import { createTypeORMConnection } from "./core/db";
import { removeOutdatedPlayersEveryMonth } from "./core/cronjobs";

void (async () => {
  await createTypeORMConnection();

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

  const chutebotCommandsMap = await getChutebotCommandsMap(
    path.join(__dirname, "./goal-feed/commands"),
    path.join(__dirname, "./trivia/commands")
  );

  discordClient.once("ready", async () => {
    removeOutdatedPlayersEveryMonth();
    await prefetchAllUsers();
    await sendBotspamMessage("Bot iniciado.");
  });

  discordClient.on("message", async (message) => {
    try {
      const isOutsideGuild = message.guild?.id !== GUILD;
      const isBotUser = message.author.bot;
      if (isOutsideGuild || isBotUser) {
        return;
      }

      const userInput = parseUserInput(message.content);
      if (!userInput) {
        return;
      }

      const commandHandler = chutebotCommandsMap.get(userInput.name);
      if (!commandHandler?.permission(message)) {
        return;
      }

      logger.info("running command %s from message %s", userInput, message);
      await commandHandler.run({
        message,
        args: userInput.args,
      });
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
