import { MessageEmbed } from "discord.js";
import { ChutebotCommand } from "../../core/command-parser";
import { Player } from "../../core/db/entities";
import { isMessageByOwner } from "../../core/discord";

export default {
  name: "list",
  permission: (message) => isMessageByOwner(message),
  run: async ({ message, args, playerRepo }) => {
    const searchQuery = args.trim();
    if (!searchQuery) {
      return;
    }

    const players = await Player.createQueryBuilder()
      .where("name like :searchQuery", { searchQuery: `%${searchQuery}%` })
      .limit(6)
      .getMany();
    if (!players.length) {
      await message.reply("Ninguém encontrado.");
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(`Busca por ${searchQuery}`)
      .addFields(
        players.map((p) => ({
          name: p.name,
          value: `#${p.transfermarktId}\nÚltima atualização: ${p.lastSpellsUpdate}`,
          inline: true,
        }))
      );

    await message.reply({
      embeds: [embed],
    });
  },
} as ChutebotCommand;
