import Discord from "discord.js";

export interface BotCommand {
  name: string;
  args: string;
}

export type CommandHandler = (
  botCommand: BotCommand,
  message: Discord.Message
) => void | Promise<void>;

export enum Commands {
  Ping = "ping",
  Start = "start",
  Guess = "g",
}

const BOT_PREFIX = "c!";

export const parseCommand = (content: string): BotCommand | null => {
  if (!content.startsWith(BOT_PREFIX)) {
    return null;
  }

  const allArgs = content.slice(BOT_PREFIX.length).trim().split(/ +/);

  const name = allArgs[0].toLowerCase();
  if (!name) {
    return null;
  }

  const args = allArgs.slice(1).join(" ");

  return { name, args };
};
