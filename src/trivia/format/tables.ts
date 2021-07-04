import {
  ColumnUserConfig,
  getBorderCharacters,
  table,
  TableUserConfig,
} from "table";
import { PlayerSpell, UserWin } from "../types";
import { removeClubLabels } from "./clubs";
import { sortBySeason } from "./sort-by-season";

const tableWithoutBorders: TableUserConfig = {
  border: getBorderCharacters("norc"),
  columnDefault: {
    paddingLeft: 2,
    paddingRight: 2,
  },
  drawVerticalLine: () => false,
  drawHorizontalLine: (i, qt) => i > 0 && i < qt,
};

const borderlessTableMarkdown = (
  columns: unknown[][],
  config: ColumnUserConfig[]
) => {
  const tableString = table(columns, {
    ...tableWithoutBorders,
    columns: config,
  });
  return `\`\`\`${tableString}\`\`\``;
};

export const formatPlayerSpells = (spells: PlayerSpell[]) =>
  borderlessTableMarkdown(
    [
      ["Temp.", "Clube", "Jogos", "Gols"],
      ...sortBySeason(spells).map((spell) => [
        spell.season,
        removeClubLabels(spell.club),
        spell.matches,
        spell.goals,
      ]),
    ],
    [
      {
        alignment: "left",
      },
      {
        alignment: "left",
      },
      {
        alignment: "right",
      },
      {
        alignment: "right",
      },
    ]
  );

const MAX_USERNAME_LENGTH = 30;

export const formatUserWins = (users: UserWin[]) =>
  borderlessTableMarkdown(
    [
      ["Usuário", "Vitórias"],
      ...users.map((u) => [u.userName.slice(0, MAX_USERNAME_LENGTH), u.wins]),
    ],
    [
      {
        alignment: "left",
      },
      {
        alignment: "right",
      },
    ]
  );
