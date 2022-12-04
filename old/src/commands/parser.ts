export interface UserInput {
  name: string;
  args: string;
}

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
