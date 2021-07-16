import { GuildMember, MessageEmbed } from "discord.js";
import { ChutebotCommand } from "../../core/command-parser";
import { User } from "../../core/db";
import { getUserById, isMessageInBotspam } from "../../core/discord";
import { mapLinebreak } from "../../core/utils";
import { userService } from "../data";

const MAX_USERNAME_LENGTH = 30;

const getUserWinsEmbed = async (users: User[]): Promise<MessageEmbed> => {
  const discordUsers: (GuildMember | null)[] = await Promise.all(
    users.map((u) => getUserById(u.id))
  );

  const discordUserMap = new Map<string, GuildMember>();
  discordUsers.forEach((du) => {
    if (du) {
      discordUserMap.set(du.id, du);
    }
  });

  return new MessageEmbed()
    .setTitle("Placar")
    .addField(
      "Usuário",
      mapLinebreak(users, (u, i) => {
        const discordUser = discordUserMap.get(u.id);
        const name = discordUser
          ? discordUser.displayName.padEnd(MAX_USERNAME_LENGTH, "\u200b")
          : "[SUMIU]";
        return `${i + 1}. ${name}`;
      }),
      true
    )
    .addField(
      "Acertos",
      mapLinebreak(users, (x) => x.wins.toString()),
      true
    )
    .setTimestamp(Date.now())
    .setColor("GOLD");
};

export default {
  commandName: "wins",
  permission: (message) => isMessageInBotspam(message),
  handler: async (message) => {
    const users = userService.getAll();

    await message.reply({
      embeds: [await getUserWinsEmbed(users)],
    });
  },
} as ChutebotCommand;
