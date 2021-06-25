import { getBorderCharacters, table, TableUserConfig } from "table";
import { PlayerSpell } from "../data/types";
import { sortBySeason } from "./sort-by-season";

const tableWithoutBorders: TableUserConfig = {
  border: getBorderCharacters("void"),
  columnDefault: {
    paddingLeft: 2,
    paddingRight: 2,
  },
  singleLine: true,
};

export const formatPlayerSpells = (spells: PlayerSpell[]): string => {
  const spellColumns = [
    ["Temp.", "Time", "Partidas", "Gols"],
    ...sortBySeason(spells).map((spell) => [
      spell.season,
      spell.club,
      spell.matches,
      spell.goals,
    ]),
  ];
  const spellsTable = table(spellColumns, tableWithoutBorders);
  return `\`\`\`${spellsTable}\`\`\``;
};
