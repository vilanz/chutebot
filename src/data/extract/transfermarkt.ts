import { log } from "../../log";
import { Player, PlayerSpell } from "../player";
import {
  getCheerioFromPageHTML,
  parseNumberFromNode,
  mapCheerioNodesList,
} from "./utils";

export const getPlayerCareerDetailsLink = async (
  playerName: string
): Promise<string | undefined> => {
  const nameQuery = encodeURIComponent(playerName);
  const ch = await getCheerioFromPageHTML(
    `/schnellsuche/ergebnis/schnellsuche?query=${nameQuery}`
  );

  const playerProfileLink = ch("td.hauptlink a").first().attr("href");

  if (playerProfileLink) {
    return playerProfileLink.replace("/profil", "/leistungsdatendetails");
  }

  return playerProfileLink;
};

export const getPlayerCareerFromTransfermarkt = async (
  careerDetailsUrl: string
): Promise<Player> => {
  const ch = await getCheerioFromPageHTML(careerDetailsUrl);

  const playerName = ch(".dataName h1").text();

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
        playerName,
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
    name: playerName,
    spells: Object.values(allSpells),
  };
};
