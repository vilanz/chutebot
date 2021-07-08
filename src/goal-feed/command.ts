import { Message, Snowflake } from "discord.js";
import { BotCommand, Commands, getSubcommand } from "../core/command-parser";
import { isMessageByOwner } from "../core/discord";
import { GoalFeedStream } from "./goal-feed-stream";

const goalFeedStream = new GoalFeedStream();

export const handleGoalFeedCommand = async (
  { name, args }: BotCommand,
  message: Message
) => {
  if (name !== Commands.GoalFeed || !isMessageByOwner(message)) {
    return;
  }

  const [subcommand, subcommandArgs] = getSubcommand(args);

  // TODO fix this mess with Commando

  if (subcommand === "start") {
    await goalFeedStream.streamTweets();
    await message.reply("Stream iniciada.");
  } else if (subcommand === "kill") {
    goalFeedStream.killTweetStream();
    await message.reply("Stream destruída.");
  } else if (subcommand === "status") {
    const subbedChannels = await goalFeedStream.getSubbedChannels();
    const channelRules = subbedChannels.map(({ ch, rule }) => `${ch ?? 'N/A'}: ${rule}`);

    const upMessage = goalFeedStream.streamUp() ? "ativa" : "inativa";
    const statusMessage = [`Stream ${upMessage}!`, ...channelRules].join("\n");

    await message.reply(statusMessage);
  } else if (subcommand === "sub") {
    if (!subcommandArgs.trim()) {
      return;
    }
    const [channelId, rule] = getSubcommand(subcommandArgs);
    await goalFeedStream.subscribeToChannel(channelId as Snowflake, rule);
    await message.react('👍');
  } else if (subcommand === "unsub") {
    if (!subcommandArgs.trim()) {
      return;
    }
    await goalFeedStream.unsubscribeToChannel(subcommandArgs as Snowflake);
    await message.reply('👍');
  }
};
