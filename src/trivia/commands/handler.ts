import { Message } from "discord.js";
import { BotCommand, Commands } from "../../core/command-parser";
import { BOTSPAM_CHANNEL_ID } from "../../core/discord";
import { logger } from "../../core/log";
import { addPlayer } from "./add-player";
import { ping } from "./ping";
import { startGuessing } from "./start-guessing";
import { wins } from "./wins";

export const handleTriviaCommand = async (
  command: BotCommand,
  message: Message
) => {
  try {
    if (
      message.channel.id !== BOTSPAM_CHANNEL_ID
      // && message.channel.id !== NATIONAL_TEAMS_CHANNEL_ID
      // && message.author.id !== MY_USER_ID
    ) {
      return;
    }
    const { name, args } = command;
    if (name === Commands.Ping) {
      await ping(message, args);
    } else if (name === Commands.Start) {
      await startGuessing(message, args);
    } else if (name === Commands.AddPlayer) {
      await addPlayer(message, args);
    } else if (name === Commands.Wins) {
      await wins(message, args);
    }
  } catch (err) {
    logger.error("error when running a command", err);
    // message.reply("Ocorreu um erro ao tentar executar esse comando.");
  }
};
