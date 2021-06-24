import { log } from "../../log";
import { Player, PlayerSpell } from "../player";
import {
  cheerioFromPage,
  parseNumberFromNode,
  mapCheerioNodesList,
} from "./utils";

/*
const parseClubColumns = (
  countryEl: Cheerio<CheerioElement>,
  clubEl: Cheerio<CheerioElement>
): PlayerSpellClub | undefined => {
  const clubName = clubEl.text();
  if (clubName === "Without Club") {
    return undefined;
  }
  return {
    name: clubName,
    country: countryEl.find("img").attr("title")!,
  };
};

const getTransfermarktCheerio = async (url: string): Promise<CheerioAPI> =>
  fetch(`https://www.transfermarkt.com${url}`, {
    method: "GET",
  })
    .then((r) => r.text())
    .then((html) => cheerio.load(html));

const getSeasonFromRow = (rowElement: CheerioElement): PlayerSpell => {
  const [
    seasonEl,
    dateEl,
    fromCountryEl,
    fromClubEl,
    toCountryEl,
    toClubEl,
    priceEl,
  ] = cheerio(rowElement)
    .find("td.zentriert, td.flagge, td.vereinsname a, td.zelle-abloese")
    .get()
    .map((el) => cheerio(el));

  return {
    season: seasonEl.text(),
    date: new Date(dateEl.text()),
    from: parseClubColumns(fromCountryEl, fromClubEl),
    to: parseClubColumns(toCountryEl, toClubEl),
    transferFee: priceEl.text(),
  };
};

export const getPlayerProfileLink = async (
  playerName: string
): Promise<string | undefined> => {
  const nameQuery = encodeURIComponent(playerName);
  const ch = await getTransfermarktCheerio(
    `/schnellsuche/ergebnis/schnellsuche?query=${nameQuery}`
  );

  return ch("td.hauptlink a").first().attr("href");
};

export const getPlayerFromTransfermarkt = async (
  playerUrl: string
): Promise<Player> => {
  log("transfermarkt", `Going to ${playerUrl}.`);

  const ch = await getTransfermarktCheerio(playerUrl);

  return {
    name: ch(".dataName h1 b").text(),
    spells: ch(".transferhistorie tr.zeile-transfer")
      .map((_, row) => getSeasonFromRow(row))
      .toArray(),
  };
};
*/

type PlayerSpellsWoo = Record<string, PlayerSpell>;

export const scrapPlayerCareerFromTransfermarkt = async (
  url: string
): Promise<Player> => {
  const ch = await cheerioFromPage(url);

  const allCompetitionsColumns = mapCheerioNodesList(
    ch(".grid-view table.items tbody tr")
  );

  const allSeasonsPerClub = allCompetitionsColumns.reduce<PlayerSpellsWoo>(
    (accum, column) => {
      const competitionCol = mapCheerioNodesList(column.find("td"));

      const [
        tourneySeasonEl,
        ,
        ,
        tourneyClubEl,
        tourneyMatchesEl,
        ,
        tourneyGoalsEl,
      ] = competitionCol;

      const club = tourneyClubEl.find("img").attr("alt")!;
      const season = tourneySeasonEl.text();

      const matchesInTourney = parseNumberFromNode(tourneyMatchesEl);
      const goalsInTourney = parseNumberFromNode(tourneyGoalsEl);

      const clubSeasonKey = `${club}-${season}`;

      const currentClubSeason = accum[clubSeasonKey] ?? {
        club,
        season,
        matches: 0,
        goals: 0,
      };

      log("transfermarkt", currentClubSeason);

      return {
        ...accum,
        [clubSeasonKey]: {
          ...currentClubSeason,
          matches: matchesInTourney + currentClubSeason.matches,
          goals: goalsInTourney + currentClubSeason.goals,
        },
      };
    },
    {}
  );

  log("transfermarkt", allSeasonsPerClub);

  return {
    name: "Taiso",
    spells: Object.values(allSeasonsPerClub),
  };
};
