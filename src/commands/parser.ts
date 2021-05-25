import Discord from 'discord.js';

const BOT_PREFIX = 'g!';

export interface BotCommand {
  name: string
  args: string
}

export type CommandHandler = (botCommand: BotCommand, message: Discord.Message) => void;

const MATCH_FIRST_WORD_UNTIL_SPACE_AND_REST = new RegExp(`^${BOT_PREFIX}([^ ]+) ?(.*)`, 'g'); // yeah :(
export const parseCommand = (content: string): BotCommand | null => {
  if (!content.startsWith(BOT_PREFIX)) {
    return null;
  }

  const matched = [...content.matchAll(MATCH_FIRST_WORD_UNTIL_SPACE_AND_REST)];
  if (matched === null || !matched.length) {
    return null;
  }

  const [name, args] = matched[0].slice(1);
  if (!name) {
    return null;
  }

  return {
    name,
    args,
  };
};
