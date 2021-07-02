import { Message } from "discord.js";
import { BotCommand, CommandHandler, Commands } from "../core/command-parser";
import { isMessageByOwner, isMessageInFootball } from "../core/discord";
import { stopGoalsFeed, streamGoalsFeed } from "./goals-feed";

const twitterCommand: CommandHandler = (message, args) => {
  // TODO clean up /shrug
  if (args === "start") {
    void streamGoalsFeed(message);
  } else if (args === "stop") {
    void stopGoalsFeed(message);
  }
};

export const handleTwitterCommand = async (
  { name, args }: BotCommand,
  message: Message
) => {
  if (!isMessageInFootball(message) || !isMessageByOwner(message)) {
    return;
  }
  if (name === Commands.GoalFeed) {
    void twitterCommand(message, args);
  }
};
