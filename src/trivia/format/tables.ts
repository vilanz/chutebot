import { Alignment, getBorderCharacters, table, TableUserConfig } from "table";
import { PlayerSpell, UserWin } from "../types";
import { sortBySeason } from "./sort-by-season";

const tableWithoutBorders: TableUserConfig = {
  border: getBorderCharacters("norc"),
  columnDefault: {
    paddingLeft: 2,
    paddingRight: 2,
  },
  drawVerticalLine: () => false,
};

const borderlessTableMarkdown = (
  columns: unknown[][],
  columnAlignments: Alignment[]
) => {
  const tableString = table(columns, {
    ...tableWithoutBorders,
    columns: columnAlignments.map((align) => ({ alignment: align })),
  });
  return `\`\`\`${tableString}\`\`\``;
};

export const formatPlayerSpells = (spells: PlayerSpell[]): string =>
  borderlessTableMarkdown(
    [
      ["Temp.", "Clube", "Jogos", "Gols"],
      ...sortBySeason(spells).map((spell) => [
        spell.season,
        spell.club,
        spell.matches,
        spell.goals,
      ]),
    ],
    ["left", "left", "right", "right"]
  );

const MAX_USERNAME_LENGTH = 25;

export const formatUserWins = (users: UserWin[]) =>
  borderlessTableMarkdown(
    [
      ["Usuário", "Vitórias"],
      ...users.map((u) => [u.userName.slice(0, MAX_USERNAME_LENGTH), u.wins]),
    ],
    ["left", "right"]
  );
