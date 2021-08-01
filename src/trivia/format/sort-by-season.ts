import { PlayerSpell } from "../../core/db";

const currentYear = new Date().getFullYear();

const getHalfSeasonYear = (season: string): number => {
  const seasonAs21thCentury = +season + 2000;
  if (seasonAs21thCentury > currentYear) {
    // 70s, 80s, 90s, etc.
    // oh boy I hope this bot isn't running anymore by 2060!
    return +season + 1900;
  }
  return seasonAs21thCentury;
};

const getSeasonDetails = (season: string) => {
  if (!season.includes("/")) {
    return {
      start: +season,
      end: +season,
    };
  }
  const [start, end] = season.split("/").map((x) => getHalfSeasonYear(x));
  return {
    start,
    end,
  };
};

// exported for unit tests
export const compareSeason = (seasonA: string, seasonB: string): number => {
  const seasonADetails = getSeasonDetails(seasonA);
  const seasonBDetails = getSeasonDetails(seasonB);

  const startDiff = seasonBDetails.start - seasonADetails.start;
  const endDiff = seasonBDetails.end - seasonADetails.end;

  return startDiff + endDiff;
};

export const sortBySeason = (spells: PlayerSpell[]): PlayerSpell[] =>
  [...spells].sort((a, b) => compareSeason(a.season, b.season));
