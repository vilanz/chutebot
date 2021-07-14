import { Snowflake } from "discord.js";
import { ChutebotCommand, getSubcommand } from "../../core/command-parser";
import { isMessageByOwner } from "../../core/discord";
import { goalFeedStream } from "../goal-feed-stream";

const SubGoalFeedCommand: ChutebotCommand = {
  commandName: "feed sub",
  permission: (message) => isMessageByOwner(message),
  handler: async (message, args) => {
    if (!args.trim()) {
      return;
    }
    const [channelId, rule] = getSubcommand(args);
    await goalFeedStream.subscribeToChannel(channelId as Snowflake, rule);
    await message.react("👍");
  },
};

export default SubGoalFeedCommand;
