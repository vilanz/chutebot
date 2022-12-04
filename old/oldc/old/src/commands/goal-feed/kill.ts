import { isMessageByOwner } from "../../discord";
import { goalFeedStream } from "../../twitter-api";
import { ChutebotCommand } from "..";

export default {
  name: "feed-kill",
  permission: (message) => isMessageByOwner(message),
  run: async ({ message }) => {
    goalFeedStream.killTweetStream();
    await message.reply("Stream destruída.");
  },
} as ChutebotCommand;
