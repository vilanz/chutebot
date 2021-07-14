import { MessageEmbed } from "discord.js";
import { PlayerSpell, UserWin } from "../types";
import { removeClubLabels } from "./clubs";
import { sortBySeason } from "./sort-by-season";

// TODO this isn't tables anymore, extract this back to the commands

const breakLines = <T extends unknown>(
  list: T[],
  mapping: (t: T, i: number) => string
) => list.map((x, i) => mapping(x, i)).join("\n");

export const formatPlayerSpells = (spells: PlayerSpell[]): MessageEmbed => {
  const sortedSpells = sortBySeason(spells);
  return new MessageEmbed()
    .setTitle("Quem é?")
    .addField(
      "Temp.",
      breakLines(sortedSpells, (x) => x.season),
      true
    )
    .addField(
      "Time",
      breakLines(sortedSpells, (x) => removeClubLabels(x.club)),
      true
    )
    .addField(
      "P (G)",
      breakLines(sortedSpells, (x) => `${x.matches} (${x.goals})`),
      true
    )
    .setColor("AQUA")
    .setTimestamp(Date.now());
};

const MAX_USERNAME_LENGTH = 30;

export const formatUserWins = (userWins: UserWin[]): MessageEmbed =>
  new MessageEmbed()
    .setTitle("Placar")
    .addField(
      "\u200b",
      breakLines(userWins, (_, i) => `${i + 1}.`),
      true
    )
    .addField(
      "Usuário",
      breakLines(userWins, (x) =>
        x.userName.padEnd(MAX_USERNAME_LENGTH, "\u200b")
      ),
      true
    )
    .addField(
      "Vitórias",
      breakLines(userWins, (x) => x.wins.toString()),
      true
    )
    .setTimestamp(Date.now())
    .setColor("GOLD");
