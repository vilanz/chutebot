import { getBorderCharacters, table, TableUserConfig } from "table";
import { PlayerSpell, UserWin } from "../types";
import { sortBySeason } from "./sort-by-season";

const tableWithoutBorders: TableUserConfig = {
  border: getBorderCharacters("void"),
  columnDefault: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  singleLine: true,
};

const borderlessTableMarkdown = (columns: unknown[][]) =>
  `\`\`\`${table(columns, tableWithoutBorders)}\`\`\``;

export const formatPlayerSpells = (spells: PlayerSpell[]): string =>
  borderlessTableMarkdown([
    ["T", "C", "P", "G"],
    ...sortBySeason(spells).map((spell) => [
      spell.season,
      spell.club,
      spell.matches,
      spell.goals,
    ]),
  ]);

const MAX_USERNAME_LENGTH = 25;

export const formatUserWins = (users: UserWin[]) =>
  borderlessTableMarkdown([
    ["Usuário", "Vitórias"],
    ...users.map((u) => [u.userName.slice(0, MAX_USERNAME_LENGTH), u.wins]),
  ]);
