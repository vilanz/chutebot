import { CommandHandler } from "../command-parser";

export const ping: CommandHandler = (message) => {
  const latency = Math.abs(Date.now() - message.createdTimestamp);
  message.channel.send(`Pong! (latência: ${latency}ms)`);
};
