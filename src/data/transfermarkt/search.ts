import { log } from "../../utils";
import { getCheerioFromPageHTML, mapCheerioNodesList } from "./utils";

export interface PlayerSearchResult {
  desc: string;
  transfermarktId: number;
}

export const searchPlayersInTransfermarkt = async (
  playerName: string
): Promise<PlayerSearchResult[]> => {
  const nameQuery = encodeURIComponent(playerName);
  const ch = await getCheerioFromPageHTML(
    `/schnellsuche/ergebnis/schnellsuche?query=${nameQuery}`
  );

  const advancedSearchText = ch("div.table-footer a").text().trim();
  const isPlayerSearchPage =
    advancedSearchText === "Pesquisa avançada - jogadores";
  if (!isPlayerSearchPage) {
    return [];
  }

  const allPlayerRows = mapCheerioNodesList(
    ch("table.items").first().find("> tbody > tr")
  );

  return allPlayerRows.map((row) => {
    const [playerNameRow, clubNameRow] = mapCheerioNodesList(
      row.find("tbody > tr")
    );

    const playerProfileUrl = playerNameRow.find(".hauptlink a").attr("href")!;
    const transfermarktIdString = playerProfileUrl.slice(
      playerProfileUrl.lastIndexOf("/") + 1,
      playerProfileUrl.length
    );
    const transfermarktId = +transfermarktIdString;
    if (Number.isNaN(transfermarktId)) {
      throw new Error(
        `searchPlayersInTransfermarkt: transfermarktId inválido! (${transfermarktIdString})`
      );
    }

    return {
      desc: `${playerNameRow.text()} (${clubNameRow.text()})`,
      transfermarktId,
    };
  });
};
