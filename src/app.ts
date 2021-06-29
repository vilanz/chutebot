import Discord, { Intents } from "discord.js";
import dotenv from "dotenv";
import { Commands, parseCommand } from "./command-parser";
import { ping, startGuessing, addPlayer } from "./trivia/commands";
import { wins } from "./trivia/commands/wins";
import { syncTriviaDatabase, addInitialTriviaPlayers } from "./trivia";
import { logger } from "./log";

dotenv.config();

const client = new Discord.Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

syncTriviaDatabase()
  .then(() => addInitialTriviaPlayers())
  .then(() => {
    logger.info("starting bot");

    client.on("ready", async () => {
      logger.info("started bot");
    });

    client.on("message", async (message) => {
      const command = parseCommand(message.content);
      if (!command || !command.name) {
        return;
      }
      const { name, args } = command;

      try {
        if (name === Commands.Ping) {
          await ping(message, args);
        } else if (name === Commands.Start) {
          await startGuessing(message, args);
        } else if (name === Commands.AddPlayer) {
          await addPlayer(message, args);
        } else if (name === Commands.Wins) {
          await wins(message, args);
        }
      } catch (err) {
        logger.error("error when running a command", err);
        message.reply("Ocorreu um erro ao tentar executar esse comando.");
      }
    });

    client.login(process.env.DISCORD_BOT_TOKEN);
  });