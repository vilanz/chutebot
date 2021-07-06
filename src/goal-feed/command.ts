import { Message, TextChannel } from "discord.js";
import { BotCommand, Commands, getSubcommand } from "../core/command-parser";
import { isMessageByOwner } from "../core/discord";
import { GoalFeedStream, STREAM_STOPPED_BY_COMMAND } from "./goal-feed-stream";

const goalFeedStream = new GoalFeedStream();

export const handleGoalFeedCommand = async (
  { name, args }: BotCommand,
  message: Message
) => {
  if (name !== Commands.GoalFeed || !isMessageByOwner(message)) {
    return;
  }

  const [subcommand, subcommandArgs] = getSubcommand(args);

  const channel = message.channel as TextChannel;

  // TODO fix this mess with Commando

  if (subcommand === "start") {
    await goalFeedStream.streamTweets();
    await message.reply("Stream iniciada.");
  } else if (subcommand === "kill") {
    goalFeedStream.destroyTweetStream(STREAM_STOPPED_BY_COMMAND);
    await message.reply("Stream destruída.");
  } else if (subcommand === "status") {
    const subbedChannels = await goalFeedStream.getSubbedChannels();
    const channelRules = subbedChannels.map(({ ch, rule }) => `${ch}: ${rule}`);

    const upMessage = goalFeedStream.streamUp() ? "ativa" : "inativa";
    const statusMessage = [`Stream ${upMessage}!`, ...channelRules].join("\n");

    await message.reply(statusMessage);
  } else if (subcommand === "sub") {
    if (!subcommandArgs.trim()) {
      return;
    }
    await goalFeedStream.subscribeToChannel(channel, subcommandArgs);
    await message.reply(
      `Stream irá postar gols no ${channel} que sejam "${subcommandArgs} has:videos".`
    );
  } else if (subcommand === "unsub") {
    await goalFeedStream.unsubscribeToChannel(channel);
    await message.reply(`Stream não irá mais postar gols no ${channel}.`);
  }
};
