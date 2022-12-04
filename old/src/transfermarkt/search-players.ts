/* eslint-disable @typescript-eslint/naming-convention */
import { logger } from "../log";
import {
  getCheerioFromPageHTML,
  getFullTransfermarktUrl,
  getPlayerSearchUrl,
  mapCheerioNodesList,
} from "./cheerio-helpers";

export interface PlayerSearchResult {
  transfermarktId: number;
  transfermarktUrl: string;
  name: string;
  club: string;
  age: string;
  country: string;
  image: string;
}

export const searchPlayersInTransfermarkt = async (
  query: string
): Promise<PlayerSearchResult[]> => {
  const ch = await getCheerioFromPageHTML(getPlayerSearchUrl(query));

  const advancedSearchText = ch("div.table-footer a").text().trim();
  const isPlayerSearchPage =
    advancedSearchText === "Pesquisa avançada - jogadores";
  if (!isPlayerSearchPage) {
    logger.warn("searched %s and probably not a player", query);
    return [];
  }

  const allPlayerRows = mapCheerioNodesList(
    ch("table.items").first().find("> tbody > tr")
  );

  return allPlayerRows.map((row) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [nameAndClubColumn, _position, _club, age, country] =
      mapCheerioNodesList(row.find("> td"));
    const [playerColumn, clubNameRow] = mapCheerioNodesList(
      nameAndClubColumn.find("tbody > tr")
    );

    let playerImageUrl = playerColumn.find("img").attr("src")!;
    if (playerImageUrl) {
      playerImageUrl = playerImageUrl.replace("/small", "/medium");
    }

    const transfermarktUrl = playerColumn.find(".hauptlink a").attr("href")!;
    const transfermarktIdString = transfermarktUrl.slice(
      transfermarktUrl.lastIndexOf("/") + 1,
      transfermarktUrl.length
    );
    const transfermarktId = +transfermarktIdString;
    if (Number.isNaN(transfermarktId)) {
      throw new Error(
        `invalid transfermarktId (${transfermarktIdString}) for query ${query}`
      );
    }

    return {
      transfermarktId,
      transfermarktUrl: getFullTransfermarktUrl(transfermarktUrl),
      name: playerColumn.text(),
      club: clubNameRow.text(),
      age: age.text(),
      country: country.find("img").attr("title") ?? "N/A",
      image: playerImageUrl,
    };
  });
};
