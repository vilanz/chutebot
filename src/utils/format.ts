import { getBorderCharacters, table, TableUserConfig } from "table";
import { PlayerSpell, UserWin } from "../data/types";
import { sortBySeason } from "./sort-by-season";

const tableWithoutBorders: TableUserConfig = {
  border: getBorderCharacters("void"),
  columnDefault: {
    paddingLeft: 2,
    paddingRight: 2,
  },
  singleLine: true,
};

const borderlessTableMarkdown = (columns: unknown[][]) =>
  `\`\`\`${table(columns, tableWithoutBorders)}\`\`\``;

export const formatPlayerSpells = (spells: PlayerSpell[]): string =>
  borderlessTableMarkdown([
    ["Temp.", "Time", "Partidas", "Gols"],
    ...sortBySeason(spells).map((spell) => [
      spell.season,
      spell.club,
      spell.matches,
      spell.goals,
    ]),
  ]);

export const formatUserWins = (users: UserWin[]) =>
  borderlessTableMarkdown([
    ["Usuário", "Vitórias"],
    ...users.map((u) => [u.userName, u.wins]),
  ]);
