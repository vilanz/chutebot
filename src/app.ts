import Discord, { Intents } from "discord.js";
import { parseCommand } from "./command-parser";
import {
  syncTriviaDatabase,
  addInitialTriviaPlayers,
  handleTriviaCommand,
} from "./trivia";
import { logger } from "./log";
import { env } from "./env";
import { fetchTwitter } from "./goals-feed";

syncTriviaDatabase()
  .then(() => addInitialTriviaPlayers())
  .then(() => {
    const client = new Discord.Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      ],
    });

    logger.info("starting bot");

    client.on("ready", async () => {
      logger.info("started bot");
      await fetchTwitter(client);
    });

    client.on("message", async (message) => {
      const command = parseCommand(message.content);
      if (!command || !command.name) {
        return;
      }

      handleTriviaCommand(command, message);
    });

    client.login(env.DISCORD_BOT_TOKEN);
  });
