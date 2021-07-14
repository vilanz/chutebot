import { MessageEmbed, Snowflake } from "discord.js";
import { ChutebotCommand } from "../../core/command-parser";
import { getChannel, isMessageByOwner } from "../../core/discord";
import { goalFeedStream } from "../goal-feed-stream";

export default {
  commandName: "feed-status",
  permission: (message) => isMessageByOwner(message),
  handler: async (message) => {
    const subbedChannels = await goalFeedStream.getSubbedChannelRules()

    const isStreamUp = goalFeedStream.streamUp();
    const statusMessage = `Stream ${isStreamUp ? "ativa" : "inativa"}!`;

    const embed = new MessageEmbed()
      .setTitle(statusMessage)
      .addFields(subbedChannels.map(rule => ({
        name: `#${getChannel(rule.tag as Snowflake)?.name ?? 'outro-canal-hihihi'}`,
        value: `Pesquisa: \`${rule.value}\`\nID: \`${rule.id}\``
      })))

    await message.reply({
      embeds: [embed]
    });
  },
} as ChutebotCommand;
