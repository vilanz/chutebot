import { format } from "date-fns";
import { PlayerEntity } from "../../db/entities";
import { isMessageByOwner } from "../../discord";
import { linebreak } from "../../utils";
import { ChutebotCommand } from "..";

export default {
  name: "list",
  permission: (message) => isMessageByOwner(message),
  run: async ({ message, args, serverId }) => {
    const searchQuery = args.trim();
    if (!searchQuery) {
      return;
    }

    const players = await PlayerEntity.createQueryBuilder("player")
      .leftJoinAndSelect("player.spells", "spells")
      .where("player.serverId = :serverId", { serverId })
      .where("name like :searchQuery", { searchQuery: `%${searchQuery}%` })
      .orderBy("random()")
      .limit(6)
      .getMany();
    if (!players.length) {
      await message.reply("Ninguém encontrado.");
      return;
    }

    await message.reply({
      embeds: [
        {
          title: `Busca por ${searchQuery}`,
          fields: players.map((p) => {
            const formattedLastSpellsUpdate = format(p.lastSpellsUpdate, "Pp");
            return {
              name: p.name,
              value: linebreak(
                `#${p.transfermarktId}`,
                `${p.spells.length} passagens`,
                `Atualizado em ${formattedLastSpellsUpdate}`
              ),
              inline: true,
            };
          }),
        },
      ],
    });
  },
} as ChutebotCommand;
