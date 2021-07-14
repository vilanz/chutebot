import { MessageEmbed } from "discord.js";
import { ChutebotCommand } from "../../core/command-parser";
import { isMessageByOwner } from "../../core/discord";
import { goalFeedStream } from "../goal-feed-stream";

export default {
  commandName: "feed-status",
  permission: (message) => isMessageByOwner(message),
  handler: async (message) => {
    const subbedChannels = await goalFeedStream.getSubbedChannels()

    const isStreamUp = goalFeedStream.streamUp();
    const statusMessage = `Stream ${isStreamUp ? "ativa" : "inativa"}!`;

    const embed = new MessageEmbed()
      .setTitle(statusMessage)
      .addFields(subbedChannels.map(ch => ({
        name: `#${ch.ch?.name ?? 'outro-canal-hihihi'}`,
        value: `Pesquisa: ${ch.rule}`
      })))

    await message.reply({
      embeds: [embed]
    });
  },
} as ChutebotCommand;
