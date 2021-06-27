import Discord, { Intents } from "discord.js";
import dotenv from "dotenv";
import { Commands, parseCommand } from "./command-parser";
import { ping, startGuessing, addPlayer } from "./commands";
import { syncDatabaseModels } from "./data";
import { addInitialPlayersIfNeeded } from "./data/add-initial-players";
import { logger } from "./log";

dotenv.config();

const client = new Discord.Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

client.on("ready", async () => {
  await syncDatabaseModels();
  await addInitialPlayersIfNeeded();
  logger.info("Started bot.");
});

client.on("message", async (message) => {
  const command = parseCommand(message.content);
  if (!command || !command.name) {
    return;
  }
  const { name, args } = command;

  try {
    if (name === Commands.Ping) {
      ping(message, args);
    } else if (name === Commands.Start) {
      startGuessing(message, args);
    } else if (name === Commands.AddPlayer) {
      addPlayer(message, args);
    }
  } catch (err) {
    logger.error(err);
    message.reply("Ocorreu um erro ao tentar executar esse comando.");
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
