import { MessageEmbed } from "discord.js";
import { mapLinebreak } from "../../core/utils";
import { PlayerSpell } from "../types";
import { removeClubLabels } from "./clubs";
import { sortBySeason } from "./sort-by-season";

// TODO this isn't tables anymore, extract this back to the commands

export const formatPlayerSpells = (spells: PlayerSpell[]): MessageEmbed => {
  const sortedSpells = sortBySeason(spells);
  return new MessageEmbed()
    .setTitle("Quem é?")
    .addField(
      "Temp.",
      mapLinebreak(sortedSpells, (x) => x.season),
      true
    )
    .addField(
      "Time",
      mapLinebreak(sortedSpells, (x) => removeClubLabels(x.club)),
      true
    )
    .addField(
      "P (G)",
      mapLinebreak(sortedSpells, (x) => `${x.matches} (${x.goals})`),
      true
    )
    .setColor("AQUA")
    .setTimestamp(Date.now());
};
