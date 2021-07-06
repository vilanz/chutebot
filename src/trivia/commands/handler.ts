import { Message } from "discord.js";
import {
  BotCommand,
  CommandHandler,
  Commands,
  noop,
} from "../../core/command-parser";
import { isMessageInBotspam } from "../../core/discord";
import { addPlayer } from "./add-player";
import { help } from "./help";
import { listPlayerIds } from "./list-player-ids";
import { ping } from "./ping";
import { playerCount } from "./player-count";
import { removePlayer } from "./remove-player";
import { startGuessing } from "./start-guessing";
import { wins } from "./wins";

export const handleTriviaCommand = async (
  { name, args }: BotCommand,
  message: Message
): Promise<CommandHandler | void> => {
  if (!isMessageInBotspam(message)) {
    return noop;
  }
  switch (name) {
    case Commands.Ping:
      return ping(message, args);
    case Commands.Start:
      return startGuessing(message, args);
    case Commands.AddPlayer:
      return addPlayer(message, args);
    case Commands.Wins:
      return wins(message, args);
    case Commands.Help:
      return help(message, args);
    case Commands.Remove:
      return removePlayer(message, args);
    case Commands.ListPlayerIds:
      return listPlayerIds(message, args);
    case Commands.PlayerCount:
      return playerCount(message, args);
    default:
      return noop;
  }
};
