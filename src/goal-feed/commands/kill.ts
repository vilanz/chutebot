import { ChutebotCommand } from "../../core/command-parser";
import { isMessageByOwner } from "../../core/discord";
import { goalFeedStream } from "../twitter-api";

export default {
  commandName: "feed-kill",
  permission: (message) => isMessageByOwner(message),
  run: async ({ message }) => {
    goalFeedStream.killTweetStream();
    await message.reply("Stream destruída.");
  },
} as ChutebotCommand;
