import { ChutebotCommand } from "../../core/command-parser";
import { isMessageByOwner } from "../../core/discord";
import { goalFeedStream } from "../goal-feed-stream";

export default {
  commandName: "feed-start",
  permission: (message) => isMessageByOwner(message),
  handler: async (message) => {
    await goalFeedStream.streamTweets();
    await message.reply("Stream iniciada.");
  },
} as ChutebotCommand;
