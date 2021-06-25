import { PlayerSpell } from "../data/types";

export const formatPlayerSpells = (spells: PlayerSpell[]): string =>
  spells
    .map(
      (spell) =>
        `${spell.season} - ${spell.club} - ${spell.goals} gols em ${spell.matches} jogos`
    )
    .join("\n");
