const COMMON_AFFIXES = [
  "FC",
  "CF",
  "SE",
  "UC",
  "CR",
  "CF",
  "CSD",
  "FR",
  "SC",
  "AD",
  "EC",
  "ACF",
  "FBPA",
  "RSC",
  "AS",
  "Clube?",
  "Club de",
  "Clube do",
  "(SP)",
  "CD",
  "CA",
  "SL",
  "AC",
  "Futebol Clube do",
  "A.S.",
  "AA",
  "de Desportos (SP)",
  "Associação",
  "Esporte Clube",
  "Sport Lisboa e",
  "Calcio",
  "de La Plata",
  "Clube de Portugal",
  "AFC",
  "Asociación Atlética",
].join("|");

const REMOVE_PREFIXES = new RegExp(`^(${COMMON_AFFIXES}) `);
const REMOVE_SUFFIXES = new RegExp(` (${COMMON_AFFIXES})$`);

const COMMON_LONG_NAMES: Record<string, string> = {
  "West Ham United": "West Ham",
  "de Gimnasia y Esgrima La Plata": "Gimnasia y Esgrima",
  // I swear every club in Argentina has Atlético
  // but we can't remove every Atlético!
  "Atlético Independiente": "Independiente",
  "Atlético River Plate": "River Plate",
  "Atlético San Lorenzo de Almagro": "San Lorenzo",
  "Atlético Rosario Central": "Rosario Central",
  "Atlético Colón": "Colón",
  "Atlético Boca Juniors": "Boca Juniors",
  "Atlético Banfield": "Banfield",
  "Atlético Unión": "Unión",
};

export const removeClubLabels = (clubName: string) => {
  // remove common preffixes/suffixes
  const clubNameWithoutPreffixOrSuffix = clubName
    .replace(REMOVE_PREFIXES, "")
    .replace(REMOVE_SUFFIXES, "");
  return (
    COMMON_LONG_NAMES[clubNameWithoutPreffixOrSuffix] ??
    clubNameWithoutPreffixOrSuffix
  );
};
