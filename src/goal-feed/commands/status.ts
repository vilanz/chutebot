import { ChutebotCommand } from "../../core/command-parser";
import { isMessageByOwner } from "../../core/discord";
import { goalFeedStream } from "../goal-feed-stream";

const StatusGoalFeedCommand: ChutebotCommand = {
  commandName: "feed status",
  permission: (message) => isMessageByOwner(message),
  handler: async (message) => {
    const subbedChannels = await goalFeedStream.getSubbedChannels();
    const channelRules = subbedChannels.map(
      ({ ch, rule }) => `${ch ?? "N/A"}: ${rule}`
    );

    const upMessage = goalFeedStream.streamUp() ? "ativa" : "inativa";
    const statusMessage = [`Stream ${upMessage}!`, ...channelRules].join("\n");

    await message.reply(statusMessage);
  },
};

export default StatusGoalFeedCommand;
