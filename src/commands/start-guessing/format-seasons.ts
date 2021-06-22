import { flag } from "country-emoji";
import { MessageEmbed } from "discord.js";
import { PlayerSeason, PlayerSeasonClub } from "../../data";

const formatClub = (club: PlayerSeasonClub): string =>
  `${flag(club.country)} ${club.name}`;

export const getPlayerSeasonsEmbed = (
  playerSeasons: PlayerSeason[]
): MessageEmbed =>
  new MessageEmbed()
    .addFields(
      playerSeasons.map((season) => ({
        name: season.season,
        value: [
          `:point_right: ${formatClub(season.to)}`,
          `:point_left: ${formatClub(season.from)}`,
          `Por ${season.transferFee} em ${season.date.toLocaleDateString()}`,
        ].join("\n"),
      }))
    )
    .setTimestamp();
