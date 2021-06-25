import { log } from "../../utils";
import { Player, PlayerSpell } from "../types";
import {
  getCheerioFromPageHTML,
  parseNumberFromNode,
  mapCheerioNodesList,
} from "./utils";

export interface PlayerSearchResult {
  desc: string;
  detailsCareerUrl: string;
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
    return {
      desc: `${playerNameRow.text()} (${clubNameRow.text()})`,
      detailsCareerUrl: playerNameRow
        .find(".hauptlink a")
        .attr("href")!
        .replace("/profil", "/leistungsdatendetails"),
    };
  });
};

export const getPlayerFromTransfermarkt = async (
  careerDetailsUrl: string
): Promise<Player> => {
  const ch = await getCheerioFromPageHTML(careerDetailsUrl);

  const name = ch(".dataName h1").text();
  const transfermarktId = +ch(".spielprofil_tooltip").first().attr("id")!;

  const allCompetitionsColumns = mapCheerioNodesList(
    ch(".grid-view table.items tbody tr")
  );

  type SpellsPerSeasonAndClub = {
    [clubAndSeason: string]: PlayerSpell;
  };

  const allSpells = allCompetitionsColumns.reduce<SpellsPerSeasonAndClub>(
    (accum, column) => {
      const competitionCol = mapCheerioNodesList(column.find("td"));

      const [
        tourneySeasonEl,
        ,
        ,
        tourneyClubEl,
        tourneyMatchesEl,
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

      log(
        `transfermarkt`,
        name,
        currentClubSeason,
        competitionCol.map((x) => `${x.attr("class")} -> ${x.html()}`)
      );

      return {
        ...accum,
        [clubSeasonKey]: {
          ...currentClubSeason,
          matches: currentClubSeason.matches + matchesInTourney,
          goals: currentClubSeason.goals + goalsInTourney,
        },
      };
    },
    {}
  );

  return {
    name,
    transfermarktId,
    spells: Object.values(allSpells),
  };
};
