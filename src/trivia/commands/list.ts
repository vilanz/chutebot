import { format } from "date-fns";
import { ChutebotCommand } from "../../core/command-parser";
import { PlayerEntity } from "../../core/db/entities";
import { isMessageByOwner } from "../../core/discord";
import { linebreak } from "../../core/utils";

export default {
  name: "list",
  permission: (message) => isMessageByOwner(message),
  run: async ({ message, args }) => {
    const searchQuery = args.trim();
    if (!searchQuery) {
      return;
    }

    const players = await PlayerEntity.createQueryBuilder("player")
      .leftJoinAndSelect("player.spells", "spells")
      .orderBy("random()")
      .where("name like :searchQuery", { searchQuery: `%${searchQuery}%` })
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
