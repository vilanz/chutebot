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

const getJSFilesInPath = (p: string): string[] =>
  fs
    .readdirSync(p)
    .filter((file) => file.endsWith(".js"))
    .map((file) => path.join(p, file));

const getExportedCommandsInDirs = async (
  ...commandPaths: string[]
): Promise<ChutebotCommand[]> => {
  const commandFilenames = commandPaths.flatMap(getJSFilesInPath);

  return Promise.all(
    commandFilenames.map((filename) =>
      import(filename).then(
        (module) => module.default as Promise<ChutebotCommand>
      )
    )
  );
};

export const getChutebotCommandsMap = async (
  ...commandPaths: string[]
): Promise<Map<string, ChutebotCommand>> => {
  const commandsMap = new Map();
  const allCommands = await getExportedCommandsInDirs(...commandPaths);
  allCommands.forEach((command) => {
    commandsMap.set(command.commandName, command);
  });
  return commandsMap;
};

export const noop = () => {};
