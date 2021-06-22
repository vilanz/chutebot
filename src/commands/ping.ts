import { CommandHandler } from "./parser";

export const ping: CommandHandler = (command, message) => {
  const latency = Math.abs(Date.now() - message.createdTimestamp);
  message.channel.send(`Pong! (latência: ${latency}ms)`);
};
