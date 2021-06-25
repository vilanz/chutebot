import { PlayerSpell } from "../data/types";

const getSeasonDetails = (season: string) => {
  if (!season.includes("/")) {
    return {
      start: +season,
      end: +season,
    };
  }
  const [start, end] = season.split("/").map((x) => parseInt(x, 10) + 2000);
  return {
    start,
    end,
  };
};

// exported for unit tests
export const compareSeason = (seasonA: string, seasonB: string): number => {
  const seasonADetails = getSeasonDetails(seasonA);
  const seasonBDetails = getSeasonDetails(seasonB);

  const startDiff = seasonADetails.start - seasonBDetails.start;
  const endDiff = seasonADetails.end - seasonBDetails.end;

  return startDiff + endDiff;
};

export const sortBySeason = (spells: PlayerSpell[]): PlayerSpell[] =>
  [...spells].sort((a, b) => compareSeason(a.season, b.season));
