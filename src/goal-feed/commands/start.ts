import { ChutebotCommand } from "../../core/command-parser";
import { isMessageByOwner } from "../../core/discord";
import { goalFeedStream } from "../twitter-api";

export default {
  commandName: "feed-start",
  permission: (message) => isMessageByOwner(message),
  run: async ({ message }) => {
    await goalFeedStream.streamTweets();
    await message.reply("Stream iniciada.");
  },
} as ChutebotCommand;
