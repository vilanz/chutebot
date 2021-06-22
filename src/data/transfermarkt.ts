import fetch from "node-fetch";
import cheerio, { CheerioAPI, Element as CheerioElement } from "cheerio";
import { log } from "../log";
import { Player, PlayerSpell } from "./player";

const getTransfermarktCheerio = async (url: string): Promise<CheerioAPI> =>
  fetch(`https://www.transfermarkt.com${url}`, {
    method: "GET",
  })
    .then((r) => r.text())
    .then((html) => cheerio.load(html));

const getSeasonFromRow = (rowElement: CheerioElement): PlayerSpell => {
  const [season, date, fromCountry, from, toCountry, to, price] = cheerio(
    rowElement
  )
    .find(
      "td.zentriert, td.flagge img.flaggenrahmen, td.vereinsname a, td.zelle-abloese"
    )
    .get()
    .map((el) => cheerio(el));
  return {
    season: season.text(),
    date: new Date(date.text()),
    from: {
      country: fromCountry.attr("title")!,
      name: from.text(),
    },
    to: {
      country: toCountry.attr("title")!,
      name: to.text(),
    },
    transferFee: price.text(),
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
