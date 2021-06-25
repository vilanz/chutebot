import Discord, { Intents } from "discord.js";
import dotenv from "dotenv";
import { Commands, parseCommand } from "./command-parser";
import { ping, startGuessing, addPlayer } from "./commands";
import { syncDatabase } from "./data";
import { addInitialPlayersIfNeeded } from "./data/add-initial-players";

dotenv.config();

const client = new Discord.Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

client.on("ready", async () => {
  await syncDatabase();
  await addInitialPlayersIfNeeded();
  console.log("Started bot.");
});

client.on("message", async (message) => {
  const command = parseCommand(message.content);
  if (!command || !command.name) {
    return;
  }

  const { name, args } = command;

  if (name === Commands.Ping) {
    ping(message, args);
  } else if (name === Commands.Start) {
    startGuessing(message, args);
  } else if (name === Commands.AddPlayer) {
    addPlayer(message, args);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
