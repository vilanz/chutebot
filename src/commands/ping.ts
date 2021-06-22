import { CommandHandler } from "./parser";

export const ping: CommandHandler = (command, message): void => {
  const latency = Date.now() - message.createdTimestamp;
  message.channel.send(`Pong! (latência: ${latency}ms)`);
};
