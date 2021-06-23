import { flag } from "country-emoji";
import { MessageEmbed } from "discord.js";
import { PlayerSpell, PlayerSpellClub } from "../../data";

const formatTransferFee = (transferFee: string): string => {
  switch (transferFee) {
    case "free transfer":
      return "de graça";
    case "loan transfer":
      return "emprestado";
    case "End of loan":
      return "retornando de empréstimo";
    case "-":
      return "arregou";
    case "?":
      return "desconhecido";
    default:
      return transferFee;
  }
};

const formatClub = (club?: PlayerSpellClub): string => {
  if (!club) {
    return "Sem clube";
  }
  // England has no ISO emoji flag
  const country = club.country === "England" ? "UK" : club.country;
  return `${flag(country)} ${club.name}`;
};

export const getPlayerSpellsEmbed = (spells: PlayerSpell[]): MessageEmbed =>
  new MessageEmbed()
    .addFields(
      spells.map((spell) => ({
        name: spell.season,
        value: [
          `:point_right: ${formatClub(spell.to)}`,
          `:point_left: ${formatClub(spell.from)}`,
          `${spell.date.toLocaleDateString()}: ${formatTransferFee(
            spell.transferFee
          )}`,
        ].join("\n"),
      }))
    )
    .setTimestamp();
