import { isMessageByOwner, parseChannelMention } from "../../discord";
import { goalFeedStream } from "../../twitter-api";
import { ChutebotCommand } from "..";

export default {
  name: "feed-unsub",
  permission: (message) => isMessageByOwner(message),
  run: async ({ message, args }) => {
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
