import { Snowflake } from "discord.js";
import { ChutebotCommand } from "../../core/command-parser";
import { isMessageByOwner } from "../../core/discord";
import { goalFeedStream } from "../goal-feed-stream";

const UnsubGoalFeedCommand: ChutebotCommand = {
  commandName: "feed unsub",
  permission: (message) => isMessageByOwner(message),
  handler: async (message, args) => {
    if (!args.trim()) {
      return;
    }
    await goalFeedStream.unsubscribeToChannel(args as Snowflake);
    await message.react("👍");
  },
};

export default UnsubGoalFeedCommand;
