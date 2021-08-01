import { Message, TextChannel } from "discord.js";
import fs from "fs";
import path from "path";

export interface UserInput {
  name: string;
  args: string;
}

export interface CommandContext {
  message: Message;
  args: string;
  textChannel: TextChannel;
}

export type ChutebotCommand = {
  name: string;
  permission: (message: Message) => boolean;
  run: (ctx: CommandContext) => void | Promise<void>;
};

export const BOT_PREFIX = "c!";

export const parseUserInput = (content: string): UserInput | null => {
  if (!content.startsWith(BOT_PREFIX)) {
    return null;
  }

  const [name, ...args] = content.slice(BOT_PREFIX.length).trim().split(/ +/);

  if (!name) {
    return null;
  }

  return {
    name: name.toLowerCase(),
    args: args.join(" "),
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
    commandsMap.set(command.name, command);
  });
  return commandsMap;
};
