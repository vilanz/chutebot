import Discord from "discord.js";
import dotenv from "dotenv";
import {
  parseCommand,
  ping,
  startGuessing,
  Commands,
  addPlayer,
} from "./commands";

dotenv.config();

const client = new Discord.Client();

client.on("ready", () => {
  console.log("Started bot.");
});

client.on("message", async (message) => {
  const command = parseCommand(message.content);
  if (!command || !command.name) {
    return;
  }

  const { name } = command;

  if (name === Commands.Ping) {
    ping(command, message);
  } else if (name === Commands.Start) {
    startGuessing(command, message);
  } else if (name === Commands.AddPlayer) {
    addPlayer(command, message);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
