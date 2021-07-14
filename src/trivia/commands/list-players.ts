import { ChutebotCommand } from "../../core/command-parser";
import { isMessageByOwner } from "../../core/discord";
import { searchPlayersByName } from "../db";

export default {
  commandName: "list",
  permission: (message) => isMessageByOwner(message),
  handler: async (message, args) => {
    const playerName = args.trim();
    if (!playerName) {
      return;
    }

    const players = await searchPlayersByName(playerName);
    if (!players.length) {
      await message.reply("Ninguém encontrado.");
      return;
    }

    const formattedPlayers = players
      .map(
        (p) =>
          `${p.transfermarktId}: **${p.name}**, ${
            p.spells?.length ?? "N/A"
          } clubes`
      )
      .join("\n");

    await message.reply({
      embeds: [
        {
          description: formattedPlayers,
        },
      ],
    });
  },
} as ChutebotCommand;
