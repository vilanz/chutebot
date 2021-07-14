import { ChutebotCommand } from "../../core/command-parser";
import { isMessageByOwner } from "../../core/discord";
import { goalFeedStream } from "../goal-feed-stream";

export default {
  commandName: "feed-kill",
  permission: (message) => isMessageByOwner(message),
  handler: async (message) => {
    goalFeedStream.killTweetStream();
    await message.reply("Stream destruída.");
  },
} as ChutebotCommand;
