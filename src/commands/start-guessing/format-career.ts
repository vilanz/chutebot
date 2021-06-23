import { flag } from "country-emoji";
import { MessageEmbed } from "discord.js";
import { PlayerSpell, PlayerSpellClub } from "../../data";

const formatClub = (club?: PlayerSpellClub): string =>
  club ? `${flag(club.country)} ${club.name}` : "Sem clube";

export const getPlayerSpellsEmbed = (spells: PlayerSpell[]): MessageEmbed =>
  new MessageEmbed()
    .addFields(
      spells.map((spell) => ({
        name: spell.season,
        value: [
          `:point_right: ${formatClub(spell.to)}`,
          `:point_left: ${formatClub(spell.from)}`,
          `Por ${spell.transferFee} em ${spell.date.toLocaleDateString()}`,
        ].join("\n"),
      }))
    )
    .setTimestamp();
