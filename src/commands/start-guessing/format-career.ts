import { PlayerSpell } from "../../data";
/*
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
*/
export const getPlayerSpellsEmbed = (spells: PlayerSpell[]): string =>
  spells
    .map(
      (spell) =>
        `${spell.season} - ${spell.club} - ${spell.goals} gols em ${spell.matches} jogos`
    )
    .join("\n");
