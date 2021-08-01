import { isMessageByOwner, parseChannelMention } from "../../discord";
import { goalFeedStream } from "../../twitter-api";
import { ChutebotCommand, getSubcommand } from "..";

export default {
  name: "feed-sub",
  permission: (message) => isMessageByOwner(message),
  run: async ({ message, args }) => {
    if (!args.trim()) {
      return;
    }
    const [channelString, rule] = getSubcommand(args);

    const channelId = parseChannelMention(channelString);
    if (!channelId) {
      throw new Error("sub sem mention");
    }

    await goalFeedStream.subscribeToChannel(channelId, rule);
    await message.react("👍");
  },
} as ChutebotCommand;
