import { Message, TextChannel } from "discord.js";
import { dmMeError } from "../discord";
import { logger } from "../log";
import { ChutebotCommandMap } from "./map-commands";
import { parseUserInput } from "./parser";

export const handleMessageCommand = async (
  message: Message,
  chutebotCommandsMap: ChutebotCommandMap
) => {
  try {
    const isBotUser = message.author.bot;
    if (isBotUser) {
      return;
    }

    const userInput = parseUserInput(message.content);
    if (!userInput) {
      return;
    }

    const commandHandler = chutebotCommandsMap.get(userInput.name);
    if (!commandHandler?.permission(message)) {
      return;
    }

    const serverId = message.guildId!;

    logger.info(
      "running command %s from message %s in server %s",
      userInput,
      message,
      serverId
    );
    await commandHandler.run({
      message,
      args: userInput.args,
      textChannel: message.channel as TextChannel,
      serverId,
    });
  } catch (err) {
    await message.react("⚠");
    logger.error("error when running a command", err);
    await dmMeError(err);
  }
};
