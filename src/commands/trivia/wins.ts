import { MessageEmbed, Snowflake } from "discord.js";
import { UserEntity } from "../../db";
import { getUsersByIds, isMessageInBotspam } from "../../discord";
import { EMPTY_CHAR, mapLinebreak } from "../../utils";
import { ChutebotCommand } from "..";

const getUserWinsEmbed = async (users: UserEntity[]): Promise<MessageEmbed> => {
  const discordUsers = await getUsersByIds(users.map((u) => u.id));

  return new MessageEmbed()
    .setTitle("Placar")
    .addField(
      "P",
      mapLinebreak(users, (x) => x.wins.toString()),
      true
    )
    .addField(
      "Usuário",
      mapLinebreak(users, (u, i) => {
        const discordUser = discordUsers.get(u.id as Snowflake);
        const name = discordUser || "[SUMIU]";
        return `**${i + 1}.** ${name}`;
      }),
      true
    )
    .addField(EMPTY_CHAR, EMPTY_CHAR, true)
    .setTimestamp(Date.now())
    .setColor("GOLD");
};

export default {
  name: "wins",
  permission: (message) => isMessageInBotspam(message),
  run: async ({ message }) => {
    const allUsers = await UserEntity.find({
      order: {
        wins: "DESC",
      },
    });
    await message.channel.send({
      embeds: [await getUserWinsEmbed(allUsers)],
      allowedMentions: {
        parse: [],
      },
    });
  },
} as ChutebotCommand;
