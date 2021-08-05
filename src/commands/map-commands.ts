import { Message, TextChannel } from "discord.js";
import fs from "fs";
import path from "path";

export interface CommandContext {
  message: Message;
  args: string;
  textChannel: TextChannel;
  serverId: string;
}

export type ChutebotCommand = {
  name: string;
  permission: (message: Message) => boolean;
  run: (ctx: CommandContext) => void | Promise<void>;
};

const getExportedCommandsInDirs = async (
  ...commandPaths: string[]
): Promise<ChutebotCommand[]> => {
  const commandFilenames: string[] = commandPaths.flatMap((p: string) =>
    fs
      .readdirSync(p)
      .filter((file) => file.endsWith(".js"))
      .map((file) => path.join(p, file))
  );

  return Promise.all(
    commandFilenames.map((filename) =>
      import(filename).then(
        (module) => module.default as Promise<ChutebotCommand>
      )
    )
  );
};

export type ChutebotCommandMap = Map<string, ChutebotCommand>;

export const getChutebotCommandsMap = async (): Promise<ChutebotCommandMap> => {
  const commandsMap = new Map();
  const allCommands = await getExportedCommandsInDirs(
    path.join(__dirname, "./goal-feed"),
    path.join(__dirname, "./trivia")
  );
  allCommands.forEach((command) => {
    commandsMap.set(command.name, command);
  });
  return commandsMap;
};
