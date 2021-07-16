import { MessageEmbed } from "discord.js";
import { ChutebotCommand } from "../../core/command-parser";
import { isMessageByOwner } from "../../core/discord";
import { playerService } from "../data";

export default {
  commandName: "list",
  permission: (message) => isMessageByOwner(message),
  handler: async (message, args) => {
    const playerName = args.trim();
    if (!playerName) {
      return;
    }

    const players = playerService.searchPlayers(playerName);
    if (!players.length) {
      await message.reply("Ninguém encontrado.");
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(`Busca por ${playerName}`)
      .addFields(
        players.map((p) => ({
          name: `${p.name} (#${p.transfermarktId})`,
          value: `Última atualização: ${p.lastSpellsUpdate}`,
        }))
      );

    await message.reply({
      embeds: [embed],
    });
  },
} as ChutebotCommand;
