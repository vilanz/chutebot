import fetch from "node-fetch";
import cheerio, {
  Cheerio,
  CheerioAPI,
  Element as CheerioElement,
} from "cheerio";
import { log } from "../log";
import { Player, PlayerSpell, PlayerSpellClub } from "./player";

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

const getPlayerProfileLink = async (
  playerName: string
): Promise<string | undefined> => {
  const nameQuery = encodeURIComponent(playerName);
  const ch = await getTransfermarktCheerio(
    `/schnellsuche/ergebnis/schnellsuche?query=${nameQuery}`
  );

  return ch("td.hauptlink a").first().attr("href");
};

export const getPlayerFromTransfermarkt = async (
  playerName: string
): Promise<Player> => {
  const playerProfileLink = await getPlayerProfileLink(playerName);
  if (!playerProfileLink) {
    throw new Error("No players found");
  }

  log("transfermarkt", `Going to ${playerProfileLink}.`);

  const ch = await getTransfermarktCheerio(playerProfileLink);

  return {
    name: ch(".dataName h1 b").text(),
    spells: ch(".transferhistorie tr.zeile-transfer")
      .map((_, row) => getSeasonFromRow(row))
      .toArray(),
  };
};
