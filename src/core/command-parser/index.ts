import Discord from "discord.js";

export interface BotCommand {
  name: string;
  args: string;
}

export type CommandHandler = (
  message: Discord.Message,
  args: string
) => void | Promise<void>;

export enum Commands {
  Ping = "ping",
  Start = "start",
  Guess = "g",
  AddPlayer = "add",
  Wins = "wins",
  Help = "help"
}

export const BOT_PREFIX = "c!";

export const parseCommand = (content: string): BotCommand | null => {
  if (!content.startsWith(BOT_PREFIX)) {
    return null;
  }

  const [commandName, ...commandArgs] = content
    .slice(BOT_PREFIX.length)
    .trim()
    .split(/ +/);

  if (!commandName) {
    return null;
  }

  return {
    name: commandName.toLowerCase(),
    args: commandArgs.join(" "),
  };
};
