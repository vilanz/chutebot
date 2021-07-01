import { CommandHandler } from "../../core/command-parser";

export const ping: CommandHandler = async (message) => {
  const pingMessage = await message.channel.send(`Ping...`);
  const latency = pingMessage.createdTimestamp - message.createdTimestamp;
  pingMessage.edit(`Pong! (${latency}ms)`);
};
