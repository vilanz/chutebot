import { Message } from "discord.js";
import { BotCommand, Commands } from "../core/command-parser";
import { isMessageByOwner, isMessageInFootball } from "../core/discord";
import { GoalFeedStream } from "./goals-feed";

// using a variable for this isn't so great :/
const goalFeedStream = new GoalFeedStream();

export const handleTwitterCommand = async (
  { name, args }: BotCommand,
  message: Message
) => {
  if (!isMessageInFootball(message) || !isMessageByOwner(message)) {
    return;
  }
  if (name === Commands.GoalFeed) {
    if (args === "start") {
      await goalFeedStream.startGoalsFeed(message);
    } else if (args === "stop") {
      await goalFeedStream.stopGoalsFeed(message);
    }
  }
};
