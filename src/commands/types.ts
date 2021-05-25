import Discord from 'discord.js';

export interface BotCommand {
  name: string
  args: string
}

export type CommandHandler = (
  botCommand: BotCommand, message: Discord.Message
) => void | Promise<void>;
