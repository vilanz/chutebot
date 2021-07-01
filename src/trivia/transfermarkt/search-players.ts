import { logger } from "../../core/log";
import {
  getCheerioFromPageHTML,
  getPlayerSearchUrl,
  mapCheerioNodesList,
} from "./fetching";

export interface PlayerSearchResult {
  desc: string;
  transfermarktId: number;
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
    const [playerNameRow, clubNameRow] = mapCheerioNodesList(
      row.find("tbody > tr")
    );

    const desc = `${playerNameRow.text()} (${clubNameRow.text()})`;

    const playerProfileUrl = playerNameRow.find(".hauptlink a").attr("href")!;
    const transfermarktIdString = playerProfileUrl.slice(
      playerProfileUrl.lastIndexOf("/") + 1,
      playerProfileUrl.length
    );
    const transfermarktId = +transfermarktIdString;
    if (Number.isNaN(transfermarktId)) {
      throw new Error(
        `invalid transfermarktId (${transfermarktIdString}) for ${desc}`
      );
    }

    return {
      desc,
      transfermarktId,
    };
  });
};
