import { isMessageByOwner } from "../../discord";
import { goalFeedStream } from "../../twitter-api";
import { ChutebotCommand } from "../parser";

export default {
  name: "feed-start",
  permission: (message) => isMessageByOwner(message),
  run: async ({ message }) => {
    await goalFeedStream.streamTweets();
    await message.reply("Stream iniciada.");
  },
} as ChutebotCommand;
