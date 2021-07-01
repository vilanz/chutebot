import { Message } from "discord.js";
import { BotCommand, Commands } from "../../core/command-parser";
import { dmMeError, isMessageInBotspam } from "../../core/discord";
import { logger } from "../../core/log";
import { addPlayer } from "./add-player";
import { help } from "./help";
import { ping } from "./ping";
import { startGuessing } from "./start-guessing";
import { wins } from "./wins";

export const handleTriviaCommand = async (
  command: BotCommand,
  message: Message
) => {
  try {
    if (!isMessageInBotspam(message)) {
      return;
    }
    // this could be a switch but I'd rather refactor to something better
    // maybe Commando.js?
    const { name, args } = command;
    if (name === Commands.Ping) {
      await ping(message, args);
    } else if (name === Commands.Start) {
      await startGuessing(message, args);
    } else if (name === Commands.AddPlayer) {
      await addPlayer(message, args);
    } else if (name === Commands.Wins) {
      await wins(message, args);
    } else if (name === Commands.Help) {
      await help(message, args)
    }
  } catch (err) {
    logger.error("error when running a command", err);
    void dmMeError(err)
    await message.reply('⚠')
  }
};
