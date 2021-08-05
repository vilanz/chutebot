import { Cheerio, Node } from "cheerio";
import { Player, PlayerSpell } from "../db";
import {
  getCheerioFromPageHTML,
  parseNumberFromNode,
  mapCheerioNodesList,
  getTransfermarktPlayerCareerUrl,
} from "./cheerio-helpers";

type SpellsPerSeasonAndClub = {
  [clubAndSeason: string]: PlayerSpell;
};

const extractPlayerSpells = (rows: Cheerio<Node>[]): PlayerSpell[] => {
  const spellsPerSeasonAndClub = rows.reduce<SpellsPerSeasonAndClub>(
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

  return Object.values(spellsPerSeasonAndClub);
};

export const fetchPlayerCareer = async (
  transfermarktId: number
): Promise<Omit<Player, "serverId">> => {
  const careerUrl = getTransfermarktPlayerCareerUrl(transfermarktId);
  const ch = await getCheerioFromPageHTML(careerUrl);

  const name = ch(".dataName h1").text();

  const allCompetitionsColumns = mapCheerioNodesList(
    ch(".grid-view table.items tbody tr")
  );

  return {
    transfermarktId,
    name,
    lastSpellsUpdate: new Date(),
    spells: extractPlayerSpells(allCompetitionsColumns),
  };
};
