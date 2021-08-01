import { MessageEmbed, Snowflake } from "discord.js";
import { getChannel, isMessageByOwner } from "../../discord";
import { goalFeedStream } from "../../twitter-api";
import { ChutebotCommand } from "..";

export default {
  name: "feed-status",
  permission: (message) => isMessageByOwner(message),
  run: async ({ message }) => {
    const subbedChannels = await goalFeedStream.getSubbedChannelRules();

    const isStreamUp = goalFeedStream.streamUp();
    const statusMessage = `Stream ${isStreamUp ? "ativa" : "inativa"}!`;

    const embed = new MessageEmbed().setTitle(statusMessage).addFields(
      subbedChannels.map((rule) => ({
        name: `#${
          getChannel(rule.tag as Snowflake)?.name ?? "outro-canal-hihihi"
        }`,
        value: `Pesquisa: \`${rule.value}\`\nID: \`${rule.id}\``,
      }))
    );

    await message.reply({
      embeds: [embed],
    });
  },
} as ChutebotCommand;
