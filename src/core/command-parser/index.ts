import { Message } from "discord.js";
import fs from "fs";
import path from "path";

export interface BotCommand {
  name: string;
  args: string;
}

export type CommandHandler = (
  message: Message,
  args: string
) => void | Promise<void>;

export type ChutebotCommand = {
  commandName: string;
  permission: (message: Message) => boolean;
  handler: CommandHandler;
};

export enum Commands {
  Ping = "ping",
  Start = "start",
  Guess = "g",
  AddPlayer = "add",
  Wins = "wins",
  Help = "help",
  GoalFeed = "feed",
  Remove = "remove",
  ListPlayerIds = "list-ids",
  PlayerCount = "count",
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

export const getSubcommand = (args: string) => {
  const [subcommand, ...subcommandArgs] = args.split(" ");
  return [subcommand, subcommandArgs.join(" ")];
};

export const getChutebotCommands = async (
  commandsPath: string
): Promise<ChutebotCommand[]> => {
  const commandFilenames = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"))
    .map((file) => path.join(commandsPath, file));

  return Promise.all(
    commandFilenames.map((filename) =>
      import(filename).then(
        (module) => module.default as Promise<ChutebotCommand>
      )
    )
  );
};

export const noop = () => {};
