import Discord from "discord.js";
import dotenv from "dotenv";
import { parseCommand, ping, startGuessing } from "./commands";
import { Commands } from "./commands/types";

dotenv.config();

const client = new Discord.Client();

client.on("ready", () => {
  console.log("Started bot.");
});

client.on("message", (message) => {
  const command = parseCommand(message.content);
  if (!command) {
    return;
  }

  const { name } = command;

  if (name === Commands.Ping) {
    ping(command, message);
  } else if (name === Commands.Start) {
    startGuessing(command, message);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
