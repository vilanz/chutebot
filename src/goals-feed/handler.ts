import { Message } from "discord.js";
import { BotCommand, CommandHandler, Commands } from "../core/command-parser";
import { isMessageByOwner, isMessageInFootball } from "../core/discord";
import { GoalFeedStream } from "./goals-feed";

// messy :/
const goalFeedStream = new GoalFeedStream();

const twitterCommand: CommandHandler = async (message, args) => {
  // TODO clean up /shrug
  if (args === "start") {
    await goalFeedStream.streamGoalsFeed(message);
  } else if (args === "stop") {
    await goalFeedStream.stopGoalsFeed(message);
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
    await twitterCommand(message, args);
  }
};
