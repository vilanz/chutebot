import { cheerioFromPage, mapCheerioNodesList } from "./utils";

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

type Career = Record<string, any>;

const numberOrZero = (str: string) => (str === "-" ? 0 : +str);

export const scrapPlayerCareerFromTransfermarkt = async (): Promise<Career> => {
  const careerUrl = `https://www.transfermarkt.com.br/taison/leistungsdatendetails/spieler/76028/verein/0/liga/0/wettbewerb//pos/0/trainer_id/0`;
  const ch = await cheerioFromPage(careerUrl);

  const allSeasonsPerClub: Record<string, any> = {};

  const columnsOfCompetitionsPlayedPerClub = mapCheerioNodesList(
    ch(".grid-view table.items tbody tr")
  );

  columnsOfCompetitionsPlayedPerClub.forEach((col) => {
    const competitionCol = mapCheerioNodesList(col.find("td"));

    const [
      tourneySeasonEl,
      ,
      ,
      tourneyClubEl,
      tourneyMatchesEl,
      ,
      tourneyGoalsEl,
    ] = competitionCol;

    const clubName = tourneyClubEl.find("img").attr("alt")!;
    const season = tourneySeasonEl.text();

    const matchesInTourney = numberOrZero(tourneyMatchesEl.text());
    const goalsInTourney = numberOrZero(tourneyGoalsEl.text());

    const careerKey = `${clubName}-${season}`;

    const playerCareer = allSeasonsPerClub[careerKey] ?? {
      matches: 0,
      goals: 0,
    };

    allSeasonsPerClub[careerKey] = {
      matches: playerCareer.matches + matchesInTourney,
      goals: playerCareer.goals + goalsInTourney,
    };
  });

  return allSeasonsPerClub;
};
