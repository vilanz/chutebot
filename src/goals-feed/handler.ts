import { Message, TextChannel } from "discord.js";
import { BotCommand, Commands, getSubcommand } from "../core/command-parser";
import { isMessageByOwner } from "../core/discord";
import { GoalFeedStream } from "./goals-feed";
import { getRulesByChannel } from "./twitter-api";

const goalFeedStream = new GoalFeedStream();

export const handleTwitterCommand = async (
  { name, args }: BotCommand,
  message: Message
) => {
  if (name !== Commands.GoalFeed || !isMessageByOwner(message)) {
    return;
  }

  const [subcommand, subcommandArgs] = getSubcommand(args);

  const goalFeed = await goalFeedStream.addGoalFeedToChannel(
    message.channel as TextChannel
  );

  if (subcommand === "stream") {
    await goalFeed.streamTweets();
  } else if (subcommand === "reset-channel-rules") {
    await goalFeed.resetRules(subcommandArgs);
  } else if (subcommand === "get-channel-rules") {
    const allRules = await getRulesByChannel(message.channel.id);
    await message.reply(JSON.stringify(allRules) ?? "não tem regras 🤔");
  }

  await message.react("👍");
};
