import { ChutebotCommand } from "../../core/command-parser";
import { isMessageByOwner, parseChannelMention } from "../../core/discord";
import { goalFeedStream } from "../twitter-api";

export default {
  commandName: "feed-unsub",
  permission: (message) => isMessageByOwner(message),
  handler: async ({ message, args }) => {
    if (!args.trim()) {
      return;
    }

    const channelId = parseChannelMention(args);
    if (!channelId) {
      throw new Error("unsub sem channel");
    }

    await goalFeedStream.unsubscribeToChannel(channelId);
    await message.react("👍");
  },
} as ChutebotCommand;
