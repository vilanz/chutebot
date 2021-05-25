import Discord from 'discord.js';
import { BotCommand } from './parser';

export const handlePing = (command: BotCommand, message: Discord.Message): void => {
  const latency = Date.now() - message.createdTimestamp;
  message.channel.send(`Pong! (latência: ${latency}ms)`);
};
