import { MessageEmbed } from "discord.js";
import { ChutebotCommand } from "../../core/command-parser";
import { isMessageByOwner } from "../../core/discord";

export default {
  commandName: "list",
  permission: (message) => isMessageByOwner(message),
  handler: async ({ message, args, playerRepo }) => {
    const playerName = args.trim();
    if (!playerName) {
      return;
    }

    const players = playerRepo.searchPlayers(playerName);
    if (!players.length) {
      await message.reply("Ninguém encontrado.");
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(`Busca por ${playerName}`)
      .addFields(
        players.map((p) => ({
          name: p.name,
          value: `#${p.transfermarktId}\nÚltima atualização: ${p.lastSpellsUpdate}`,
        }))
      );

    await message.reply({
      embeds: [embed],
    });
  },
} as ChutebotCommand;
