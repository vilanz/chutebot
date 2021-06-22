import { flag } from "country-emoji";
import { MessageEmbed } from "discord.js";
import { getPlayerFromTransfermarkt, Player, PlayerSeasonClub } from "../data";
import { log } from "../log";
import { CommandHandler, Commands } from "./parser";

const formatClub = (club: PlayerSeasonClub): string =>
  `${flag(club.country)} ${club.name}`;

const getPlayerEmbed = (player: Player): MessageEmbed =>
  new MessageEmbed()
    .setTitle(player.name)
    .addFields(
      player.seasons.map((season) => ({
        name: season.season,
        value: [
          `:point_right: ${formatClub(season.to)}`,
          `:point_left: ${formatClub(season.from)}`,
          `Por ${season.transferFee} em ${season.date.toLocaleDateString()}`,
        ].join("\n"),
      }))
    )
    .setTimestamp();

export const addPlayer: CommandHandler = async (command, message) => {
  try {
    const playerName = command.args;
    log(Commands.AddPlayer, `Will try to add ${playerName}.`);

    const player = await getPlayerFromTransfermarkt(playerName);

    const embed = getPlayerEmbed(player);
    message.channel.send(embed);
  } catch (ex) {
    message.reply("Não rolou.");
    log(Commands.AddPlayer, "An error ocurred.", ex);
  }
};
